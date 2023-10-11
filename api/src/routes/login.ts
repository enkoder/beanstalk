import { json } from "itty-router";
import { Env, RequestWithDB } from "../types";
import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import {
  AuthLoginBody,
  AuthLoginSchema,
  AuthRegisterSchema,
  GetUserResponse,
} from "../openapi";
import { sign, JwtPayload } from "@tsndr/cloudflare-worker-jwt";
import { signPassword, verifyPassword } from "../auth";
import { errorResponse } from "../errors";

// Minimum 8 characters, letters, numbers, and special chars
// const PASSWORD_REGEX = RegExp("^[A-Za-zd!@#$&*]{8,}$");

class AuthRegister extends OpenAPIRoute {
  static schema = AuthRegisterSchema;

  async handle(
    req: RequestWithDB,
    env: Env,
    context: ExecutionContext,
    data: any,
  ) {
    const body = data.body;
    const result = await req.db
      .selectFrom("users")
      .selectAll()
      .where("email", "=", body.email)
      .executeTakeFirst();

    if (result) {
      return errorResponse(400, "Email is taken");
    }

    const pw = await signPassword(
      env.PASSWORD_SECRET_KEY,
      body.email,
      body.password,
    );

    const res = await req.db
      .insertInto("users")
      .values({
        email: body.email,
        name: body.name,
        password: pw,
      })
      .returningAll()
      .executeTakeFirst();

    return json(GetUserResponse.parse(res));
  }
}

class AuthLogin extends OpenAPIRoute {
  static schema = AuthLoginSchema;

  async handle(
    req: RequestWithDB,
    env: Env,
    context: ExecutionContext,
    data: Record<string, any>,
  ) {
    const authLoginBody = AuthLoginBody.parse(data.body);
    console.log(authLoginBody);
    const result = await req.db
      .selectFrom("users")
      .selectAll()
      .where("email", "=", authLoginBody.email)
      .executeTakeFirst();

    if (!result) {
      return errorResponse(400, "Email not found");
    }
    if (
      !(await verifyPassword(
        env.PASSWORD_SECRET_KEY,
        authLoginBody.email,
        authLoginBody.password,
        result.password,
      ))
    ) {
      return errorResponse(400, "Invalid password");
    }

    const payload: JwtPayload = {
      iss: "anrpc-api",
      sub: String(result.id),
      iat: Date.now(),
      //exp: Math.floor(Date.now() / 1000) + (60 * 60)
    };
    const token = await sign(payload, "secret");
    return json(token);
  }
}
export { AuthRegister, AuthLogin };
