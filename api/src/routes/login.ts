import { json } from "itty-router";
import { Env, RequestWithDB } from "../types";
import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import {
  AuthLoginBody,
  AuthLoginSchema,
  AuthRegisterSchema,
  UserComponent,
} from "../openapi";
import { JwtPayload, sign } from "@tsndr/cloudflare-worker-jwt";
import { signPassword, verifyPassword } from "../lib/auth";
import { errorResponse } from "../lib/errors";
import { Users } from "../models/user";

// Minimum 8 characters, letters, numbers, and special chars
// const PASSWORD_REGEX = RegExp("^[A-Za-zd!@#$&*]{8,}$");

class AuthRegister extends OpenAPIRoute {
  static schema = AuthRegisterSchema;

  async handle(req: RequestWithDB, env: Env, _: ExecutionContext, data: any) {
    const body = data.body;
    let user = await Users.getByEmail(body.email);

    if (user) {
      return errorResponse(400, "Email is taken");
    }

    const pw = await signPassword(
      env.PASSWORD_SECRET_KEY,
      body.email,
      body.password,
    );

    user = await Users.insert({
      email: body.email,
      name: body.name,
      password: pw,
    });

    return json(UserComponent.parse(user));
  }
}

class AuthLogin extends OpenAPIRoute {
  static schema = AuthLoginSchema;

  async handle(
    req: RequestWithDB,
    env: Env,
    _: ExecutionContext,
    data: Record<string, any>,
  ) {
    const authLoginBody = AuthLoginBody.parse(data.body);
    const user = await Users.getByEmail(authLoginBody.email);

    if (!user) {
      return errorResponse(400, "Email not found");
    }
    if (
      !(await verifyPassword(
        env.PASSWORD_SECRET_KEY,
        authLoginBody.email,
        authLoginBody.password,
        user.password,
      ))
    ) {
      return errorResponse(400, "Invalid password");
    }

    const payload: JwtPayload = {
      iss: "beanstalk-api",
      sub: String(user.id),
      iat: Date.now(),
      //exp: Math.floor(Date.now() / 1000) + (60 * 60)
    };
    const token = await sign(payload, env.JWT_SIGNER_SECRET_KEY);
    return json(token);
  }
}
export { AuthRegister, AuthLogin };
