import { g } from "../g.js";
import { InsertSeason, Season } from "../schema.js";

export async function getAll() {
  return await g().db.selectFrom("seasons").selectAll().execute();
}

export async function getFromId(id: number) {
  return await g()
    .db.selectFrom("seasons")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
}

export async function getFromTimestamp(timestamp: string): Promise<Season[]> {
  const sql = g()
    .db.selectFrom("seasons")
    .selectAll()
    .where((eb) =>
      eb("started_at", "<=", timestamp).and(
        eb.parens(
          eb("ended_at", ">=", timestamp).or(eb("ended_at", "is", null)),
        ),
      ),
    )
    .orderBy("started_at", "desc");
  return await sql.execute();
}

export async function insert(user: InsertSeason): Promise<Season> {
  return await g()
    .db.insertInto("seasons")
    .values(user)
    .returningAll()
    .executeTakeFirst();
}
