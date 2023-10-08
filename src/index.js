"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const itty_router_1 = require("itty-router");
const d1_1 = require("drizzle-orm/d1");
const users_1 = require("./routes/users");
const itty_router_openapi_1 = require("@cloudflare/itty-router-openapi");
function withDB(request, env) {
    request.db = (0, d1_1.drizzle)(env.DB);
}
const router = (0, itty_router_openapi_1.OpenAPIRouter)();
router.all('*', withDB)
    .get('/users', users_1.GetUsers)
    .get('/users/:userID', users_1.GetUser)
    .post('/users', users_1.CreateUser)
    .all('*', () => (0, itty_router_1.error)(404));
exports.default = {
    fetch: router.handle
};
