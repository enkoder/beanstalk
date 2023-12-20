import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import {
  CreateBackupOptions,
  createBackup,
} from "@nora-soderlund/cloudflare-d1-backups";
import { parseISO } from "date-fns";
import { json } from "itty-router";
import pLimit from "p-limit";
import { abrIngest } from "../background.js";
import { getCards, getNameFromId } from "../lib/nrdb.js";
import {
  TOURNAMENT_POINTS,
  calculateTournamentPointDistribution,
} from "../lib/ranking.js";
import * as Results from "../models/results.js";
import * as Seasons from "../models/season.js";
import * as Tournaments from "../models/tournament.js";
import * as Users from "../models/user.js";
import {
  ExportDBSchema,
  IngestTournamentBody,
  IngestTournamentSchema,
  RerankSchema,
  UpdateCardsSchema,
  UpdateTournamentSeasonSchema,
  UpdateUsersSchema,
} from "../openapi.js";
import { Env, RequestWithDB } from "../types.d.js";

export class Rerank extends OpenAPIRoute {
  static schema = RerankSchema;

  async handle(_: RequestWithDB) {
    let count = 0;

    for (const season of await Seasons.getAll()) {
      const tournaments = await Tournaments.getBySeasonId(season.id);
      for (const tournament of tournaments) {
        const results = await Results.getExpanded({
          tournamentId: tournament.id,
        });

        // Totally arbitrary
        if (results.length <= 6) {
          continue;
        }

        const { points } = calculateTournamentPointDistribution(
          TOURNAMENT_POINTS[tournament.type],
          results.length,
        );

        for (let i = 0; i < results.length; i++) {
          const result = results[i];

          if (result.points_earned !== points[i]) {
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

  async handle(req: RequestWithDB, env: Env, _: ExecutionContext, data) {
    const body = IngestTournamentBody.parse(data.body);
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

export class ExportDB extends OpenAPIRoute {
  static schema = ExportDBSchema;

  async handle(req: Request, env: Env) {
    const options: CreateBackupOptions = {
      fileName: `backups/${new Date().toUTCString()}.sql`,
      queryLimit: 10,
    };

    const result = await createBackup(env.DB, env.BACKUP_BUCKET, options);
    return Response.json(result);
  }
}
