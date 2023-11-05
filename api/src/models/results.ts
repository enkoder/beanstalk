import { Selectable, Updateable } from "kysely";
import { getDB } from "./index";
import { TournamentType } from "./tournament";
export interface ResultsTable {
  tournament_id: number;
  tournament_name?: string;
  user_id: number;
  user_name?: string;
  runner_deck_identity_id: number;
  runner_deck_url: string;
  corp_deck_identity_id: number;
  corp_deck_url: string;
  rank_swiss: number;
  rank_cut: number;
  season_id: number;
  points_earned: number;
  runner_deck_identity_name: string;
  corp_deck_identity_name: string;
}
export type UpdateResult = Updateable<ResultsTable>;
export type Result = Selectable<ResultsTable>;

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
  public static async getManyExpandedByTournamentId(
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
        "tournaments.registration_count as registration_count",
      ])
      .orderBy(["results.rank_cut", "results.rank_swiss"])
      .where("tournament_id", "=", tournamentId);

    return await q.execute();
  }

  public static async getManyByUserIdExpanded(id: number): Promise<Result[]> {
    // TODO: make generic
    const q = getDB()
      .selectFrom("results")
      .selectAll()
      .innerJoin("users", "users.id", "results.user_id")
      .innerJoin("tournaments", "tournaments.id", "results.tournament_id")
      .select([
        "users.name as user_name",
        "tournaments.name as tournament_name",
        "tournaments.registration_count as registration_count",
      ])
      .where("user_id", "=", id);

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
