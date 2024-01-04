import { g } from "../g.js";
import { traceDeco } from "../lib/tracer.js";
import { InsertSeason, Season } from "../schema.js";

// biome-ignore lint/complexity/noStaticOnlyClass:
export class Seasons {
  @traceDeco("Season")
  public static async getAll() {
    return await g().db.selectFrom("seasons").selectAll().execute();
  }

  @traceDeco("Season")
  public static async getFromId(id: number) {
    return await g()
      .db.selectFrom("seasons")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  @traceDeco("Season")
  public static async getFromTimestamp(timestamp: string): Promise<Season[]> {
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

  @traceDeco("Season")
  public static async insert(user: InsertSeason): Promise<Season> {
    return await g()
      .db.insertInto("seasons")
      .values(user)
      .returningAll()
      .executeTakeFirst();
  }
}
