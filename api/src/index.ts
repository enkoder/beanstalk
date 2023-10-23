import { GetUser, GetUserResults, GetUsers, Me } from "./routes/users";
import { AuthLogin, AuthRegister } from "./routes/login";
import {
  IngestTournaments,
  Rerank,
  UpdateCards,
  UpdateUsers,
} from "./routes/admin";
import { Env, RequestWithDB } from "./types";
import { OpenAPIRouter } from "@cloudflare/itty-router-openapi";
import { adminOnly, authenticatedUser } from "./lib/auth";
import { errorResponse } from "./lib/errors";
import { GetLeaderboard } from "./routes/leaderboard";
import { GetSeasonTournaments, GetSeasons } from "./routes/seasons";
import { handleQueue, handleScheduled } from "./background";
import { getDB, initDB } from "./models";
import { createCors, error, json } from "itty-router";
import {
  GetTournament,
  GetTournamentResults,
  GetTournaments,
} from "./routes/tournament";
import { UpdateCardsSchema } from "./openapi";

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
  .get("/api/users/@me", authenticatedUser, Me)
  .get("/api/users", GetUsers)
  .get("/api/users/:userID", GetUser)
  .get("/api/users/:user/results", GetUserResults)

  // Leaderboard
  .get("/api/leaderboard", GetLeaderboard)

  // Seasons
  .get("/api/seasons", GetSeasons)
  .get("/api/seasons/:seasonId/tournaments", GetSeasonTournaments)

  // Tournament
  .get("/api/tournaments", GetTournaments)
  .get("/api/tournaments/:tournamentId", GetTournament)
  .get("/api/tournaments/:tournamentId/results", GetTournamentResults)

  // Admin only endpoints
  .all("/api/admin/*", authenticatedUser, adminOnly)
  .get("/api/admin/updateNRDBNames", UpdateUsers)
  .get("/api/admin/rerank", Rerank)
  .post("/api/admin/ingestTournaments", IngestTournaments)
  .post("/api/admin/updateCards", UpdateCards)

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
