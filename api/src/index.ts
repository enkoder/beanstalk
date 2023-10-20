import { GetUser, GetUsers, Me } from "./routes/users";
import { AuthLogin, AuthRegister } from "./routes/login";
import { Rerank, UpdateUsers } from "./routes/admin";
import { Env, RequestWithDB } from "./types";
import { OpenAPIRouter } from "@cloudflare/itty-router-openapi";
import { adminOnly, authenticatedUser } from "./lib/auth";
import { errorResponse } from "./lib/errors";
import {
  GetLeaderboard,
  GetSeasons,
  GetTournaments,
} from "./routes/leaderboard";
import { handleScheduled } from "./scheduled";
import { getDB, initDB } from "./models";
import { createCors, error, json } from "itty-router";
import { GetResults } from "./routes/results";

function withDB(request: RequestWithDB, env: Env): void {
  initDB(env.DB);
  request.db = getDB();
}

const router = OpenAPIRouter();

router.registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

const { preflight, corsify } = createCors({
  origins: ["*"],
  methods: ["GET", "POST", "PATCH", "DELETE"],
});

router
  // un-authed endpoints
  .all("*", preflight)
  .all("/api/*", withDB)

  .post("/api/auth/register", AuthRegister)
  .post("/api/auth/login", AuthLogin)

  // Users
  .all("/api/users/*", authenticatedUser)
  .get("/api/users", GetUsers)
  .get("/api/users/@me", Me)
  .get("/api/users/:userID", GetUser)

  // Leaderboard
  .get("/api/seasons", GetSeasons)
  .get("/api/tournaments", GetTournaments)
  .get("/api/leaderboard", GetLeaderboard)

  // Results endpoints
  .get("/api/results/:user", GetResults)

  // Admin only endpoints
  .get("/api/admin/updateNRDBNames", adminOnly, UpdateUsers)
  .get("/api/admin/rerank", adminOnly, Rerank)

  // fallthrough
  .all("*", () => errorResponse(404, "url route invalid"));

export default {
  scheduled: handleScheduled,
  fetch: (...args) =>
    router
      .handle(...args)
      .then(json)

      // embed corsify downstream to attach CORS headers
      .then(corsify)
      .catch(error),
};
