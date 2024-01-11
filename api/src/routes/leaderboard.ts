import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import { json } from "itty-router";
import { calculateTournamentPointDistribution } from "../lib/ranking.js";
import { traceDeco } from "../lib/tracer.js";
import { Factions, getFactionFromCode } from "../models/factions.js";
import { Leaderboard } from "../models/leaderboard.js";
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

  @traceDeco("Leaderboard")
  async handle(req: RequestWithDB) {
    const seasonId = req.query.seasonId
      ? Number(req.query.seasonId)
      : undefined;

    const factionCode = req.query.factionCode;
    const format = req.query.format as Format;

    const faction = factionCode
      ? getFactionFromCode(factionCode as FactionCode)
      : undefined;

    const tags = Array.isArray(req.query.tags)
      ? (req.query.tags as string[])
      : req.query.tags
        ? [req.query.tags]
        : null;

    const rows: LeaderboardRowComponentType[] = [];
    const results = await Leaderboard.getExpanded({
      seasonId,
      faction,
      format,
      tags,
    });
    for (const result of results) {
      rows.push(LeaderboardRowComponent.parse(result));
    }

    return json(rows);
  }
}

export class GetPointDistribution extends OpenAPIRoute {
  static schema = GetPointDistributionSchema;

  @traceDeco("GetPointsDistribution") async handle(req: RequestWithDB) {
    const numPlayers = Number(req.query.numPlayers);
    const type = req.query.type as TournamentType;

    const { points, totalPoints } = calculateTournamentPointDistribution(
      numPlayers,
      type,
    );

    const cumulative: number[] = [];
    points.reduce((accum, value) => {
      cumulative.push(
        totalPoints !== 0 ? ((accum + value) / totalPoints) * 100.0 : 0,
      );
      return accum + value;
    }, 0);

    return json(
      GetPointDistributionResponseComponent.parse({
        totalPoints: totalPoints,
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

  @traceDeco("GetRankingConfig")
  async handle() {
    return json(RankingConfig);
  }
}

export class GetFactions extends OpenAPIRoute {
  static schema = GetFactionsSchema;

  @traceDeco("GetFactions")
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

  @traceDeco("GetFormats")
  async handle() {
    const formats: Format[] = [];
    for (const format of Formats) {
      formats.push(FormatComponent.parse(format));
    }
    return json(formats);
  }
}
