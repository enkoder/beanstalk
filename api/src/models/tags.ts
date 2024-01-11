import { g } from "../g.js";
import { traceDeco } from "../lib/tracer.js";
import {
  InsertTag,
  InsertTournamentTag,
  Tag,
  TournamentTag,
} from "../schema.js";

// biome-ignore lint/complexity/noStaticOnlyClass:
export class Tags {
  public static normalizeName(name: string): string {
    return name
      .normalize()
      .split(" ") //splits the string into chunks at spaces
      .map((c) => c.toLowerCase()) //makes each chunks lowercase
      .join("-"); //combines each chunk with a "-"
  }

  @traceDeco("Tags")
  public static async getAllExpanded(owner_id?: number) {
    let q = g()
      .db.selectFrom("tags")
      .innerJoin("users", "tags.owner_id", "users.id")
      .leftJoin("tournament_tags", "tournament_tags.tag_id", "tags.id")
      .selectAll("tags")
      .select((eb) => [
        "tags.owner_id as owner_id",
        "users.name as owner_name",
        eb.fn.count<number | null>("tournament_tags.tag_id").as("count"),
      ])
      .groupBy("tags.id")
      .orderBy("count", "desc");

    if (owner_id !== undefined) {
      q = q.where("users.id", "=", owner_id);
    }

    return await q.execute();
  }

  @traceDeco("Tags")
  public static async getTagTournaments(
    tag_id: number,
  ): Promise<TournamentTag[]> {
    return await g()
      .db.selectFrom("tournament_tags")
      .selectAll("tournament_tags")
      .where("tournament_tags.tag_id", "=", tag_id)
      .execute();
  }

  @traceDeco("Tags")
  public static async insert(tag: InsertTag): Promise<Tag> {
    return await g()
      .db.insertInto("tags")
      .values(tag)
      .onConflict((oc) => oc.column("name").doNothing())
      .onConflict((oc) => oc.column("normalized").doNothing())
      .returningAll()
      .executeTakeFirst();
  }

  @traceDeco("Tags")
  public static async insertTagTournament(tournament_tag: InsertTournamentTag) {
    return await g()
      .db.insertInto("tournament_tags")
      .values(tournament_tag)
      .onConflict((oc) => oc.columns(["tournament_id", "tag_id"]).doNothing())
      .returningAll()
      .executeTakeFirst();
  }

  @traceDeco("Tags")
  public static async delete(tag_id: number) {
    return await g().db.deleteFrom("tags").where("id", "=", tag_id).execute();
  }

  @traceDeco("Tags")
  public static async deleteTagTournament(tag_id: number, tag_tournament_id) {
    return await g()
      .db.deleteFrom("tournament_tags")
      .where("tag_id", "=", tag_id)
      .where("tournament_tags.tournament_id", "=", tag_tournament_id)
      .execute();
  }
}
