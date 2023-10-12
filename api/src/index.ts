import { GetUser, GetUsers, Me } from "./routes/users";
import { AuthLogin, AuthRegister } from "./routes/login";
import { Env, RequestWithDB } from "./types";
import { OpenAPIRouter } from "@cloudflare/itty-router-openapi";
import { authenticatedUser } from "./auth";
import { errorResponse } from "./errors";
import {
  GetLeaderboard,
  GetSeasons,
  GetTournaments,
} from "./routes/leaderboard";
import { handleScheduled } from "./scheduled";
import { getDB, initDB } from "./models";

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

router
  // un-authed endpoints
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

  // fallthrough
  .all("*", () => errorResponse(404, "url route valid"));

export default {
  scheduled: handleScheduled,
  fetch: router.handle,
};
