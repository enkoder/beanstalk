import {
  GetLeaderboardSchema,
  GetPointDistributionResponseComponent,
  GetPointDistributionSchema,
  LeaderboardResponseComponent,
  LeaderboardRowComponent,
  LeaderboardRowComponentType,
} from "../openapi";
import { RequestWithDB } from "../types";
import { getDB } from "../models";
import { Users } from "../models/user";
import {
  calculateTournamentPointDistribution,
  findAlphaForDesiredDistribution,
  PERCENT_RECEIVING_POINTS,
  TARGET_POINT_PERCENTAGE_FOR_TOP,
  TARGET_TOP_PERCENTAGE,
} from "../lib/ranking";
import { json } from "itty-router";
import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";

const DEFAULT_PAGE_SIZE = 0;

export class GetLeaderboard extends OpenAPIRoute {
  static schema = GetLeaderboardSchema;

  async handle(req: RequestWithDB) {
    const pageFromQuery = Number(req.query!["page"]);
    const sizeFromQuery = Number(req.query!["size"]);
    const seasonIdFromQuery = Number(req.query!["seasonId"]);

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

  async handle(req: RequestWithDB) {
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

    const percentReceivingPoints = req.query!["percentReceivingPoints"]
      ? Number(req.query["percentReceivingPoints"])
      : PERCENT_RECEIVING_POINTS;

    const alpha = findAlphaForDesiredDistribution(
      numPlayers,
      percentReceivingPoints,
      targetTopPercentage,
      targetPointPercentageForTop,
    );

    const { points, adjustedTotalPoints } =
      calculateTournamentPointDistribution(
        totalPoints,
        numPlayers,
        alpha,
        percentReceivingPoints,
      );

    const cumulative: number[] = [];
    points.reduce((accum, value) => {
      cumulative.push(((accum + value) / adjustedTotalPoints) * 100.0);
      return accum + value;
    }, 0);

    return json(
      GetPointDistributionResponseComponent.parse({
        currentTargetTopPercentage: 20,
        currentTargetPointPercentageForTop: 80,
        adjustedTotalPoints: adjustedTotalPoints,
        pointDistribution: points.map((value, index) => {
          return {
            placement: index + 1,
            points: Number(value.toFixed(2)),
            cumulative: Number(cumulative[index].toFixed(2)),
          };
        }),
      }),
    );
  }
}
