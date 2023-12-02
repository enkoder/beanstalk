import { getDB } from "./index";
import { Insertable, Selectable, Updateable } from "kysely";

export type Format = "standard" | "startup" | "eternal";
export const Formats = ["standard", "startup", "eternal"] as const;

export enum TournamentType {
  GNK = "GNK / seasonal",
  Asynchronous = "asynchronous tournament",
  CircuitBreaker = "circuit breaker",
  CircuitOpener = "circuit opener",
  Community = "community tournament",
  Continental = "continental championship",
  InfiniteRecursion = "infinite recursion",
  Intercontinental = "intercontinental championship",
  Nationals = "national championship",
  Online = "online event",
  StoreChamp = "store championship",
  Team = "team tournament",
  Worlds = "worlds championship",
  Regionals = "regional championship",
}

export interface TournamentsTable {
  id: number;
  name: string;
  concluded: number;
  location: string;
  format: Format;
  type: TournamentType;
  players_count: number;
  season_id: number | null;
  date: string | null;
}

export const TournamentsTableKeys: Array<keyof TournamentsTable> = [
  "id",
  "name",
  "date",
  "concluded",
  "season_id",
];

export type Tournament = Selectable<TournamentsTable>;
export type UpdateTournament = Updateable<TournamentsTable>;
export type InsertTournament = Insertable<TournamentsTable>;
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
  public static async getAllExpanded(): Promise<Tournament[]> {
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
