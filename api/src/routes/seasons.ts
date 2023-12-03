import {
  GetSeasonsSchema,
  GetSeasonTournamentsSchema,
  SeasonComponent,
  TournamentComponent,
} from "../openapi";
import { RequestWithDB } from "../types";
import { Seasons } from "../models/season";
import { Tournaments } from "../models/tournament";
import { json } from "itty-router";
import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";

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
    const seasonId = req.params!["seasonId"];
    const tournaments = await Tournaments.getAllExpandedFromSeasonId(
      Number(seasonId),
    );
    return json(
      tournaments.map((tournament) => TournamentComponent.parse(tournament)),
    );
  }
}
