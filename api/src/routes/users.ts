import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import type { ExecutionContext } from "@cloudflare/workers-types/experimental";
import { error, json } from "itty-router";
import { errorResponse } from "../lib/errors.js";
import { traceDeco } from "../lib/tracer.js";
import { getFactionFromCode } from "../models/factions.js";
import { Leaderboard } from "../models/leaderboard.js";
import { Results } from "../models/results.js";
import { Seasons } from "../models/season.js";
import { Users } from "../models/user.js";
import {
  GetUserResultsSchema,
  GetUserSchema,
  GetUsersSchema,
  MeSchema,
  PatchMeSchema,
  ResultComponent,
  type UpdateUserComponentType,
  UserComponent,
} from "../openapi.js";
import type { FactionCode, Format } from "../schema.js";
import type { Env, RequestWithDB } from "../types.d.js";

export class GetUser extends OpenAPIRoute {
  static schema = GetUserSchema;

  @traceDeco("GetUser")
  async handle(req: RequestWithDB) {
    const user = await Users.getById(Number(req.params?.userID));

    if (!user || user.disabled) {
      return errorResponse(400, "User does not exist");
    }
    return json(UserComponent.parse(user));
  }
}

export class GetUsers extends OpenAPIRoute {
  static schema = GetUsersSchema;

  @traceDeco("GetUsers")
  async handle(_: RequestWithDB) {
    // TODO: pagination
    const users = await Users.getAll();
    if (!users) {
      return error(500, "No users in table??");
    }

    return json(
      users.filter((u) => !u.disabled).map((user) => UserComponent.parse(user)),
    );
  }
}

export class Me extends OpenAPIRoute {
  static schema = MeSchema;

  @traceDeco("Me")
  async handle(req: RequestWithDB) {
    const user = await Users.getById(Number(req.user_id));
    return json(UserComponent.parse(user));
  }
}

export class PatchMe extends OpenAPIRoute {
  static schema = PatchMeSchema;

  @traceDeco("PatchMe")
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
    if (!user || user.disabled) {
      return errorResponse(400, "User does not exist");
    }

    const format = req.query.format as Format;

    const factionCode = req.query.factionCode;
    const faction = factionCode
      ? getFactionFromCode(factionCode as FactionCode)
      : undefined;

    const tags = Array.isArray(req.query.tags)
      ? (req.query.tags as string[])
      : req.query.tags
        ? [req.query.tags]
        : null;

    let seasonName: string | undefined = undefined;
    let seasonId: number | undefined = undefined;

    if (req.query.season != null) {
      const season = await Seasons.getFromId(Number(req.query.season));
      seasonName = season.name;
      seasonId = season.id;
    }

    const results = await Results.getExpanded({
      userId: user.id,
      seasonId: seasonId,
      faction: faction,
      format: format,
      tags: tags,
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
      season_id: seasonId || null,
      seasonName: seasonName,
      format: format,
      factionCode: faction?.code || null,
      rank: currentRank,
      results: results.map((result) => ResultComponent.parse(result)),
    });
  }
}
