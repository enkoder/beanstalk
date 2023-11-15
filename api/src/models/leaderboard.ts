import { getDB } from "./index";
import { Selectable, Updateable } from "kysely/dist/esm";

export interface LeaderboardTable {
  user_id: number;
  season_id: number;
  rank: number;
  points: number;
  most_recent_tournament_id: number | null;
}

export type Leaderboard = Selectable<LeaderboardTable>;
export type UpdateLeaderboard = Updateable<LeaderboardTable>;

export class Leaderboards {
  public static async getExpanded() {
    return await getDB()
      .selectFrom("leaderboards")
      .leftJoin(
        "tournaments",
        "leaderboards.most_recent_tournament_id",
        "tournaments.id",
      )
      .selectAll("leaderboards")
      .select([
        "tournaments.id as most_recent_tournament_id",
        "tournaments.name as most_recent_tournament_name",
      ])
      .execute();
  }

  public static async getUserRankForSeason(seasonId: number, userId: number) {
    const result = await getDB()
      .selectFrom("leaderboards")
      .leftJoin("seasons", "leaderboards.season_id", "seasons.id")
      .select("rank")
      .where("season_id", "=", seasonId)
      .where("user_id", "=", userId)
      .executeTakeFirst();
    if (!result) {
      return 0;
    }
    return result.rank;
  }

  public static async recalculateLeaderboard(seasonId?: number) {
    const q = getDB()
      .selectFrom((innerEb) => {
        let q = innerEb
          .selectFrom("results")
          .select((eb) => [
            "users.id as user_id",
            eb.fn.sum<number>("results.points_earned").as("points"),
            eb.fn.countAll<number>().as("attended"),
            "tournaments.season_id as season_id",
          ])
          .innerJoin("users", "results.user_id", "users.id")
          .innerJoin("tournaments", "tournaments.id", "results.tournament_id")
          .where("user_id", "!=", 0)
          .groupBy("user_id")
          .orderBy(["points desc", "attended desc"]);

        if (seasonId) {
          q = q.where("tournaments.season_id", "=", seasonId);
        }

        return q.as("inner");
      })
      .select(["user_id", "season_id", "points"])
      .select((eb) =>
        eb.fn
          .agg<number>("ROW_NUMBER")
          .over((ob) => ob.orderBy("points", "desc"))
          .as("rank"),
      );

    for (const result of await q.execute()) {
      await Leaderboards.updateRanking(result);
    }
  }

  static async updateRanking(leaderboard: UpdateLeaderboard) {
    console.log(JSON.stringify(leaderboard));
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
