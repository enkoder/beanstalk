import { traceDeco } from "../lib/tracer.js";
import { Faction, Format } from "../schema.js";
import { Results } from "./results.js";

type LeaderboardRow = {
  points: number;
  rank: number;
  user_id: number;
  user_name: string;
  attended: number;
};

// biome-ignore lint/complexity/noStaticOnlyClass:
export class Leaderboard {
  @traceDeco("Leaderboard")
  public static async getExpanded({
    seasonId,
    faction,
    format,
  }: {
    seasonId?: number;
    faction?: Faction;
    format?: Format;
  }): Promise<LeaderboardRow[]> {
    const results = await Results.getExpanded({ seasonId, faction, format });

    const rows: Record<number, LeaderboardRow> = {};
    for (const result of results) {
      if (!(result.user_id in rows)) {
        rows[result.user_id] = {
          points: 0,
          rank: 0,
          user_id: result.user_id,
          user_name: result.user_name,
          attended: 0,
        } as LeaderboardRow;
      }

      // sum up the points, only if the result is valid
      if (result.is_valid) {
        rows[result.user_id].points += result.points_earned;
      }

      rows[result.user_id].attended += 1;
    }

    const sortedRows = Object.values(rows).sort((a, b) => {
      if (a.points === b.points) {
        return b.attended - a.attended;
      }
      return b.points - a.points;
    });

    for (let i = 0; i < sortedRows.length; i++) {
      sortedRows[i].rank = i + 1;
    }

    // Sort up the rows by points and then attended as a tiebreaker
    return sortedRows;
  }
}
