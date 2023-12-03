import { GetUser, GetUserResults, GetUsers, Me } from "./routes/users";
import {
  IngestTournaments,
  Rerank,
  UpdateCards,
  UpdateTournamentSeasons,
  UpdateUsers,
} from "./routes/admin";
import { Env, RequestWithDB } from "./types";
import { adminOnly, authenticatedUser } from "./lib/auth";
import { errorResponse } from "./lib/errors";
import {
  GetFactions,
  GetFormats,
  GetLeaderboard,
  GetPointDistribution,
  GetTiers,
} from "./routes/leaderboard";
import { GetSeasons, GetSeasonTournaments } from "./routes/seasons";
import { handleQueue, handleScheduled } from "./background";
import { getDB, initDB } from "./models";
import {
  GetTournament,
  GetTournamentResults,
  GetTournaments,
} from "./routes/tournament";
import { GetLoginUrl, GetTokenFromCode, RefreshToken } from "./routes/auth";
import { createCors, error, json } from "itty-router";
import { OpenAPIRouter } from "@cloudflare/itty-router-openapi";
import type {
  ExecutionContext,
  Request as WorkerRequest,
} from "@cloudflare/workers-types/experimental";

function withDB(request: RequestWithDB, env: Env): void {
  initDB(env.DB);
  request.db = getDB();
}

const router = OpenAPIRouter({
  base: "/api",
  docs_url: "/docs",
  redoc_url: "/redoc",
  openapi_url: "/spec.json",
  openapiVersion: "3.1",
});

router.registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

const { preflight, corsify } = createCors({
  origins: ["*"],
  methods: ["GET", "POST", "PATCH", "DELETE"],
  headers: { "Access-Control-Allow-Credentials": true },
});

router
  // un-authed endpoints
  .all("*", preflight)
  .all("/api/*", withDB)

  .get("/api/auth/login_url", GetLoginUrl)
  .get("/api/auth/token", GetTokenFromCode)
  .get("/api/auth/refresh_token", RefreshToken)

  // Users
  .get("/api/users/@me", authenticatedUser, Me)
  .get("/api/users", GetUsers)
  .get("/api/users/:userID", GetUser)
  .get("/api/users/:user/results", GetUserResults)

  // Leaderboard
  .get("/api/leaderboard", GetLeaderboard)
  .get("/api/point-distribution", GetPointDistribution)
  .get("/api/factions", GetFactions)
  .get("/api/formats", GetFormats)

  // Seasons
  .get("/api/seasons", GetSeasons)
  .get("/api/seasons/:seasonId/tournaments", GetSeasonTournaments)

  // Tournament
  .get("/api/tournaments", GetTournaments)
  .get("/api/tournaments/tiers", GetTiers)
  .get("/api/tournaments/:tournamentId", GetTournament)
  .get("/api/tournaments/:tournamentId/results", GetTournamentResults)

  // Admin only endpoints
  .all("/api/admin/*", authenticatedUser, adminOnly)
  .get("/api/admin/updateNRDBNames", UpdateUsers)
  .get("/api/admin/rerank", Rerank)
  .post("/api/admin/ingestTournaments", IngestTournaments)
  .post("/api/admin/updateCards", UpdateCards)
  .post("/api/admin/updateTournamentsSeason", UpdateTournamentSeasons)

  // fallthrough
  .all("*", () => errorResponse(404, "url route invalid"));

export default {
  queue: handleQueue,
  scheduled: handleScheduled,
  fetch: (request: WorkerRequest, env: Env, ctx: ExecutionContext) =>
    router.handle(request, env, ctx).then(json).then(corsify).catch(error),
};
