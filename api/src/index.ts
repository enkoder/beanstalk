import { OpenAPIRouter } from "@cloudflare/itty-router-openapi";
import type { ExecutionContext } from "@cloudflare/workers-types/experimental";
import { createCors, error } from "itty-router";
import { RewriteFrames, Toucan } from "toucan-js";
import { handleQueue, handleScheduled } from "./background.js";
import { adminOnly, authenticatedUser } from "./lib/auth.js";
import { errorResponse } from "./lib/errors.js";
import { getDB, initDB } from "./models/db.js";
import {
  ExportDB,
  IngestTournaments,
  Rerank,
  UpdateCards,
  UpdateTournamentSeasons,
  UpdateUsers,
} from "./routes/admin.js";
import { GetLoginUrl, GetTokenFromCode, RefreshToken } from "./routes/auth.js";
import {
  GetFactions,
  GetFormats,
  GetLeaderboard,
  GetPointDistribution,
  GetRankingConfig,
} from "./routes/leaderboard.js";
import { GetSeasonTournaments, GetSeasons } from "./routes/seasons.js";
import {
  GetTournament,
  GetTournamentResults,
  GetTournaments,
} from "./routes/tournament.js";
import { GetUser, GetUserResults, GetUsers, Me } from "./routes/users.js";
import { Env, RequestWithDB } from "./types.js";

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
  .all("/*", withDB)

  .get("/auth/login_url", GetLoginUrl)
  .get("/auth/token", GetTokenFromCode)
  .get("/auth/refresh_token", RefreshToken)

  .get("/users/@me", authenticatedUser, Me)
  .get("/users", GetUsers)
  .get("/users/:userID", GetUser)
  .get("/users/:user/results", GetUserResults)

  .get("/leaderboard", GetLeaderboard)
  .get("/point-distribution", GetPointDistribution)
  .get("/factions", GetFactions)
  .get("/formats", GetFormats)

  .get("/seasons", GetSeasons)
  .get("/seasons/:seasonId/tournaments", GetSeasonTournaments)

  .get("/tournaments", GetTournaments)
  .get("/tournaments/config", GetRankingConfig)
  .get("/tournaments/:tournamentId", GetTournament)
  .get("/tournaments/:tournamentId/results", GetTournamentResults)

  // Admin endpoints
  .all("/admin/*", authenticatedUser, adminOnly)
  .get("/admin/updateNRDBNames", UpdateUsers)
  .get("/admin/rerank", Rerank)
  .get("/admin/exportDB", ExportDB)
  .post("/admin/ingestTournaments", IngestTournaments)
  .post("/admin/updateCards", UpdateCards)
  .post("/admin/updateTournamentsSeason", UpdateTournamentSeasons)

  // fallthrough
  .all("*", () => errorResponse(404, "url route invalid"));

async function fetch(request: Request, env: Env, ctx: ExecutionContext) {
  const sentry = new Toucan({
    dsn: env.SENTRY_DSN,
    context: ctx,
    request: request,
    integrations: [new RewriteFrames({ root: "/" })],
  });

  try {
    const resp = await router.handle(request, env, ctx);
    return corsify(resp);
  } catch (e) {
    sentry.captureException(e);

    console.log(e);
    return error(e);
  }
}

export default {
  queue: handleQueue,
  scheduled: handleScheduled,
  fetch: fetch,
};
