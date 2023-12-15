import { InsertSeason, Season } from "../schema.js";
import { getDB } from "./db.js";

export async function getAll() {
  return await getDB().selectFrom("seasons").selectAll().execute();
}

export async function getFromId(id: number) {
  return await getDB()
    .selectFrom("seasons")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
}

export async function getFromTimestamp(timestamp: string): Promise<Season[]> {
  const sql = getDB()
    .selectFrom("seasons")
    .selectAll()
    .where((eb) =>
      eb("started_at", "<=", timestamp).and(
        eb.parens(
          eb("ended_at", ">=", timestamp).or(eb("ended_at", "is", null)),
        ),
      ),
    )
    .orderBy("started_at", "desc");
  //console.log(JSON.stringify(sql.compile()));
  return await sql.execute();
}

export async function insert(user: InsertSeason): Promise<Season> {
  return await getDB()
    .insertInto("seasons")
    .values(user)
    .returningAll()
    .executeTakeFirst();
}
