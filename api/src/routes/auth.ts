import { Env, RequestWithDB } from "../types";
import {
  GetOAuthLoginURLSchema,
  OAuthGetTokenFromCodeSchema,
  RefreshTokenSchema,
  TokenResponseComponent,
} from "../openapi";
import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import { error, json } from "itty-router";

const NRDB_BASE_URL = "https://netrunnerdb.com";
const NRDB_AUTH_URL = `${NRDB_BASE_URL}/oauth/v2/auth`;
const NRDB_TOKEN_URL = `${NRDB_BASE_URL}/oauth/v2/token`;
const REDIRECT_URL = "https://netrunner-beanstalk.net/api/oauth/callback";

export class GetLoginUrl extends OpenAPIRoute {
  static schema = GetOAuthLoginURLSchema;

  async handle(req: RequestWithDB, env: Env) {
    const nrdbUrl = new URL(NRDB_AUTH_URL);
    nrdbUrl.searchParams.append("client_id", env.NRDB_OAUTH_CLIENT_ID);
    nrdbUrl.searchParams.append("redirect_uri", REDIRECT_URL);
    nrdbUrl.searchParams.append("response_type", "code");
    nrdbUrl.searchParams.append("scope", "");
    nrdbUrl.searchParams.append("type", "web_server");
    return json({ auth_url: nrdbUrl.toString() });
  }
}

export class GetTokenFromCode extends OpenAPIRoute {
  static schema = OAuthGetTokenFromCodeSchema;

  async handle(req: RequestWithDB, env: Env) {
    const code = String(req.query!["code"]);

    const nrdbUrl = new URL(NRDB_TOKEN_URL);
    nrdbUrl.searchParams.append("client_id", env.NRDB_OAUTH_CLIENT_ID);
    nrdbUrl.searchParams.append("client_secret", env.NRDB_OAUTH_CLIENT_SECRET);
    nrdbUrl.searchParams.append("grant_type", "authorization_code");
    nrdbUrl.searchParams.append("redirect_uri", REDIRECT_URL);
    nrdbUrl.searchParams.append("code", code);

    console.log(nrdbUrl.toString());
    const r = await fetch(nrdbUrl.toString());
    if (!r.ok) {
      return error(400, `Error during token exchange - ${await r.text()}`);
    }

    const jsonBody = await r.json();
    console.log(JSON.stringify(jsonBody));

    return json(TokenResponseComponent.parse(jsonBody));
  }
}

export class RefreshToken extends OpenAPIRoute {
  static schema = RefreshTokenSchema;

  async handle(req: RequestWithDB, env: Env) {
    const refresh_token = req.query!["refresh_token"];
    console.log(refresh_token);
    if (!refresh_token) {
      return error(400, "Invalid refresh token");
    }

    const nrdbUrl = new URL(NRDB_TOKEN_URL);
    nrdbUrl.searchParams.append("client_id", env.NRDB_OAUTH_CLIENT_ID);
    nrdbUrl.searchParams.append("client_secret", env.NRDB_OAUTH_CLIENT_SECRET);
    nrdbUrl.searchParams.append("grant_type", "refresh_token");
    nrdbUrl.searchParams.append("refresh_token", String(refresh_token));

    console.log(nrdbUrl.toString());
    const r = await fetch(nrdbUrl.toString());
    if (!r.ok) {
      return error(
        400,
        `Error during token refresh exchange - ${await r.text()}`,
      );
    }

    const jsonBody = await r.json();
    console.log(JSON.stringify(jsonBody));

    return json(TokenResponseComponent.parse(jsonBody));
  }
}
