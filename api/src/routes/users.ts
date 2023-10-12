import { json } from "itty-router";
import { Env, RequestWithDB } from "../types";
import {
  GetUserSchema,
  GetUsersSchema,
  MeSchema,
  GetUserResponse,
  GetUserResponseType,
} from "../openapi";
import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import { errorResponse } from "../errors";

class GetUser extends OpenAPIRoute {
  static schema = GetUserSchema;

  async handle(req: RequestWithDB) {
    const result = await req.db
      .selectFrom("users")
      .selectAll()
      .where("id", "=", Number(req.params!["userID"]))
      .executeTakeFirst();

    if (!result) {
      return errorResponse(400, "User does not exist");
    }
    return json(GetUserResponse.parse(result));
  }
}

class GetUsers extends OpenAPIRoute {
  static schema = GetUsersSchema;

  async handle(req: RequestWithDB) {
    // TODO: pagination
    const result = await req.db.selectFrom("users").selectAll().execute();
    if (!result) {
      return errorResponse(500, "No users in table??");
    }
    const retArr: GetUserResponseType[] = [];
    result.forEach((data) => retArr.push(GetUserResponse.parse(data)));
    return json(retArr);
  }
}

class Me extends OpenAPIRoute {
  static schema = MeSchema;

  async handle(req: RequestWithDB) {
    const result = await req.db
      .selectFrom("users")
      .selectAll()
      .where("id", "=", Number(req.user_id))
      .executeTakeFirst();

    return json(GetUserResponse.parse(result));
  }
}

export { GetUsers, GetUser, Me };
