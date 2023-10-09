"use strict";
var __awaiter = (this && this.__awaiter) || function (thisArg, _arguments, P, generator) {
    function adopt(value) { return value instanceof P ? value : new P(function (resolve) { resolve(value); }); }
    return new (P || (P = Promise))(function (resolve, reject) {
        function fulfilled(value) { try { step(generator.next(value)); } catch (e) { reject(e); } }
        function rejected(value) { try { step(generator["throw"](value)); } catch (e) { reject(e); } }
        function step(result) { result.done ? resolve(result.value) : adopt(result.value).then(fulfilled, rejected); }
        step((generator = generator.apply(thisArg, _arguments || [])).next());
    });
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.Me = exports.GetUser = exports.GetUsers = void 0;
const schema_1 = require("../schema");
const itty_router_1 = require("itty-router");
const drizzle_orm_1 = require("drizzle-orm");
const openapi_1 = require("../openapi");
const itty_router_openapi_1 = require("@cloudflare/itty-router-openapi");
const errors_1 = require("../errors");
class GetUser extends itty_router_openapi_1.OpenAPIRoute {
    handle(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield req.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, Number(req.params["userID"])));
            if (!result.length) {
                return (0, errors_1.errorResponse)(400, "User does not exist");
            }
            return (0, itty_router_1.json)(openapi_1.User.parse(result));
        });
    }
}
exports.GetUser = GetUser;
GetUser.schema = openapi_1.GetUserSchema;
class GetUsers extends itty_router_openapi_1.OpenAPIRoute {
    handle(req, env, context, data) {
        return __awaiter(this, void 0, void 0, function* () {
            // TODO: pagination
            const result = yield req.db.select().from(schema_1.users).all();
            if (!result) {
                return (0, errors_1.errorResponse)(500, "No users in table??");
            }
            // @ts-ignore
            return (0, itty_router_1.json)(result.map(openapi_1.User.parse, result));
        });
    }
}
exports.GetUsers = GetUsers;
GetUsers.schema = openapi_1.GetUsersSchema;
class Me extends itty_router_openapi_1.OpenAPIRoute {
    handle(req) {
        return __awaiter(this, void 0, void 0, function* () {
            const result = yield req.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.id, Number(req.user_id)))
                .get();
            return (0, itty_router_1.json)(openapi_1.User.parse(result));
        });
    }
}
exports.Me = Me;
Me.schema = openapi_1.MeSchema;
