import { g } from "../g.js";
import { traceDeco } from "../lib/tracer.js";
import { InsertTag, InsertTournamentTag, Tag } from "../schema.js";

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
  public static async getAllExpanded() {
    return await g()
      .db.selectFrom("tags")
      .selectAll()
      .innerJoin("users", "tags.owner_id", "users.id")
      .select([
        "tags.name as name",
        "users.name as owner_name",
        "users.id as owner_id",
      ])
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
}

// biome-ignore lint/complexity/noStaticOnlyClass:
export class TournamentTags {
  @traceDeco("TournamentTags")
  public static async getAllWithCount() {
    return await g()
      .db.selectFrom("tournament_tags")
      .selectAll()
      .innerJoin("tags", "tags.id", "tournament_tags.tag_id")
      .innerJoin("users", "tags.owner_id", "users.id")
      .innerJoin(
        "tournaments",
        "tournaments.id",
        "tournament_tags.tournament_id",
      )
      .select([
        "tags.id as tag_id",
        "tags.name as tag_name",
        "tags.normalized as tag_normalized",
        "tags.owner_id as owner_id",
        "users.name as owner_name",
      ])
      .select((eb) => {
        return eb.fn.count<number>("tags.id").as("count");
      })
      .groupBy(["tags.id"])
      .execute();
  }

  @traceDeco("TournamentTags")
  public static async insert(tournament_tag: InsertTournamentTag) {
    return await g()
      .db.insertInto("tournament_tags")
      .values(tournament_tag)
      .onConflict((oc) => oc.columns(["tournament_id", "tag_id"]).doNothing())
      .returningAll()
      .executeTakeFirst();
  }
}
