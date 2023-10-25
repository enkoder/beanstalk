import { json } from "itty-router";
import { Env, RequestWithDB } from "../types";
import {
  IngestTournamentSchema,
  RerankSchema,
  UpdateCardsSchema,
  UpdateUsersSchema,
} from "../openapi";
import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import { Results } from "../models/results";
import { Seasons } from "../models/season";
import { getSeason0Points } from "../lib/ranking";
import { Tournaments } from "../models/tournament";
import { Users } from "../models/user";
import { getNameFromId } from "../lib/nrdb";
import { abrIngest } from "../background";
import pLimit from "p-limit";

export class Rerank extends OpenAPIRoute {
  static schema = RerankSchema;

  async handle(_: RequestWithDB) {
    let count: number = 0;

    for (const season of await Seasons.getAll()) {
      const results = await Results.getBySeasonId(season.id);
      for (const result of results) {
        console.log(JSON.stringify(result));
        const tournament = await Tournaments.get(result.tournament_id);

        const points = getSeason0Points(
          tournament.type,
          tournament.registration_count,
          result.rank_swiss,
          result.rank_cut,
        );
        if (result.points_earned != points) {
          await Results.update(result.tournament_id, result.user_id, {
            points_earned: points,
          });
          count += 1;
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
    const url = new URL("https://netrunnerdb.com/api/2.0/public/cards");
    const resp = await fetch(url.toString());
    if (!resp.ok) {
      throw new Error(`Error (${resp.status}): ${await resp.text()}`);
    }
    const cards = await resp.json();

    const limit = pLimit(5);

    const chunkedCards = [];
    let index = 0;
    while (index < cards.data.length) {
      chunkedCards.push(cards.data.slice(index, 100 + index));
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
    //await env.INGEST_CARD_Q.sendBatch(
    //  cards.data.map((card) => ({ body: card, contentType: "json" })),
    //);
    //return json({});
  }
}
