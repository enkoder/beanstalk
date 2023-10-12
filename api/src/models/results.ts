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
  public static async getManyByUserIdExpanded(
    user_id: number,
  ): Promise<Result[]> {
    return await getDB()
      .selectFrom("results")
      .selectAll()
      .where("user_id", "=", user_id)
      .execute();
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
  public static async update(result: UpdateResult) {
    return await getDB()
      .updateTable("results")
      .set(result)
      .where("tournament_id", "=", result.tournament_id)
      .returningAll()
      .executeTakeFirst();
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
