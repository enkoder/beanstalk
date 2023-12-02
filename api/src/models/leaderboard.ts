import { getDB } from "./index";
import { Faction } from "./factions";
import { Format } from "./tournament";
import { Selectable, Updateable } from "kysely/dist/esm";
import pLimit from "p-limit";

export interface LeaderboardTable {
  user_id: number;
  season_id: number;
  rank: number;
  points: number;
}

export type LeaderboardRow = Selectable<LeaderboardTable>;
export type UpdateLeaderboard = Updateable<LeaderboardTable>;

export class Leaderboards {
  public static async getFromSeasonIdExpanded(
    seasonId: number,
  ): Promise<LeaderboardRow[]> {
    return await getDB()
      .selectFrom("leaderboards")
      .innerJoin("seasons", "seasons.id", "leaderboards.season_id")
      .innerJoin("users", "leaderboards.user_id", "users.id")
      .selectAll("leaderboards")
      .select(["seasons.name as season_name"])
      .select(["users.name as user_name"])
      .where("leaderboards.season_id", "=", seasonId)
      .orderBy("rank asc")
      .execute();
  }

  public static async getUserRank(
    userId: number,
    seasonId?: number,
    faction?: Faction,
    format?: Format,
  ) {
    const results = await this.getExpanded(seasonId, faction, format, userId);
    if (!results.length) {
      return 0;
    }

    if (userId != results[0].user_id) {
      throw new Error(`Error: Could not determine rank for user ${userId}`);
    }
    return results[0].rank;
  }

  public static async getExpanded(
    seasonId?: number,
    faction?: Faction,
    format?: Format,
    userId?: number,
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
            "tournaments.season_id as season_id",
            "tournaments.format as format",
            "seasons.name as season_name",
          ])
          .innerJoin("users", "results.user_id", "users.id")
          .innerJoin("tournaments", "tournaments.id", "results.tournament_id")
          .innerJoin("seasons", "seasons.id", "results.season_id")
          .where("user_id", "!=", 0)
          .groupBy("user_id")
          .orderBy(["points desc", "attended desc"]);

        if (seasonId) {
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
        if (userId) {
          q = q.where("users.id", "=", userId);
        }

        return q.as("inner");
      })
      .select(["user_id", "user_name", "season_id", "season_name", "points"])
      .select((eb) =>
        eb.fn
          .agg<number>("ROW_NUMBER")
          .over((ob) => ob.orderBy("points", "desc"))
          .as("rank"),
      );

    return await q.execute();
  }

  public static async recalculateLeaderboard(seasonId?: number) {
    const rows = await this.getExpanded(seasonId);
    const limit = pLimit(5);
    for (let i = 0; i < rows.length; i += 5) {
      await Promise.all(
        rows.slice(i, i + 5).map((row) =>
          limit(() => {
            Leaderboards.updateRanking(row);
          }),
        ),
      );
    }
  }

  static async updateRanking(leaderboard: UpdateLeaderboard) {
    return await getDB()
      .insertInto("leaderboards")
      .values(leaderboard)
      .onConflict((oc) => {
        return oc.columns(["user_id", "season_id"]).doUpdateSet(leaderboard);
      })
      .returningAll()
      .executeTakeFirst();
  }
}
