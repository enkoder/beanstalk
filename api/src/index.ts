import { GetUser, GetUsers, Me } from "./routes/users";
import { AuthLogin, AuthRegister } from "./routes/login";
import { IngestTournaments, Rerank, UpdateUsers } from "./routes/admin";
import { Env, RequestWithDB } from "./types";
import { OpenAPIRouter } from "@cloudflare/itty-router-openapi";
import { adminOnly, authenticatedUser } from "./lib/auth";
import { errorResponse } from "./lib/errors";
import {
  GetLeaderboard,
  GetSeasons,
  GetTournaments,
} from "./routes/leaderboard";
import { handleQueue, handleScheduled } from "./background";
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
  .get("/api/users/@me", Me)
  .get("/api/users", adminOnly, GetUsers)
  .get("/api/users/:userID", adminOnly, GetUser)

  // Leaderboard
  .get("/api/seasons", GetSeasons)
  .get("/api/tournaments", GetTournaments)
  .get("/api/leaderboard", GetLeaderboard)

  // Results endpoints
  .get("/api/results/:user", GetResults)

  // Admin only endpoints
  .all("/api/admin/*", authenticatedUser, adminOnly)
  .get("/api/admin/updateNRDBNames", UpdateUsers)
  .get("/api/admin/rerank", Rerank)
  .post("/api/admin/ingestTournaments", IngestTournaments)

  // fallthrough
  .all("*", () => errorResponse(404, "url route invalid"));

export default {
  queue: handleQueue,
  scheduled: handleScheduled,
  fetch: (...args) =>
    router
      .handle(...args)
      .then(json)

      // embed corsify downstream to attach CORS headers
      .then(corsify)
      .catch(error),
};
