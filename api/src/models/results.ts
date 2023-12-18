import { MAX_TOURNAMENTS_PER_TYPE } from "../lib/ranking.js";
import {
  Faction,
  Format,
  RankingConfig,
  ResultsTable,
  TournamentType,
  UpdateResult,
} from "../schema.js";
import { getDB } from "./db.js";

export type ResultExpanded = ResultsTable & {
  players_count: number;
  tournament_name: string;
  user_name: string;
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
};

export async function get(user_id: number, tournament_id: number) {
  return await getDB()
    .selectFrom("results")
    .selectAll()
    .where("user_id", "=", user_id)
    .where("tournament_id", "=", tournament_id)
    .executeTakeFirst();
}
export async function getAll() {
  return await getDB().selectFrom("results").selectAll().execute();
}

export async function getExpanded({
  userId = null,
  tournamentId = null,
  seasonId = null,
  faction = null,
  format = null,
}: GetExpandedOptions): Promise<ResultExpanded[]> {
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

  // TODO: yes we could do this in sql, but this is so much easier
  const results: ResultExpanded[] = [];
  const initialResults = await q.execute();
  for (let i = 0; i < initialResults.length; i++) {
    const max = MAX_TOURNAMENTS_PER_TYPE[initialResults[i].tournament_type];
    results.push({
      ...initialResults[i],
      is_valid:
        seasonId == null || initialResults[i].count_for_tournament_type <= max,
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
export async function insert(
  result: UpdateResult,
  overwriteOnConflict = false,
) {
  return await getDB()
    .insertInto("results")
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
export async function update(
  tournament_id: number,
  user_id: number,
  result: UpdateResult,
) {
  return await getDB()
    .updateTable("results")
    .set(result)
    .where("tournament_id", "=", tournament_id)
    .where("user_id", "=", user_id)
    .returningAll()
    .executeTakeFirst();
}

export async function getBySeasonId(season_id: number) {
  return getDB()
    .selectFrom("results")
    .innerJoin("tournaments", "results.tournament_id", "tournaments.id")
    .selectAll("results")
    .where("tournaments.season_id", "=", season_id)
    .execute();
}
