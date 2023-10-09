"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const itty_router_1 = require("itty-router");
const d1_1 = require("drizzle-orm/d1");
const users_1 = require("./routes/users");
const login_1 = require("./routes/login");
const itty_router_openapi_1 = require("@cloudflare/itty-router-openapi");
const auth_1 = require("./auth");
function withDB(request, env) {
    request.db = (0, d1_1.drizzle)(env.DB);
}
const router = (0, itty_router_openapi_1.OpenAPIRouter)();
router
    // un-authed endpoints
    .all("/api/*", withDB)
    .post("/api/auth/register", login_1.AuthRegister)
    .post("/api/auth/login", login_1.AuthLogin)
    .all("/api/*", auth_1.authenticatedUser)
    .get("/api/users", users_1.GetUsers)
    .get("/api/users/@me", users_1.Me)
    .get("/api/users/:userID", users_1.GetUser)
    .all("*", () => (0, itty_router_1.error)(404));
exports.default = {
    fetch: router.handle,
};
