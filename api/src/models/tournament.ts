import { getDB } from "./db.js";
import { Tournament, UpdateTournament } from "../schema.js";

export const Formats = ["standard", "startup", "eternal"] as const;

export const TournamentTypes = [
  "GNK / seasonal",
  "asynchronous tournament",
  "circuit breaker",
  "circuit opener",
  "community tournament",
  "continental championship",
  "infinite recursion",
  "intercontinental championship",
  "national championship",
  "online event",
  "store championship",
  "team tournament",
  "worlds championship",
  "regional championship",
] as const;

export class Tournaments {
  public static async get(id: number): Promise<Tournament> {
    return await getDB()
      .selectFrom("tournaments")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  public static async getAll(): Promise<Tournament[]> {
    return await getDB().selectFrom("tournaments").selectAll().execute();
  }

  public static async getBySeasonId(season_id: number): Promise<Tournament[]> {
    return getDB()
      .selectFrom("tournaments")
      .selectAll()
      .where("tournaments.season_id", "=", season_id)
      .execute();
  }

  public static async getCountFromIds(ids: number[]): Promise<number> {
    const sql = getDB()
      .selectFrom("tournaments")
      .select((eb) => [eb.fn.countAll<number>().as("count")])
      .where("id", "in", ids);
    const { count } = await sql.executeTakeFirst();
    return count;
  }
  public static async getAllExpanded() {
    return await getDB()
      .selectFrom("tournaments")
      .innerJoin("seasons", "seasons.id", "tournaments.season_id")
      .selectAll()
      .select(["seasons.id as season_id", "seasons.name as season_name"])
      .execute();
  }

  public static async getAllExpandedFromSeasonId(
    seasonId: number,
  ): Promise<Tournament[]> {
    return await getDB()
      .selectFrom("tournaments")
      .innerJoin("seasons", "seasons.id", "tournaments.season_id")
      .selectAll("tournaments")
      .select(["seasons.name as season_name"])
      .where("season_id", "=", seasonId)
      .execute();
  }

  public static async getAllIds(): Promise<number[]> {
    const results = await getDB()
      .selectFrom("tournaments")
      .select("id")
      .execute();
    return results.map((row) => row.id);
  }

  public static async update(
    tournament: UpdateTournament,
  ): Promise<Tournament> {
    return await getDB()
      .updateTable("tournaments")
      .where("id", "=", tournament.id)
      .set(tournament)
      .returningAll()
      .executeTakeFirst();
  }

  public static async insert(
    tournament: UpdateTournament,
    overwriteOnConflict: boolean = true,
  ): Promise<Tournament> {
    return await getDB()
      .insertInto("tournaments")
      .values(tournament)
      .onConflict((oc) => {
        if (overwriteOnConflict) {
          return oc.column("id").doUpdateSet(tournament);
        } else {
          return oc.column("id").doNothing();
        }
      })
      .returningAll()
      .executeTakeFirst();
  }
}
