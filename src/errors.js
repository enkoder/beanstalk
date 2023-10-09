"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorResponse = void 0;
function errorResponse(status, msg) {
    return Response.json({
        success: false,
        errors: msg,
        status: status,
    }, {
        status: status,
    });
}
exports.errorResponse = errorResponse;
