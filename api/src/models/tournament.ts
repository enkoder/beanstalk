import { g } from "../g.js";
import { traceDeco } from "../lib/tracer.js";
import { Tournament, UpdateTournament } from "../schema.js";

export const Formats = ["standard", "startup", "eternal", "other"] as const;

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

// biome-ignore lint/complexity/noStaticOnlyClass:
export class Tournaments {
  @traceDeco
  public static async get(id: number): Promise<Tournament> {
    return await g()
      .db.selectFrom("tournaments")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  @traceDeco
  public static async getAll(): Promise<Tournament[]> {
    return await g().db.selectFrom("tournaments").selectAll().execute();
  }

  @traceDeco
  public static async getBySeasonId(season_id: number): Promise<Tournament[]> {
    return g()
      .db.selectFrom("tournaments")
      .selectAll()
      .where("tournaments.season_id", "=", season_id)
      .execute();
  }

  @traceDeco
  public static async getCountFromIds(ids: number[]): Promise<number> {
    const sql = g()
      .db.selectFrom("tournaments")
      .select((eb) => [eb.fn.countAll<number>().as("count")])
      .where("id", "in", ids);
    const { count } = await sql.executeTakeFirst();
    return count;
  }

  @traceDeco
  public static async getAllExpanded() {
    return await g()
      .db.selectFrom("tournaments")
      .innerJoin("seasons", "seasons.id", "tournaments.season_id")
      .selectAll()
      .select(["seasons.id as season_id", "seasons.name as season_name"])
      .execute();
  }

  @traceDeco
  public static async getAllExpandedFromSeasonId(
    seasonId: number,
  ): Promise<Tournament[]> {
    return await g()
      .db.selectFrom("tournaments")
      .innerJoin("seasons", "seasons.id", "tournaments.season_id")
      .selectAll("tournaments")
      .select(["seasons.name as season_name"])
      .where("season_id", "=", seasonId)
      .execute();
  }

  @traceDeco
  public static async getAllIds(): Promise<number[]> {
    const results = await g()
      .db.selectFrom("tournaments")
      .select("id")
      .execute();
    return results.map((row) => row.id);
  }

  @traceDeco
  public static async update(
    tournament: UpdateTournament,
  ): Promise<Tournament> {
    return await g()
      .db.updateTable("tournaments")
      .where("id", "=", tournament.id)
      .set(tournament)
      .returningAll()
      .executeTakeFirst();
  }

  @traceDeco
  public static async insert(
    tournament: UpdateTournament,
    overwriteOnConflict = true,
  ): Promise<Tournament> {
    return await g()
      .db.insertInto("tournaments")
      .values(tournament)
      .onConflict((oc) => {
        if (overwriteOnConflict) {
          return oc.column("id").doUpdateSet(tournament);
        }
        return oc.column("id").doNothing();
      })
      .returningAll()
      .executeTakeFirst();
  }
}
