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
exports.AuthLogin = exports.AuthRegister = void 0;
const itty_router_1 = require("itty-router");
const itty_router_openapi_1 = require("@cloudflare/itty-router-openapi");
const schema_1 = require("../schema");
const drizzle_orm_1 = require("drizzle-orm");
const openapi_1 = require("../openapi");
const cloudflare_worker_jwt_1 = require("@tsndr/cloudflare-worker-jwt");
// Minimum 8 characters, letters, numbers, and special chars
// const PASSWORD_REGEX = RegExp("^[A-Za-zd!@#$&*]{8,}$");
class AuthRegister extends itty_router_openapi_1.OpenAPIRoute {
    handle(req, env, context, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = data.body;
            const result = yield req.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.email, String(body.email)))
                .get();
            if (result) {
                return Response.json({
                    success: false,
                    errors: "Email is taken",
                }, {
                    status: 400,
                });
            }
            const res = yield req.db
                .insert(schema_1.users)
                .values({
                email: body.email,
                name: body.name,
                password: body.password.toString(),
            })
                .returning()
                .get();
            return (0, itty_router_1.json)({ res });
        });
    }
}
exports.AuthRegister = AuthRegister;
AuthRegister.schema = openapi_1.AuthRegisterSchema;
class AuthLogin extends itty_router_openapi_1.OpenAPIRoute {
    handle(req, env, context, data) {
        return __awaiter(this, void 0, void 0, function* () {
            const body = data.body;
            const result = yield req.db
                .select()
                .from(schema_1.users)
                .where((0, drizzle_orm_1.eq)(schema_1.users.email, String(body.email)))
                .where((0, drizzle_orm_1.eq)(schema_1.users.password, String(body.password)))
                .get();
            if (!result) {
                return Response.json({
                    success: false,
                    errors: "Email and password is incorrect",
                }, {
                    status: 400,
                });
            }
            const payload = {
                iss: "anrpc-api",
                sub: String(result.id),
                iat: Date.now(),
                //exp: Math.floor(Date.now() / 1000) + (60 * 60)
            };
            const token = yield (0, cloudflare_worker_jwt_1.sign)(payload, "secret");
            return (0, itty_router_1.json)(token);
        });
    }
}
exports.AuthLogin = AuthLogin;
AuthLogin.schema = openapi_1.AuthLoginSchema;
