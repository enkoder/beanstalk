"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AuthLoginSchema = exports.AuthRegisterSchema = exports.MeSchema = exports.GetUsersSchema = exports.GetUserSchema = exports.User = void 0;
const itty_router_openapi_1 = require("@cloudflare/itty-router-openapi");
const zod_1 = require("zod");
exports.User = zod_1.z.object({
    id: zod_1.z.number({ description: "User ID" }),
    name: zod_1.z.string({ description: "User name" }),
    email: zod_1.z.string({ description: "User email" }),
});
exports.GetUserSchema = {
    tags: ["User"],
    summary: "Gets a single user",
    parameters: {
        userID: (0, itty_router_openapi_1.Path)(itty_router_openapi_1.Int, {
            description: "User ID (integer)",
        }),
    },
    responses: {
        "200": {
            description: "User Object",
            schema: {
                user: exports.User,
            },
        },
    },
};
exports.GetUsersSchema = {
    tags: ["User"],
    summary: "Gets a list of all users",
    responses: {
        "200": {
            description: "List of all users",
            schema: {
                user: [exports.User],
            },
        },
    },
};
exports.MeSchema = {
    tags: ["User"],
    summary: "Gets your own profile",
    responses: {
        "200": {
            description: "Your own user profile",
            schema: {
                user: [exports.User],
            },
        },
    },
};
exports.AuthRegisterSchema = {
    tags: ["Auth"],
    summary: "Register a new a new user account",
    requestBody: {
        //TODO: use Regex here
        password: new itty_router_openapi_1.Str({ required: true }),
        email: new itty_router_openapi_1.Str({ required: true }),
        name: new itty_router_openapi_1.Str({ required: true }),
    },
    responses: {
        "200": {
            description: "User Object",
            schema: { user: exports.User },
        },
    },
};
exports.AuthLoginSchema = {
    tags: ["Auth"],
    summary: "Log in via your email and password",
    requestBody: {
        //TODO: use Regex here
        password: new itty_router_openapi_1.Str({ required: true }),
        email: new itty_router_openapi_1.Str({ required: true }),
    },
    responses: {
        "200": {
            description: "User Object",
            schema: { token: new itty_router_openapi_1.Str({ description: "JWT token" }) },
        },
    },
};
