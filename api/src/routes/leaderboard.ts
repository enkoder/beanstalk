import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import {
  GetLeaderboardRow,
  GetLeaderboardRowType,
  GetLeaderboardSchema,
  GetSeasonsResponse,
  GetSeasonsSchema,
  GetTournamentsResponse,
  GetTournamentsSchema,
} from "../openapi";
import { Env, RequestWithDB } from "../types";
import { json } from "itty-router";
import { Seasons } from "../models/season";
import { Tournaments } from "../models/tournament";
import { getDB } from "../models";
import { Users } from "../models/user";

const DEFAULT_PAGE_SIZE = 0;

class GetSeasons extends OpenAPIRoute {
  static schema = GetSeasonsSchema;

  async handle(_: RequestWithDB) {
    const seasons = await Seasons.getAll();
    return json(seasons.map((season) => GetSeasonsResponse.parse(season)));
  }
}

class GetTournaments extends OpenAPIRoute {
  static schema = GetTournamentsSchema;

  async handle(_: RequestWithDB) {
    const tournaments = await Tournaments.getAllExpanded();

    return json(
      tournaments.map((tournament) => {
        GetTournamentsResponse.parse(tournament);
      }),
    );
  }
}

class GetLeaderboard extends OpenAPIRoute {
  static schema = GetLeaderboardSchema;

  async handle(req: RequestWithDB, env: Env, ctx: ExecutionContext, data) {
    console.log(req.url);
    const { page, sizeFromQuery } = data.query;
    const size = sizeFromQuery ? sizeFromQuery : DEFAULT_PAGE_SIZE;
    const offset = page > 0 ? (page - 1) * size : 0;

    const totalUsers = await Users.count();
    const pages = Math.floor(totalUsers / size);

    let q = getDB()
      .selectFrom((innerEb) =>
        innerEb
          .selectFrom("results")
          .select((eb) => [
            "users.id as id",
            "users.name as name",
            eb.fn.sum<number>("results.points_earned").as("points"),
            eb.fn.countAll<number>().as("attended"),
          ])
          .innerJoin("users", "results.user_id", "users.id")
          .where("user_id", "!=", 0)
          .groupBy("user_id")
          .orderBy(["points desc", "attended desc"])
          .as("inner"),
      )
      .selectAll()
      .select((eb) =>
        eb.fn
          .agg<number>("ROW_NUMBER")
          .over((ob) => ob.orderBy("points", "desc"))
          .as("rank"),
      );

    if (offset !== null && offset > 0) {
      q = q.offset(offset);
    }
    if (size !== null && size > 0) {
      q = q.limit(size);
    }
    const rows: GetLeaderboardRowType[] = [];
    for (const result of await q.execute()) {
      rows.push(GetLeaderboardRow.parse(result));
    }

    return json({
      users: rows,
      total: totalUsers,
      pages: pages,
      current_page: page,
    });
  }
}
export { GetSeasons, GetTournaments, GetLeaderboard };
