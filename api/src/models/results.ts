import { getDB } from "./db.js";
import { Faction, Format, ResultsTable, TournamentType, UpdateResult } from "../schema.d.js";
import { MAX_TOURNAMENTS_PER_TYPE } from "../lib/ranking.js";

export type ResultExpanded = ResultsTable & {
  players_count: number;
  tournament_name: string;
  user_name: string;
  format: Format;
  tournament_type: TournamentType;
  count_for_tournament_type: number;
  is_valid: boolean;
};

type getExpandedOptions = {
  userId?: number | null;
  seasonId?: number | null;
  faction?: Faction | null;
  format?: Format | null;
};

export class Results {
  public static async get(user_id: number, tournament_id: number) {
    return await getDB()
      .selectFrom("results")
      .selectAll()
      .where("user_id", "=", user_id)
      .where("tournament_id", "=", tournament_id)
      .executeTakeFirst();
  }
  public static async getAll() {
    return await getDB().selectFrom("results").selectAll().execute();
  }
  public static async getByTournamentIdExpanded(tournamentId: number) {
    // TODO: make generic
    const q = getDB()
      .selectFrom("results")
      .selectAll()
      .innerJoin("users", "users.id", "results.user_id")
      .innerJoin("tournaments", "tournaments.id", "results.tournament_id")
      .select([
        "users.name as user_name",
        "tournaments.name as tournament_name",
        "tournaments.players_count as players_count",
        "tournaments.format as format",
      ])
      .orderBy(["results.rank_cut", "results.rank_swiss"])
      .where("tournament_id", "=", tournamentId);

    return await q.execute();
  }

  public static async getExpanded({
    userId = null,
    seasonId = null,
    faction = null,
    format = null,
  }: getExpandedOptions): Promise<ResultExpanded[]> {
    let q = getDB()
      .selectFrom("results")
      .selectAll()
      .innerJoin("users", "users.id", "results.user_id")
      .innerJoin("tournaments", "tournaments.id", "results.tournament_id")
      .select((eb) => [
        "users.name as user_name",
        "tournaments.type as tournament_type",
        "tournaments.name as tournament_name",
        "tournaments.players_count as players_count",
        "tournaments.format as format",
        eb.fn
          .agg<number>("rank")
          .over((ob) =>
            ob
              .partitionBy(["results.user_id", "tournaments.type"])
              .orderBy("results.points_earned", "desc")
              .orderBy("tournaments.id", "asc")
          )
          .as("count_for_tournament_type"),
      ])
      .orderBy("tournaments.type", "asc")
      .orderBy("count_for_tournament_type", "asc");

    if (userId) {
      q = q.where("results.user_id", "=", userId);
    }

    // SeasonId can be 0 which is non-truthy
    if (seasonId != null) {
      q = q.where("tournaments.season_id", "=", seasonId);
    }
    if (faction && faction.side_code == "runner") {
      q = q.where("results.runner_deck_faction", "=", faction.code);
    }
    if (faction && faction.side_code == "corp") {
      q = q.where("results.corp_deck_faction", "=", faction.code);
    }
    if (format) {
      q = q.where("tournaments.format", "=", format);
    }

    // TODO: yes we could do this in sql, but this is so much easier
    const results: ResultExpanded[] = [];
    const initialResults = await q.execute();
    for (let i = 0; i < initialResults.length; i++) {
      const max = MAX_TOURNAMENTS_PER_TYPE[initialResults[i].tournament_type];
      results.push({
        ...initialResults[i],
        is_valid: seasonId == null || initialResults[i].count_for_tournament_type <= max,
      });
    }

    return results;
  }
  public static async insert(result: UpdateResult, overwriteOnConflict: boolean = false) {
    return await getDB()
      .insertInto("results")
      .values(result)
      .onConflict((oc) => {
        if (overwriteOnConflict) {
          return oc.columns(["tournament_id", "user_id"]).doUpdateSet(result);
        } else {
          return oc.columns(["tournament_id", "user_id"]).doNothing();
        }
      })
      .returningAll()
      .executeTakeFirst();
  }
  public static async update(tournament_id: number, user_id: number, result: UpdateResult) {
    return await getDB()
      .updateTable("results")
      .set(result)
      .where("tournament_id", "=", tournament_id)
      .where("user_id", "=", user_id)
      .returningAll()
      .executeTakeFirst();
  }

  public static async getBySeasonId(season_id: number) {
    return getDB()
      .selectFrom("results")
      .innerJoin("tournaments", "results.tournament_id", "tournaments.id")
      .selectAll("results")
      .where("tournaments.season_id", "=", season_id)
      .execute();
  }
}
