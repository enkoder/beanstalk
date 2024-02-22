import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import { error, json } from "itty-router";
import { traceDeco } from "../lib/tracer.js";
import { Results } from "../models/results.js";
import { Tournaments } from "../models/tournament.js";
import {
  GetTournamentResultsSchema,
  GetTournamentSchema,
  GetTournamentsSchema,
  ResultComponent,
  TournamentComponent,
} from "../openapi.js";
import type { RequestWithDB } from "../types.d.js";

export class GetTournament extends OpenAPIRoute {
  static schema = GetTournamentSchema;

  @traceDeco("GetTournament")
  async handle(req: RequestWithDB) {
    const tournamentId = req.params?.tournamentId;
    const tournament = await Tournaments.get(Number(tournamentId));
    if (!tournament) {
      return error(400, "Invalid tournament ID provided.");
    }
    return json(TournamentComponent.parse(tournament));
  }
}

export class GetTournaments extends OpenAPIRoute {
  static schema = GetTournamentsSchema;

  @traceDeco("GetTournaments")
  async handle(_: RequestWithDB) {
    const tournaments = await Tournaments.getAllExpanded();

    return json(
      tournaments.map((tournament) => TournamentComponent.parse(tournament)),
    );
  }
}

export class GetTournamentResults extends OpenAPIRoute {
  static schema = GetTournamentResultsSchema;

  @traceDeco("GetTournamentResults")
  async handle(req: RequestWithDB) {
    const tournamentId = req.params?.tournamentId;
    const results = await Results.getExpanded({
      tournamentId: Number(tournamentId),
    });

    if (results.length === 0) {
      return error(400, "Invalid tournament ID provided.");
    }
    // sanitize user data if disabled
    for (const result of results) {
      if (result.disabled) {
        result.user_name = null;
        result.user_id = 0;
      }
    }

    return json(
      results
        .sort((a, b) =>
          (a.rank_cut || a.rank_swiss) > (b.rank_cut || b.rank_swiss) ? 1 : -1,
        )
        .map((result) => ResultComponent.parse(result)),
    );
  }
}
