import { Env, RequestWithDB } from "../types";
import {
  IngestTournamentSchema,
  RerankSchema,
  UpdateCardsSchema,
  UpdateTournamentSeasonSchema,
  UpdateUsersSchema,
} from "../openapi";
import { Results } from "../models/results";
import { Seasons } from "../models/season";
import {
  calculateTournamentPointDistribution,
  findAlphaForDesiredDistribution,
  TOURNAMENT_POINTS,
} from "../lib/ranking";
import { Tournaments } from "../models/tournament";
import { Users } from "../models/user";
import { getCards, getNameFromId } from "../lib/nrdb";
import { abrIngest } from "../background";
import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import { json } from "itty-router";
import pLimit from "p-limit";
import { parseISO } from "date-fns";

export class Rerank extends OpenAPIRoute {
  static schema = RerankSchema;

  async handle(_: RequestWithDB) {
    let count: number = 0;

    for (const season of await Seasons.getAll()) {
      const tournaments = await Tournaments.getBySeasonId(season.id);
      for (const tournament of tournaments) {
        const results = await Results.getManyExpandedByTournamentId(
          tournament.id,
        );

        // Totally arbitrary
        if (results.length <= 6) {
          continue;
        }

        const alpha = findAlphaForDesiredDistribution(results.length);
        const points = calculateTournamentPointDistribution(
          TOURNAMENT_POINTS[tournament.type],
          results.length,
          alpha,
        );

        for (let i = 0; i < results.length; i++) {
          const result = results[i];

          console.log(i, result.rank_swiss, points[i]);
          if (result.points_earned != points[i]) {
            await Results.update(result.tournament_id, result.user_id, {
              points_earned: points[i],
            });
            count += 1;
          }
        }
      }
    }

    return json({ numberUsersUpdate: count });
  }
}

export class UpdateUsers extends OpenAPIRoute {
  static schema = UpdateUsersSchema;

  async handle(_: RequestWithDB) {
    const users = await Users.getAllWithoutName();
    console.log(JSON.stringify(users));
    for (let i = 0; i < users.length; i++) {
      console.log(JSON.stringify(users[i]));
      const user = await Users.update(users[i].id, {
        name: await getNameFromId(users[i].id),
      });
      console.log(JSON.stringify(user));
    }
    return json({});
  }
}

export class IngestTournaments extends OpenAPIRoute {
  static schema = IngestTournamentSchema;

  async handle(req: RequestWithDB, env: Env, _: ExecutionContext, data: any) {
    const body = IngestTournamentSchema.requestBody.parse(data.body);
    await abrIngest(env, body.userId, body.tournamentType);
    return json({});
  }
}

export class UpdateCards extends OpenAPIRoute {
  static schema = UpdateCardsSchema;

  async handle(req: RequestWithDB, env: Env) {
    const limit = pLimit(5);

    const cards = await getCards();
    const chunkedCards = [];
    let index = 0;
    while (index < cards.length) {
      chunkedCards.push(cards.slice(index, 100 + index));
      index += 100;
    }

    console.log(chunkedCards.length);
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
    let count: number = 0;

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
