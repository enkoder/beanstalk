import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import { json } from "itty-router";
import {
  Tournament,
  calculatePointDistribution,
  getSeasonConfig,
} from "../lib/ranking.js";
import { traceDeco } from "../lib/tracer.js";
import { Factions, getFactionFromCode } from "../models/factions.js";
import { Leaderboard } from "../models/leaderboard.js";
import { Seasons } from "../models/season.js";
import { Formats } from "../models/tournament.js";
import {
  FactionComponent,
  type FactionComponentType,
  FormatComponent,
  GetFactionsSchema,
  GetFormatSchema,
  GetLeaderboardSchema,
  GetPointDistributionResponseComponent,
  GetPointDistributionSchema,
  GetRankingConfigSchema,
  LeaderboardRowComponent,
  type LeaderboardRowComponentType,
  RankingConfigComponent,
  TournamentConfigType,
} from "../openapi.js";
import type { FactionCode, Format, TournamentType } from "../schema.js";
import type { RequestWithDB } from "../types.js";

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

    // Security check: only admins can include disabled users
    if (req.query.includeDisabled === "true" && !req.is_admin) {
      return new Response("Forbidden: Only admins can view disabled users", {
        status: 403,
      });
    }

    const includeDisabled =
      req.is_admin && req.query.includeDisabled === "true";

    const rows: LeaderboardRowComponentType[] = [];
    const results = await Leaderboard.getExpanded({
      seasonId,
      faction,
      format,
      tags,
      isAdmin: req.is_admin,
      includeDisabled,
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
    const seasonId = req.query.seasonId
      ? Number(req.query.seasonId)
      : (await Seasons.getCurrentSeason())?.id;

    if (!seasonId) {
      throw new Error("No current season found");
    }

    const { points, totalPoints } = calculatePointDistribution(
      numPlayers,
      type,
      undefined,
      seasonId,
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
  handle(req: RequestWithDB) {
    const seasonId = req.query.seasonId
      ? Number(req.query.seasonId)
      : undefined;

    const config = getSeasonConfig(seasonId);

    const tournamentConfigValues = Object.fromEntries(
      Object.values(Tournament).map((type: Tournament) => [
        type,
        {
          code: type,
          name: type
            .split("_")
            .map((word) => word.charAt(0).toUpperCase() + word.slice(1))
            .join(" "),
          tournament_limit: config.MAX_TOURNAMENTS_PER_TYPE[type],
          min_players_to_be_legal: config.MIN_PLAYERS_TO_BE_LEGAL[type],
          baseline_points: config.BASELINE_POINTS[type],
          points_per_player: config.POINTS_PER_PLAYER[type],
          additional_top_cut_percentage: 0,
        },
      ]),
    );

    return json(
      RankingConfigComponent.parse({
        tournament_configs: tournamentConfigValues,
        bottom_threshold:
          config.BOTTOM_THRESHOLD[Object.keys(config.BOTTOM_THRESHOLD)[0]], // Use first tournament type's threshold
      }),
    );
  }
}

export class GetFactions extends OpenAPIRoute {
  static schema = GetFactionsSchema;

  @traceDeco("GetFactions")
  handle() {
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
  handle() {
    const formats: Format[] = [];
    for (const format of Formats) {
      formats.push(FormatComponent.parse(format));
    }
    return json(formats);
  }
}
