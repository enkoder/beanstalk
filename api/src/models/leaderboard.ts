import { getDB } from "./index";
import { Faction } from "./factions";
import { Format, TournamentType } from "./tournament";
import { MAX_TOURNAMENTS_PER_TYPE } from "../lib/ranking";

type LeaderboardRow = {
  points: number;
  rank: number;
  user_id: number;
  user_name: string;
  attended: number;
};

const getCaseWhen = (eb) => {
  let cb = eb.case();

  for (const key in TournamentType) {
    // https://stackoverflow.com/questions/51280565/iterate-over-an-enum-with-typescript-and-assign-to-an-enum
    const type: TournamentType =
      TournamentType[key as keyof typeof TournamentType];

    if (!MAX_TOURNAMENTS_PER_TYPE[type]) {
      continue;
    }

    const max = MAX_TOURNAMENTS_PER_TYPE[type];
    cb = cb.when("tournament_type", "=", type).then(max);
  }

  return cb.else(0).end();
};

export class Leaderboards {
  public static async getExpanded({
    seasonId,
    faction,
    format,
  }: {
    seasonId?: number;
    faction?: Faction;
    format?: Format;
  }): Promise<LeaderboardRow[]> {
    const q = getDB()
      .with("ranked_users", (db) => {
        let q = db
          .selectFrom("results")
          .innerJoin("tournaments", "tournaments.id", "results.tournament_id")
          .innerJoin("users", "users.id", "results.user_id")
          .select((eb) => [
            "results.user_id as user_id",
            "results.points_earned as points_earned",
            "tournaments.id as tournament_id",
            "tournaments.type as tournament_type",
            eb.fn
              .agg<number>("rank")
              .over((ob) =>
                ob
                  .partitionBy(["results.user_id", "tournaments.type"])
                  .orderBy("results.points_earned", "desc")
                  .orderBy("tournaments.id", "asc"),
              )
              .as("tournament_rank"),
          ]);

        if (seasonId != null) {
          q = q.where("season_id", "=", seasonId);
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

        return q;
      })
      .with("filtered_users", (db) => {
        let q = db
          .selectFrom("ranked_users")
          .select((eb) => [
            "user_id",
            "tournament_type",
            "tournament_id",
            eb.fn.count<number>("tournament_id").as("attended"),
            eb.fn.sum<number>("points_earned").as("points"),
          ]);

        if (seasonId != null) {
          q = q
            .select((eb) => getCaseWhen(eb).as("max_results_per_tournament"))
            // @ts-ignore
            .whereRef("tournament_rank", "<=", "max_results_per_tournament");
        }

        q = q.groupBy("user_id");

        return q;
      })
      .selectFrom("filtered_users")
      .innerJoin("users", "users.id", "filtered_users.user_id")
      .innerJoin(
        "results",
        "results.tournament_id",
        "filtered_users.tournament_id",
      )
      .innerJoin(
        "tournaments",
        "tournaments.id",
        "filtered_users.tournament_id",
      )
      .select((eb) => [
        "filtered_users.user_id as user_id",
        "users.name as user_name",
        "filtered_users.points as points",
        "filtered_users.attended as attended",
        eb.fn
          .agg<number>("ROW_NUMBER")
          .over((ob) =>
            ob
              .orderBy("filtered_users.points", "desc")
              .orderBy("filtered_users.attended", "desc"),
          )
          .as("rank"),
      ])
      .groupBy("users.id")
      .orderBy("rank");

    return await q.execute();
  }
}
