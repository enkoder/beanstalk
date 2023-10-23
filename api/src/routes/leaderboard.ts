import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import {
  GetLeaderboardSchema,
  LeaderboardResponseComponent,
  LeaderboardRowComponent,
  LeaderboardRowComponentType,
} from "../openapi";
import { Env, RequestWithDB } from "../types";
import { json } from "itty-router";
import { getDB } from "../models";
import { Users } from "../models/user";

const DEFAULT_PAGE_SIZE = 0;

export class GetLeaderboard extends OpenAPIRoute {
  static schema = GetLeaderboardSchema;

  async handle(req: RequestWithDB, env: Env, ctx: ExecutionContext, data) {
    console.log(req.url);
    const { pageFromQuery, sizeFromQuery } = data.query;
    const page = pageFromQuery ? pageFromQuery : 0;
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
    const rows: LeaderboardRowComponentType[] = [];
    for (const result of await q.execute()) {
      rows.push(LeaderboardRowComponent.parse(result));
    }

    return json(
      LeaderboardResponseComponent.parse({
        users: rows,
        total: totalUsers,
        pages: pages,
        current_page: page,
      }),
    );
  }
}
