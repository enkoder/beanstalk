import { json } from "itty-router";
import { Env, RequestWithDB } from "../types";
import {
  IngestTournamentSchema,
  RerankSchema,
  RerankSummary,
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

export class Rerank extends OpenAPIRoute {
  static schema = RerankSchema;

  async handle(_: RequestWithDB) {
    const count: number = 0;

    for (const season of await Seasons.getAll()) {
      const results = await Results.getBySeasonId(season.id);
      for (const result of results) {
        console.log(JSON.stringify(result));
        const tournament = await Tournaments.get(result.tournament_id);
        await Results.update(result.tournament_id, result.user_id, {
          points_earned: getSeason0Points(
            tournament.type,
            results.length,
            result.rank_swiss,
            result.rank_cut,
          ),
        });
      }
    }

    return json(RerankSummary.parse({ numberUsersUpdate: count }));
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
