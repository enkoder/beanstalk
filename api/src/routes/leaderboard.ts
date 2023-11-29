import {
  GetLeaderboardSchema,
  GetPointDistributionResponseComponent,
  GetPointDistributionSchema,
  GetTiersSchema,
  LeaderboardRowComponent,
  LeaderboardRowComponentType,
  TierComponent,
} from "../openapi";
import { RequestWithDB } from "../types";
import { calculateTournamentPointDistribution } from "../lib/ranking";
import { Tiers } from "../models/tournament";
import { Leaderboards } from "../models/leaderboard";
import { json } from "itty-router";
import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";

export class GetLeaderboard extends OpenAPIRoute {
  static schema = GetLeaderboardSchema;

  async handle(req: RequestWithDB) {
    const seasonId = Number(req.query!["seasonId"]);

    const rows: LeaderboardRowComponentType[] = [];
    for (const result of await Leaderboards.getFromSeasonIdExpanded(seasonId)) {
      rows.push(LeaderboardRowComponent.parse(result));
    }

    return json(rows);
  }
}

export class GetPointDistribution extends OpenAPIRoute {
  static schema = GetPointDistributionSchema;

  async handle(req: RequestWithDB) {
    const totalPoints = Number(req.query["totalPoints"]);
    const numPlayers = Number(req.query["numPlayers"]);

    const { points, adjustedTotalPoints } =
      calculateTournamentPointDistribution(totalPoints, numPlayers);

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

export class GetTiers extends OpenAPIRoute {
  static schema = GetTiersSchema;

  async handle() {
    return json(Tiers.map((tier) => TierComponent.parse(tier)));
  }
}
