import { users } from "../schema";
import { json } from "itty-router";
import { eq } from "drizzle-orm";
import { Env, RequestWithDB } from "../types";
import { GetUserSchema, GetUsersSchema, MeSchema, User } from "../openapi";
import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import { errorResponse } from "../errors";

class GetUser extends OpenAPIRoute {
  static schema = GetUserSchema;

  async handle(req: RequestWithDB) {
    const result = await req.db
      .select()
      .from(users)
      .where(eq(users.id, Number(req.params!["userID"])))
      .get();

    if (!result) {
      return errorResponse(400, "User does not exist");
    }
    return json(User.parse(result));
  }
}

class GetUsers extends OpenAPIRoute {
  static schema = GetUsersSchema;

  async handle(
    req: RequestWithDB,
    env: Env,
    context: ExecutionContext,
    data: Record<string, any>,
  ) {
    // TODO: pagination
    const result = await req.db.select().from(users).all();
    if (!result) {
      return errorResponse(500, "No users in table??");
    }
    return json(result.forEach((data) => User.parse(data)));
  }
}

class Me extends OpenAPIRoute {
  static schema = MeSchema;

  async handle(req: RequestWithDB) {
    const result = await req.db
      .select()
      .from(users)
      .where(eq(users.id, Number(req.user_id)))
      .get();

    return json(User.parse(result));
  }
}

export { GetUsers, GetUser, Me };
