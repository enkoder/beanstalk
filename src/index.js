"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const itty_router_1 = require("itty-router");
const d1_1 = require("drizzle-orm/d1");
const users_1 = require("./routes/users");
function withDB(request, env) {
    request.db = (0, d1_1.drizzle)(env.DB);
}
const router = (0, itty_router_1.Router)();
router.all('*', withDB)
    .get('/users', users_1.getUsers)
    .get('/users/:id', users_1.getUser)
    .post('/users', users_1.createUser)
    .all('*', () => (0, itty_router_1.error)(404));
exports.default = {
    fetch: router.handle
};
//const router = Router<Request, Methods>({ base: '/' });
//
//router.get('/users', withDB, async (req: Request, env: Env) => {
//	const query = req.db.select().from(users);
//	console.log(query.toSQL());
//	const result = await query.all();
//	return json(result);
//});
//
//
//export default {
//	fetch: router.handle,
//};
//
