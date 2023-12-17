import { Tournament, UpdateTournament } from "../schema.js";
import { getDB } from "./db.js";

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

export async function get(id: number): Promise<Tournament> {
  return await getDB()
    .selectFrom("tournaments")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
}

export async function getAll(): Promise<Tournament[]> {
  return await getDB().selectFrom("tournaments").selectAll().execute();
}

export async function getBySeasonId(season_id: number): Promise<Tournament[]> {
  return getDB()
    .selectFrom("tournaments")
    .selectAll()
    .where("tournaments.season_id", "=", season_id)
    .execute();
}

export async function getCountFromIds(ids: number[]): Promise<number> {
  const sql = getDB()
    .selectFrom("tournaments")
    .select((eb) => [eb.fn.countAll<number>().as("count")])
    .where("id", "in", ids);
  const { count } = await sql.executeTakeFirst();
  return count;
}
export async function getAllExpanded() {
  return await getDB()
    .selectFrom("tournaments")
    .innerJoin("seasons", "seasons.id", "tournaments.season_id")
    .selectAll()
    .select(["seasons.id as season_id", "seasons.name as season_name"])
    .execute();
}

export async function getAllExpandedFromSeasonId(
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

export async function getAllIds(): Promise<number[]> {
  const results = await getDB()
    .selectFrom("tournaments")
    .select("id")
    .execute();
  return results.map((row) => row.id);
}

export async function update(
  tournament: UpdateTournament,
): Promise<Tournament> {
  return await getDB()
    .updateTable("tournaments")
    .where("id", "=", tournament.id)
    .set(tournament)
    .returningAll()
    .executeTakeFirst();
}

export async function insert(
  tournament: UpdateTournament,
  overwriteOnConflict = true,
): Promise<Tournament> {
  return await getDB()
    .insertInto("tournaments")
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
