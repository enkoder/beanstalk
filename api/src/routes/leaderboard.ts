import {
  FactionComponent,
  FactionComponentType,
  GetFactionsSchema,
  GetLeaderboardSchema,
  GetPointDistributionResponseComponent,
  GetPointDistributionSchema,
  GetTiersSchema,
  LeaderboardRowComponent,
  LeaderboardRowComponentType,
  TierComponent,
} from "../openapi";
import { RequestWithDB } from "../types";
import {
  calculateTournamentPointDistribution,
  TOURNAMENT_POINTS,
} from "../lib/ranking";
import { Leaderboards } from "../models/leaderboard";
import { TournamentType } from "../models/tournament";
import { ABRTournamentTypeFilter } from "../lib/abr";
import { FactionCode, Factions, getFactionFromCode } from "../models/factions";
import { json } from "itty-router";
import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";

export class GetLeaderboard extends OpenAPIRoute {
  static schema = GetLeaderboardSchema;

  async handle(req: RequestWithDB) {
    const seasonId = Number(req.query!["seasonId"]);
    const factionCode = req.query!["factionCode"];
    const faction = factionCode
      ? getFactionFromCode(factionCode as FactionCode)
      : undefined;

    const rows: LeaderboardRowComponentType[] = [];
    for (const result of await Leaderboards.getExpanded(seasonId, faction)) {
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
    // TODO: this is a mess, figure out a good data format for this
    const tiers = [
      {
        id: ABRTournamentTypeFilter.WorldsChampionship,
        name: TournamentType.Worlds,
        points: TOURNAMENT_POINTS[TournamentType.Worlds],
      },
      {
        id: ABRTournamentTypeFilter.ContinentalChampionship,
        name: TournamentType.Continental,
        points: TOURNAMENT_POINTS[TournamentType.Continental],
      },
      {
        id: ABRTournamentTypeFilter.NationalChampionship,
        name: TournamentType.Nationals,
        points: TOURNAMENT_POINTS[TournamentType.Nationals],
      },
    ];
    return json(tiers.map((tier) => TierComponent.parse(tier)));
  }
}

export class GetFactions extends OpenAPIRoute {
  static schema = GetFactionsSchema;
  async handle() {
    const factions: FactionComponentType[] = [];
    for (const faction in Factions) {
      factions.push(FactionComponent.parse(Factions[faction]));
    }
    return json(factions);
  }
}
