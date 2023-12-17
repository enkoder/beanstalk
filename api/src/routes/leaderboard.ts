import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import { json } from "itty-router";
import { calculateTournamentPointDistribution } from "../lib/ranking.js";
import { Factions, getFactionFromCode } from "../models/factions.js";
import * as Leaderboards from "../models/leaderboard.js";
import { Formats } from "../models/tournament.js";
import {
  FactionComponent,
  FactionComponentType,
  FormatComponent,
  GetFactionsSchema,
  GetFormatSchema,
  GetLeaderboardSchema,
  GetPointDistributionResponseComponent,
  GetPointDistributionSchema,
  GetRankingConfigSchema,
  LeaderboardRowComponent,
  LeaderboardRowComponentType,
} from "../openapi.js";
import {
  FactionCode,
  Format,
  RankingConfig,
  TournamentType,
} from "../schema.js";
import { RequestWithDB } from "../types.d.js";

export class GetLeaderboard extends OpenAPIRoute {
  static schema = GetLeaderboardSchema;

  async handle(req: RequestWithDB) {
    const seasonId = req.query.seasonId
      ? Number(req.query.seasonId)
      : undefined;

    const factionCode = req.query.factionCode;
    const format = req.query.format as Format;

    const faction = factionCode
      ? getFactionFromCode(factionCode as FactionCode)
      : undefined;

    const rows: LeaderboardRowComponentType[] = [];
    const results = await Leaderboards.getExpanded({
      seasonId,
      faction,
      format,
    });
    for (const result of results) {
      rows.push(LeaderboardRowComponent.parse(result));
    }

    return json(rows);
  }
}

export class GetPointDistribution extends OpenAPIRoute {
  static schema = GetPointDistributionSchema;

  async handle(req: RequestWithDB) {
    const totalPoints = Number(req.query.totalPoints);
    const numPlayers = Number(req.query.numPlayers);
    const type = req.query.type as TournamentType;

    const { points, adjustedTotalPoints } =
      calculateTournamentPointDistribution(totalPoints, numPlayers, type);

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

export class GetRankingConfig extends OpenAPIRoute {
  static schema = GetRankingConfigSchema;

  async handle() {
    return json(RankingConfig);
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

export class GetFormats extends OpenAPIRoute {
  static schema = GetFormatSchema;
  async handle() {
    const formats: Format[] = [];
    for (const format of Formats) {
      formats.push(FormatComponent.parse(format));
    }
    return json(formats);
  }
}
