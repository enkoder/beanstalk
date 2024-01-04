import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import { json } from "itty-router";
import { Seasons } from "../models/season.js";
import { Tournaments } from "../models/tournament.js";
import {
  GetSeasonTournamentsSchema,
  GetSeasonsSchema,
  SeasonComponent,
  TournamentComponent,
} from "../openapi.js";
import { RequestWithDB } from "../types.d.js";

export class GetSeasons extends OpenAPIRoute {
  static schema = GetSeasonsSchema;

  async handle(_: RequestWithDB) {
    const seasons = await Seasons.getAll();
    return json(seasons.map((season) => SeasonComponent.parse(season)));
  }
}

export class GetSeasonTournaments extends OpenAPIRoute {
  static schema = GetSeasonTournamentsSchema;

  async handle(req: RequestWithDB) {
    const seasonId = req.params?.seasonId;
    const tournaments = await Tournaments.getAllExpandedFromSeasonId(
      Number(seasonId),
    );
    return json(
      tournaments.map((tournament) => TournamentComponent.parse(tournament)),
    );
  }
}
