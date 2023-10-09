import { error } from "itty-router";
import { drizzle } from "drizzle-orm/d1";
import { GetUser, GetUsers, Me } from "./routes/users";
import { AuthRegister, AuthLogin } from "./routes/login";
import { RequestWithDB, Env } from "./types";
import { OpenAPIRouter } from "@cloudflare/itty-router-openapi";
import { authenticatedUser } from "./auth";
import { errorResponse } from "./errors";

function withDB(request: RequestWithDB, env: Env): void {
  request.db = drizzle(env.DB);
}

const router = OpenAPIRouter();

router
  // un-authed endpoints
  .all("/api/*", withDB)
  .post("/api/auth/register", AuthRegister)
  .post("/api/auth/login", AuthLogin)
  .all("/api/users/*", authenticatedUser)
  .get("/api/users", GetUsers)
  .get("/api/users/@me", Me)
  .get("/api/users/:userID", GetUser)
  .all("*", () => errorResponse(404, "url route valid"));

export default {
  fetch: router.handle,
};
