import { RequestWithDB } from "../types";
import {
  GetUserResultsSchema,
  GetUserSchema,
  GetUsersSchema,
  MeSchema,
  ResultComponent,
  UserComponent,
} from "../openapi";
import { errorResponse } from "../lib/errors";
import { Users } from "../models/user";
import { Results } from "../models/results";
import { Seasons } from "../models/season";
import { Leaderboards } from "../models/leaderboard";
import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import { json } from "itty-router";

export class GetUser extends OpenAPIRoute {
  static schema = GetUserSchema;

  async handle(req: RequestWithDB) {
    const user = await Users.getById(Number(req.params!["userID"]));

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
      return errorResponse(500, "No users in table??");
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

export class GetUserResults extends OpenAPIRoute {
  static schema = GetUserResultsSchema;

  async handle(req: RequestWithDB) {
    const userIdOrName = req.params!["user"];
    const user = await Users.getByIdOrName(userIdOrName);
    if (!user) {
      return errorResponse(400, "User does not exist");
    }

    const seasonId = Number(req.query["season"] || 0);
    const season = await Seasons.getFromId(seasonId);
    const results = await Results.getManyByUserIdExpanded(user.id, seasonId);
    const currentRank = await Leaderboards.getUserRankForSeason(
      season.id,
      user.id,
    );

    return json({
      user_id: user.id,
      user_name: user.name,
      seasonId: season.id,
      seasonName: season.name,
      // zero based
      rank: currentRank,
      results: results.map((result) => {
        try {
          return ResultComponent.parse(result);
        } catch (e) {
          console.log(e);
        }
      }),
    });
  }
}
