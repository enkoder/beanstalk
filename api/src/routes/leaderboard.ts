import { OpenAPIRoute, Query } from "@cloudflare/itty-router-openapi";
import {
  GetLeaderboardSchema,
  GetPointDistributionResponseComponent,
  GetPointDistributionSchema,
  LeaderboardResponseComponent,
  LeaderboardRowComponent,
  LeaderboardRowComponentType,
} from "../openapi";
import { Env, RequestWithDB } from "../types";
import { json } from "itty-router";
import { getDB } from "../models";
import { Users } from "../models/user";
import { z } from "zod";
import {
  TARGET_POINT_PERCENTAGE_FOR_TOP,
  TARGET_TOP_PERCENTAGE,
  calculateTournamentPointDistribution,
  findAlphaForDesiredDistribution,
} from "../lib/ranking";

const DEFAULT_PAGE_SIZE = 0;

export class GetLeaderboard extends OpenAPIRoute {
  static schema = GetLeaderboardSchema;

  async handle(req: RequestWithDB, env: Env, ctx: ExecutionContext, data) {
    const pageFromQuery = Number(req.query!["page"]);
    const sizeFromQuery = Number(req.query!["size"]);
    const seasonIdFromQuery = Number(req.query!["seasonId"]);
    console.log(seasonIdFromQuery);

    const page = pageFromQuery ? pageFromQuery : 0;
    const size = sizeFromQuery ? sizeFromQuery : DEFAULT_PAGE_SIZE;
    const offset = page > 0 ? (page - 1) * size : 0;

    const totalUsers = await Users.count();
    const pages = Math.floor(totalUsers / size);

    let q = getDB()
      .selectFrom((innerEb) => {
        let q = innerEb
          .selectFrom("results")
          .select((eb) => [
            "users.id as id",
            "users.name as name",
            eb.fn.sum<number>("results.points_earned").as("points"),
            eb.fn.countAll<number>().as("attended"),
            "tournaments.season_id as season_id",
          ])
          .innerJoin("users", "results.user_id", "users.id")
          .innerJoin("tournaments", "tournaments.id", "results.tournament_id")
          .where("user_id", "!=", 0)
          .groupBy("user_id")
          .orderBy(["points desc", "attended desc"]);

        if (seasonIdFromQuery) {
          q = q.where("tournaments.season_id", "=", seasonIdFromQuery);
        }

        return q.as("inner");
      })
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

export class GetPointDistribution extends OpenAPIRoute {
  static schema = GetPointDistributionSchema;

  async handle(req: RequestWithDB, env: Env, ctx: ExecutionContext, data) {
    const totalPoints = Number(req.query["totalPoints"]);
    const numPlayers = Number(req.query["numPlayers"]);

    const targetTopPercentage = req.query!["topTargetPercentage"]
      ? Number(req.query["topTargetPercentage"])
      : TARGET_TOP_PERCENTAGE;

    const targetPointPercentageForTop = req.query![
      "targetPointPercentageForTop"
    ]
      ? Number(req.query["targetPointPercentageForTop"])
      : TARGET_POINT_PERCENTAGE_FOR_TOP;

    const alpha = findAlphaForDesiredDistribution(
      numPlayers,
      targetTopPercentage,
      targetPointPercentageForTop,
    );
    console.log(alpha);

    const distribution = calculateTournamentPointDistribution(
      totalPoints,
      numPlayers,
      alpha,
    );

    return json(
      GetPointDistributionResponseComponent.parse({
        currentTargetTopPercentage: 20,
        currentTargetPointPercentageForTop: 80,
        pointDistribution: distribution,
      }),
    );
  }
}
