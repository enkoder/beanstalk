import { g } from "../g.js";
import { MAX_TOURNAMENTS_PER_TYPE } from "../lib/ranking.js";
import { traceDeco } from "../lib/tracer.js";
import {
  type Faction,
  type Format,
  RankingConfig,
  type ResultsTable,
  type Tag,
  type TournamentType,
  type UpdateResult,
} from "../schema.js";
import { Tags } from "./tags.js";

export type ResultExpanded = ResultsTable & {
  players_count: number;
  tournament_name: string;
  user_name: string | null;
  disabled: number;
  format: Format;
  tournament_type: TournamentType;
  count_for_tournament_type: number;
  is_valid: boolean;
};

type GetExpandedOptions = {
  userId?: number | null;
  tournamentId?: number | null;
  seasonId?: number | null;
  faction?: Faction | null;
  format?: Format | null;
  tags?: string[] | null;
};

export async function get(user_id: number, tournament_id: number) {
  return await g()
    .db.selectFrom("results")
    .selectAll()
    .where("user_id", "=", user_id)
    .where("tournament_id", "=", tournament_id)
    .executeTakeFirst();
}

export async function getAll() {
  return await g().db.selectFrom("results").selectAll().execute();
}

// biome-ignore lint/complexity/noStaticOnlyClass:
export class Results {
  @traceDeco("Results")
  public static async getExpanded({
    userId = null,
    tournamentId = null,
    seasonId = null,
    faction = null,
    format = null,
    tags = null,
  }: GetExpandedOptions): Promise<ResultExpanded[]> {
    let tagModels: Tag[] = [];
    if (tags) {
      tagModels = await Tags.getAllByNormalizedNames(tags);
    }

    let q = g()
      .db.selectFrom("results")
      .selectAll("results")
      .distinct()
      .$if(tags && tags.length > 0, (qb) =>
        qb
          .innerJoin(
            "tournament_tags",
            "results.tournament_id",
            "tournament_tags.tournament_id",
          )
          .innerJoin("tags", "tags.id", "tournament_tags.tag_id")
          .where("tags.normalized", "in", tags),
      )
      .innerJoin("users", "users.id", "results.user_id")
      .innerJoin("tournaments", "tournaments.id", "results.tournament_id")
      .select([
        "users.name as user_name",
        "users.disabled as disabled",
        "tournaments.type as tournament_type",
        "tournaments.name as tournament_name",
        "tournaments.players_count as players_count",
        "tournaments.format as format",
      ])
      .select((eb) => [
        eb.fn
          .agg<number>("rank")
          .over((ob) =>
            ob
              .partitionBy(["results.user_id", "tournaments.type"])
              .orderBy("results.points_earned", "desc")
              .orderBy("tournaments.id", "asc"),
          )
          .as("count_for_tournament_type"),
      ]);

    if (userId) {
      q = q.where("results.user_id", "=", userId);
    }

    if (tournamentId) {
      q = q.where("tournaments.id", "=", tournamentId);
    }

    // SeasonId can be 0 which is non-truthy
    if (seasonId != null) {
      q = q.where("tournaments.season_id", "=", seasonId);
    }
    if (faction && faction.side_code === "runner") {
      q = q.where("results.runner_deck_faction", "=", faction.code);
    }
    if (faction && faction.side_code === "corp") {
      q = q.where("results.corp_deck_faction", "=", faction.code);
    }
    if (format) {
      q = q.where("tournaments.format", "=", format);
    }

    let includeLimits: null | boolean = null;
    if (tagModels.length > 0) {
      // If ANY one tag has disabled tournament limits, we will disable them for the full query
      includeLimits = tagModels.every((tag) => tag.use_tournament_limits);
    }
    // default to keeping on limits for a season
    if (includeLimits === null && seasonId != null) {
      includeLimits = true;
    }

    // TODO: yes we could do this in sql, but this is so much easier
    const results: ResultExpanded[] = [];
    const initialResults = await q.execute();
    for (let i = 0; i < initialResults.length; i++) {
      const max = MAX_TOURNAMENTS_PER_TYPE[initialResults[i].tournament_type];
      results.push({
        ...initialResults[i],
        is_valid: includeLimits
          ? initialResults[i].count_for_tournament_type <= max
          : true,
      });
    }

    const sortedResults: ResultExpanded[] = [];
    for (const t in RankingConfig.tournament_configs) {
      for (const r of results) {
        if (r.tournament_type === t) {
          sortedResults.push(r);
        }
      }
    }
    return sortedResults;
  }

  @traceDeco("Results")
  public static async insert(
    result: UpdateResult,
    overwriteOnConflict = false,
  ) {
    return await g()
      .db.insertInto("results")
      .values(result)
      .onConflict((oc) => {
        if (overwriteOnConflict) {
          return oc.columns(["tournament_id", "user_id"]).doUpdateSet(result);
        }
        return oc.columns(["tournament_id", "user_id"]).doNothing();
      })
      .returningAll()
      .executeTakeFirst();
  }

  @traceDeco("Results")
  public static async update(
    tournament_id: number,
    user_id: number,
    result: UpdateResult,
  ) {
    return await g()
      .db.updateTable("results")
      .set(result)
      .where("tournament_id", "=", tournament_id)
      .where("user_id", "=", user_id)
      .returningAll()
      .executeTakeFirst();
  }

  @traceDeco("Results")
  public static async getBySeasonId(season_id: number) {
    return await g()
      .db.selectFrom("results")
      .innerJoin("tournaments", "results.tournament_id", "tournaments.id")
      .selectAll("results")
      .where("tournaments.season_id", "=", season_id)
      .execute();
  }

  @traceDeco("Results")
  public static async countUniqueAttendeesByType(
    type: TournamentType,
    season_id: number,
  ): Promise<number> {
    const { count } = await g()
      .db.selectFrom("tournaments")
      .select((eb) => eb.fn.sum<number>("players_count").as("count"))
      .where("season_id", "=", season_id)
      .where("type", "=", type)
      .executeTakeFirst();

    return count;
  }
}
