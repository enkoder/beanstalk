import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import { parseISO } from "date-fns";
import { json } from "itty-router";
import pLimit from "p-limit";
import {
  publishAllTournamentIngest,
  publishIngestTournament,
} from "../background.js";
import { getCards, getNameFromId } from "../lib/nrdb.js";
import { trace, traceDeco } from "../lib/tracer.js";
import { Seasons } from "../models/season.js";
import { Tournaments } from "../models/tournament.js";
import { Users } from "../models/user.js";
import {
  IngestTournamentBody,
  IngestTournamentSchema,
  IngestTournamentsSchema,
  UpdateCardsSchema,
  UpdateTournamentSeasonSchema,
  UpdateUsersSchema,
} from "../openapi.js";
import type { Env, RequestWithDB } from "../types.d.js";

export class UpdateUsers extends OpenAPIRoute {
  static schema = UpdateUsersSchema;

  async handle(_: RequestWithDB) {
    const users = await Users.getAllWithoutName();
    for (let i = 0; i < users.length; i++) {
      const user = await Users.update(users[i].id, {
        name: await getNameFromId(users[i].id),
      });
    }
    return json({});
  }
}

export class IngestTournament extends OpenAPIRoute {
  static schema = IngestTournamentSchema;

  async handle(req: RequestWithDB, env: Env, _: ExecutionContext, data) {
    const body = IngestTournamentBody.parse(data.body);
    await trace(
      "publishIngestTournament",
      () =>
        publishIngestTournament(env, "api", body.userId, body.tournamentType),
      {
        trigger: "api",
        tournament_type: body.tournamentType,
        user_id: body.userId,
      },
    );
    return json({});
  }
}

export class IngestTournaments extends OpenAPIRoute {
  static schema = IngestTournamentsSchema;

  async handle(req: RequestWithDB, env: Env, _: ExecutionContext) {
    await trace(
      "publishAllTournamentIngest",
      () => publishAllTournamentIngest(env, "api"),
      { trigger: "api" },
    );
    return json({});
  }
}

export class UpdateCards extends OpenAPIRoute {
  static schema = UpdateCardsSchema;

  @traceDeco("UpdateCards")
  async handle(req: RequestWithDB, env: Env) {
    const limit = pLimit(5);

    const cards = await getCards();
    const chunkedCards = [];
    let index = 0;
    while (index < cards.length) {
      chunkedCards.push(cards.slice(index, 100 + index));
      index += 100;
    }

    await Promise.all(
      chunkedCards.map((chunk) =>
        limit(() =>
          env.INGEST_CARD_Q.sendBatch(
            chunk.map((card) => ({ body: card, contentType: "json" })),
          ),
        ),
      ),
    );

    return json({});
  }
}

export class UpdateTournamentSeasons extends OpenAPIRoute {
  static schema = UpdateTournamentSeasonSchema;

  async handle(_: RequestWithDB) {
    let count = 0;

    const seasons = await Seasons.getAll();

    for (const tournament of await Tournaments.getAll()) {
      // ensure the tournament is done and has a valid date, should always have a valid date though
      if (!(tournament.concluded && tournament.date)) {
        continue;
      }

      const tournamentDate = parseISO(tournament.date);
      for (const season of seasons) {
        if (
          tournamentDate >= parseISO(season.started_at) &&
          tournamentDate <= parseISO(season.ended_at)
        ) {
          tournament.season_id = season.id;
          await Tournaments.update(tournament);
          count += 1;
          break;
        }
      }
    }

    return json({ tournamentsUpdated: count });
  }
}
