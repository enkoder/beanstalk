import { getDB } from "./index";
import { Generated } from "kysely";
import { Selectable } from "kysely/dist/esm";

export interface SeasonsTable {
  id: Generated<number>;
  name: string;
  tier: string;
  started_at: string;
  ended_at: string | null;
}

export type Season = Selectable<SeasonsTable>;

export class Seasons {
  public static async getAll() {
    return await getDB().selectFrom("seasons").selectAll().execute();
  }

  public static async getFromTimestamp(timestamp: string): Promise<Season[]> {
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
}
