import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import { RequestWithDB } from "../types";
import { json } from "itty-router";
import { Tournaments } from "../models/tournament";
import {
  GetTournamentSchema,
  GetTournamentsSchema,
  ResultComponent,
  TournamentComponent,
} from "../openapi";
import { Results } from "../models/results";

export class GetTournament extends OpenAPIRoute {
  static schema = GetTournamentSchema;

  async handle(req: RequestWithDB) {
    const tournamentId = req.params!["tournamentId"];
    const tournament = await Tournaments.get(Number(tournamentId));
    return json(TournamentComponent.parse(tournament));
  }
}

export class GetTournaments extends OpenAPIRoute {
  static schema = GetTournamentsSchema;

  async handle(_: RequestWithDB) {
    const tournaments = await Tournaments.getAllExpanded();

    return json(
      tournaments.map((tournament) => {
        TournamentComponent.parse(tournament);
      }),
    );
  }
}

export class GetTournamentResults extends OpenAPIRoute {
  static schema = GetTournamentSchema;

  async handle(req: RequestWithDB) {
    const tournamentId = req.params!["tournamentId"];
    const results = await Results.getManyExpandedByTournamentId(
      Number(tournamentId),
    );
    return json(results.map((result) => ResultComponent.parse(result)));
  }
}
