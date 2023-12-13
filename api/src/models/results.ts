import { getDB } from "./index";
import { Format, TournamentType } from "./tournament";
import { Faction, FactionCode } from "./factions";
import { Selectable, Updateable } from "kysely";

export type ResultsTable = {
  tournament_id: number;
  user_id: number;

  runner_deck_identity_id: number;
  runner_deck_faction: FactionCode;
  runner_deck_url: string;
  runner_deck_identity_name: string;

  corp_deck_identity_id: number;
  corp_deck_faction: FactionCode;
  corp_deck_url: string;
  corp_deck_identity_name: string;

  rank_swiss: number;
  rank_cut: number;

  points_earned: number;
};

export type UpdateResult = Updateable<ResultsTable>;
export type Result = Selectable<ResultsTable>;

export type ResultsTableExpanded = ResultsTable & {
  players_count: number;
  tournament_name: string;
  user_name: string;
  format: Format;
};
export type ResultExpanded = Selectable<ResultsTableExpanded>;

type getExpandedOptions = {
  userId: number;
  seasonId?: number | null;
  faction?: Faction | null;
  format?: Format | null;
};

export class Results {
  public static async get(
    user_id: number,
    tournament_id: number,
  ): Promise<Result> {
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
  public static async getByTournamentIdExpanded(
    tournamentId: number,
  ): Promise<Result[]> {
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
    userId,
    seasonId = null,
    faction = null,
    format = null,
  }: getExpandedOptions): Promise<ResultExpanded[]> {
    let q = getDB()
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
      .orderBy("tournaments.date", "desc")
      .where("user_id", "=", userId);

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

    return await q.execute();
  }
  public static async insert(
    result: UpdateResult,
    overwriteOnConflict: boolean = false,
  ): Promise<Result> {
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
  public static async update(
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

  public static async getBySeasonId(season_id: number) {
    return getDB()
      .selectFrom("results")
      .innerJoin("tournaments", "results.tournament_id", "tournaments.id")
      .selectAll("results")
      .where("tournaments.season_id", "=", season_id)
      .execute();
  }

  public static async getByTournamentType(type: TournamentType) {
    return getDB()
      .selectFrom("results")
      .innerJoin("tournaments", "results.tournament_id", "tournaments.id")
      .selectAll("results")
      .where("tournaments.type", "=", type)
      .execute();
  }
}
