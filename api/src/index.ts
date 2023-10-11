import { GetUser, GetUsers, Me } from "./routes/users";
import { AuthRegister, AuthLogin } from "./routes/login";
import { RequestWithDB, Env } from "./types";
import { OpenAPIRouter } from "@cloudflare/itty-router-openapi";
import { authenticatedUser } from "./auth";
import { errorResponse } from "./errors";
import {
  GetLeaderboard,
  GetSeasons,
  GetTournaments,
} from "./routes/leaderboard";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { Database } from "./schema";

function withDB(request: RequestWithDB, env: Env): void {
  request.db = new Kysely<Database>({
    dialect: new D1Dialect({ database: env.DB }),
  });
}

const router = OpenAPIRouter();

router.registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

router
  // un-authed endpoints
  .all("/api/*", withDB)
  .post("/api/auth/register", AuthRegister)
  .post("/api/auth/login", AuthLogin)
  .all("/api/users/*", authenticatedUser)
  .get("/api/users", GetUsers)
  .get("/api/users/@me", Me)
  .get("/api/users/:userID", GetUser)
  .get("/api/seasons", GetSeasons)
  .get("/api/tournaments", GetTournaments)
  .get("/api/leaderboard", GetLeaderboard)
  .all("*", () => errorResponse(404, "url route valid"));

export default {
  fetch: router.handle,
};
