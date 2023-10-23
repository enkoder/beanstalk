import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import {
  GetSeasonTournamentsSchema,
  GetSeasonsSchema,
  SeasonComponent,
  TournamentComponent,
} from "../openapi";
import { RequestWithDB } from "../types";
import { Seasons } from "../models/season";
import { json } from "itty-router";
import { Tournaments } from "../models/tournament";

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
    console.log(JSON.stringify(tournaments[0]));
    return json(
      tournaments.map((tournament) => TournamentComponent.parse(tournament)),
    );
  }
}
