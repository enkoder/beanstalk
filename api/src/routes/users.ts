import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import { ExecutionContext } from "@cloudflare/workers-types/experimental";
import { json } from "itty-router";
import { errorResponse } from "../lib/errors.js";
import { getFactionFromCode } from "../models/factions.js";
import { Leaderboard } from "../models/leaderboard.js";
import * as Results from "../models/results.js";
import * as Seasons from "../models/season.js";
import * as Users from "../models/user.js";
import {
  GetUserResultsSchema,
  GetUserSchema,
  GetUsersSchema,
  MeSchema,
  PatchMeSchema,
  ResultComponent,
  UpdateUserComponentType,
  UserComponent,
} from "../openapi.js";
import { FactionCode, Format } from "../schema.js";
import { Env, RequestWithDB } from "../types.d.js";

export class GetUser extends OpenAPIRoute {
  static schema = GetUserSchema;

  async handle(req: RequestWithDB) {
    const user = await Users.getById(Number(req.params?.userID));

    if (!user) {
      return errorResponse(400, "User does not exist");
    }
    return json(UserComponent.parse(user));
  }
}

export class GetUsers extends OpenAPIRoute {
  static schema = GetUsersSchema;

  async handle(_: RequestWithDB) {
    // TODO: pagination
    const users = await Users.getAll();
    if (!users) {
      throw new Error("No users in table??");
    }

    return json(users.map((user) => UserComponent.parse(user)));
  }
}

export class Me extends OpenAPIRoute {
  static schema = MeSchema;

  async handle(req: RequestWithDB) {
    const user = await Users.getById(Number(req.user_id));
    return json(UserComponent.parse(user));
  }
}

export class PatchMe extends OpenAPIRoute {
  static schema = PatchMeSchema;

  async handle(req: RequestWithDB, env: Env, ctx: ExecutionContext, data) {
    const body = data.body as UpdateUserComponentType;

    const user = await Users.getById(Number(req.user_id));
    if (body.email !== undefined) {
      user.email = body.email;
    }
    if (body.disabled !== undefined) {
      user.disabled = Number(body.disabled);
    }

    return json(UserComponent.parse(await Users.update(user.id, user)));
  }
}

export class GetUserResults extends OpenAPIRoute {
  static schema = GetUserResultsSchema;

  async handle(req: RequestWithDB) {
    const userIdOrName = req.params?.user;

    const user = await Users.getByIdOrName(decodeURI(userIdOrName));
    if (!user) {
      return errorResponse(400, "User does not exist");
    }

    const format = req.query.format as Format;

    const factionCode = req.query.factionCode;
    const faction = factionCode
      ? getFactionFromCode(factionCode as FactionCode)
      : undefined;

    let seasonName: string = undefined;
    let seasonId: number = undefined;

    if (req.query.season !== undefined) {
      const season = await Seasons.getFromId(Number(req.query.season));
      seasonName = season.name;
      seasonId = season.id;
    }

    const results = await Results.getExpanded({
      userId: user.id,
      seasonId: seasonId,
      faction: faction,
      format: format,
    });

    let currentRank = 0;
    for (const row of await Leaderboard.getExpanded({
      seasonId,
      faction,
      format,
    })) {
      if (row.user_id === user.id) {
        currentRank = row.rank;
      }
    }

    return json({
      user_id: user.id,
      user_name: user.name,
      seasonId: seasonId,
      seasonName: seasonName,
      format: format,
      factionCode: faction?.code,
      rank: currentRank,
      results: results.map((result) => ResultComponent.parse(result)),
    });
  }
}
