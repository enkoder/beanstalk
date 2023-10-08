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
exports.createUser = exports.getUser = exports.getUsers = void 0;
const schema_1 = require("../schema");
const itty_router_1 = require("itty-router");
const index_1 = require("drizzle-orm/index");
function getUsers(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const query = req.db.select().from(schema_1.users);
        console.log(query.toSQL());
        const result = yield query.all();
        return (0, itty_router_1.json)(result);
    });
}
exports.getUsers = getUsers;
function getUser(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const result = yield req.db
            .select().from(schema_1.users)
            .where((0, index_1.eq)(schema_1.users.id, Number(req.params['id'])))
            .get();
        return (0, itty_router_1.json)(result);
    });
}
exports.getUser = getUser;
function createUser(req) {
    return __awaiter(this, void 0, void 0, function* () {
        const body = yield req.json();
        const res = yield req.db.insert(schema_1.users)
            .values({ email: body.email, name: body.email })
            .returning()
            .get();
        return (0, itty_router_1.json)({ res });
    });
}
exports.createUser = createUser;
