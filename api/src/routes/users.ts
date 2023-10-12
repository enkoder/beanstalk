import { json } from "itty-router";
import { RequestWithDB } from "../types";
import {
  GetUserResponse,
  GetUserSchema,
  GetUsersSchema,
  MeSchema,
} from "../openapi";
import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import { errorResponse } from "../errors";
import { Users } from "../models/user";

class GetUser extends OpenAPIRoute {
  static schema = GetUserSchema;

  async handle(req: RequestWithDB) {
    const user = await Users.getFromId(Number(req.params!["userID"]));

    if (!user) {
      return errorResponse(400, "User does not exist");
    }
    return json(GetUserResponse.parse(user));
  }
}

class GetUsers extends OpenAPIRoute {
  static schema = GetUsersSchema;

  async handle(_: RequestWithDB) {
    // TODO: pagination
    const users = await Users.get();
    if (!users) {
      return errorResponse(500, "No users in table??");
    }

    return json(users.map((user) => GetUserResponse.parse(user)));
  }
}

class Me extends OpenAPIRoute {
  static schema = MeSchema;

  async handle(req: RequestWithDB) {
    const user = await Users.getFromId(Number(req.user_id));
    return json(GetUserResponse.parse(user));
  }
}

export { GetUsers, GetUser, Me };
