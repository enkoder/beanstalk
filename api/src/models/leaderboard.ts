import { getDB } from "./index";

export interface LeaderboardTable {
  user_id: number;
  rank: number;
  points: number;
  most_recent_tournament_id: number | null;
}

export class Leaderboard {
  public static async getExpanded() {
    return await getDB()
      .selectFrom("leaderboard")
      .leftJoin(
        "tournaments",
        "leaderboard.most_recent_tournament_id",
        "tournaments.id",
      )
      .selectAll("leaderboard")
      .select([
        "tournaments.id as most_recent_tournament_id",
        "tournaments.name as most_recent_tournament_name",
      ])
      .execute();
  }
}
