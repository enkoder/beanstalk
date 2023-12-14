import { RequestWithDB } from "../types.d.js";
import { Tournaments } from "../models/tournament.js";
import {
  GetTournamentResultsSchema,
  GetTournamentSchema,
  GetTournamentsSchema,
  ResultComponent,
  TournamentComponent,
} from "../openapi.js";
import { Results } from "../models/results.js";
import { json } from "itty-router";
import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";

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
  static schema = GetTournamentResultsSchema;

  async handle(req: RequestWithDB) {
    const tournamentId = req.params!["tournamentId"];
    const results = await Results.getByTournamentIdExpanded(
      Number(tournamentId),
    );
    return json(
      results
        .sort((a, b) =>
          (a.rank_cut || a.rank_swiss) > (b.rank_cut || b.rank_swiss) ? 1 : -1,
        )
        .map((result) => ResultComponent.parse(result)),
    );
  }
}
