import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import {
  GetLeaderboardRow,
  GetLeaderboardSchema,
  GetSeasonsResponse,
  GetSeasonsSchema,
  GetTournamentsResponse,
  GetTournamentsSchema,
} from "../openapi";
import { RequestWithDB } from "../types";
import { json } from "itty-router";
import { Seasons } from "../models/season";
import { TournamentType, Tournaments } from "../models/tournament";
import { Leaderboard } from "../models/leaderboard";
import { Results } from "../models/results";

class GetSeasons extends OpenAPIRoute {
  static schema = GetSeasonsSchema;

  async handle(_: RequestWithDB) {
    const seasons = await Seasons.getAll();
    return json(seasons.map((season) => GetSeasonsResponse.parse(season)));
  }
}

class GetTournaments extends OpenAPIRoute {
  static schema = GetTournamentsSchema;

  async handle(_: RequestWithDB) {
    const tournaments = await Tournaments.getAllExpanded();

    return json(
      tournaments.map((tournament) => {
        GetTournamentsResponse.parse(tournament);
      }),
    );
  }
}

class GetLeaderboard extends OpenAPIRoute {
  static schema = GetLeaderboardSchema;

  async handle(_: RequestWithDB) {
    const leaderboard = await Leaderboard.getExpanded();

    const results = await Results.getByTournamentType(
      TournamentType.Continental,
    );
    for (const result of results) {
      console.log(JSON.stringify(result));
    }
    return json(
      leaderboard.map((row) => {
        GetLeaderboardRow.parse(row);
      }),
    );
  }
}
export { GetSeasons, GetTournaments, GetLeaderboard };
