import { getDB } from "./index";
import { Faction } from "./factions";
import { Format } from "./tournament";

export class Leaderboards {
  public static async getExpanded(
    seasonId?: number,
    faction?: Faction,
    format?: Format,
  ) {
    const q = getDB()
      .selectFrom((innerEb) => {
        let q = innerEb
          .selectFrom("results")
          .select((eb) => [
            "users.id as user_id",
            "users.name as user_name",
            eb.fn.sum<number>("results.points_earned").as("points"),
            eb.fn.countAll<number>().as("attended"),
            "tournaments.format as format",
          ])
          .innerJoin("users", "results.user_id", "users.id")
          .innerJoin("tournaments", "tournaments.id", "results.tournament_id")
          .groupBy("user_id")
          .orderBy(["points desc", "attended desc"]);

        // SeasonId can be 0 which is non-truthy
        if (seasonId !== undefined) {
          q = q.where("tournaments.season_id", "=", seasonId);
        }
        if (faction && faction.side_code == "corp") {
          q = q.where("results.corp_deck_faction", "=", faction.code);
        }
        if (faction && faction.side_code == "runner") {
          q = q.where("results.runner_deck_faction", "=", faction.code);
        }
        if (format) {
          q = q.where("tournaments.format", "=", format);
        }

        return q.as("inner");
      })
      .select(["user_id", "user_name", "points"])
      .select((eb) =>
        eb.fn
          .agg<number>("ROW_NUMBER")
          .over((ob) => ob.orderBy("points", "desc"))
          .as("rank"),
      );

    return await q.execute();
  }
}
