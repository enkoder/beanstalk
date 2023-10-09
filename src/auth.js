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
exports.authenticatedUser = exports.getBearer = void 0;
const cloudflare_worker_jwt_1 = require("@tsndr/cloudflare-worker-jwt");
function getBearer(request) {
    const authHeader = request.headers.get("Authorization");
    if (!authHeader || authHeader.substring(0, 6) !== "Bearer") {
        return null;
    }
    return authHeader.substring(6).trim();
}
exports.getBearer = getBearer;
function validateToken(token) {
    return __awaiter(this, void 0, void 0, function* () {
        const isValid = yield (0, cloudflare_worker_jwt_1.verify)(token, "secret");
        // Check for validity
        if (!isValid)
            return;
        return (0, cloudflare_worker_jwt_1.decode)(token);
    });
}
function authenticatedUser(request, env) {
    return __awaiter(this, void 0, void 0, function* () {
        const token = getBearer(request);
        let session;
        if (token) {
            // Implement your own token validation here
            session = yield validateToken(token);
        }
        if (!token || !session) {
            return Response.json({
                success: false,
                errors: "Authentication error",
            }, {
                status: 401,
            });
        }
        // user_id not null implies user is logged in
        request.user_id = Number(session.payload.sub);
    });
}
exports.authenticatedUser = authenticatedUser;
