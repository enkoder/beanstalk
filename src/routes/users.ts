import {users} from "../schema";
import {json} from "itty-router";
import {eq} from "drizzle-orm";
import {RequestWithDB} from "../types"

async function getUsers(req: RequestWithDB) {
    const query = req.db.select().from(users);
    console.log(query.toSQL());
    const result = await query.all();
    return json(result);
}

async function getUser(req: RequestWithDB) {
    const result = await req.db
        .select().from(users)
        .where(eq(users.id, Number(req.params!['id'])))
        .get();
    return json(result);
}

type createUserBody = {
    name: string
    email: string
}

async function createUser(req: RequestWithDB) {
    const body: createUserBody = await req.json!();
    const res = await req.db.insert(users)
        .values({ email: body.email, name: body.email })
        .returning()
        .get();
    return json({ res });
}

export { getUsers, getUser, createUser };