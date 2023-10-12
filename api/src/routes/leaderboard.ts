import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import {
  GetLeaderboardRowType,
  GetLeaderboardSchema,
  GetSeasonsResponse,
  GetSeasonsResponseType,
  GetSeasonsSchema,
  GetTournamentsResponse,
  GetTournamentsResponseType,
  GetTournamentsSchema,
} from "../openapi";
import { RequestWithDB } from "../types";
import { json } from "itty-router";

class GetSeasons extends OpenAPIRoute {
  static schema = GetSeasonsSchema;

  async handle(req: RequestWithDB) {
    const result = await req.db.selectFrom("seasons").selectAll().execute();
    const retArr: GetSeasonsResponseType[] = [];
    result.forEach((row) => retArr.push(GetSeasonsResponse.parse(row)));
    return json(retArr);
  }
}

class GetTournaments extends OpenAPIRoute {
  static schema = GetTournamentsSchema;

  async handle(req: RequestWithDB) {
    const results = await req.db
      .selectFrom("tournaments")
      .leftJoin("seasons", "tournaments.id", "seasons.id")
      .select([
        "tournaments.id",
        "tournaments.name",
        "tournaments.date",
        "tournaments.is_done",
        "tournaments.season_id",
        "seasons.name as season_name",
        "seasons.tier as season_tier",
      ])
      .execute();

    const retArr: GetTournamentsResponseType[] = [];
    results.forEach((row) => {
      // @ts-ignore
      retArr.push(GetTournamentsResponse.parse(row));
    });
    return json(retArr);
  }
}

class GetLeaderboard extends OpenAPIRoute {
  static schema = GetLeaderboardSchema;

  async handle(req: RequestWithDB) {
    const results = await req.db
      .selectFrom("leaderboard")
      .leftJoin(
        "tournaments",
        "leaderboard.most_recent_tournament_id",
        "tournaments.id",
      )
      .select([
        "leaderboard.user_id",
        "leaderboard.points",
        "leaderboard.rank",
        "tournaments.id as most_recent_tournament_id",
        "tournaments.name as most_recent_tournament_name",
      ])
      .execute();
    const retArr: GetLeaderboardRowType[] = [];
    results.forEach((row) => {
      // @ts-ignore
      retArr.push(GetLeaderboardRow.parse(row));
    });
    return json(retArr);
  }
}
export { GetSeasons, GetTournaments, GetLeaderboard };
