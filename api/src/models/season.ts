import { Generated } from "kysely";
import { getDB } from "./index";

export interface SeasonsTable {
  id: Generated<number>;
  name: string;
  tier: string;
  started_at: string;
  ended_at: string | null;
}

export class Seasons {
  public static async getAll() {
    return await getDB().selectFrom("seasons").selectAll().execute();
  }
}
