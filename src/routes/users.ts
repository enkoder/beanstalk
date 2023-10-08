import {users, UserSelect} from "../schema";
import {json} from "itty-router";
import {eq} from "drizzle-orm";
import {Env, RequestWithDB} from "../types"
import {Int, OpenAPIRoute, Path, Str} from "@cloudflare/itty-router-openapi";

const User = {
    id: new Int({required: true}),
    name: new Str({required: true}),
    email: new Str({required: true}),
}

class GetUser extends OpenAPIRoute {
    static schema = {
        tags: ['User'],
        summary: 'Gets a single user',
        parameters: {
            userID: Path(Int, {
                description: 'User ID (integer)',
            }),
        },
        responses: {
            '200': {
                description: 'User Object',
                schema: {
                    user: User
                }
            }
        }
    }

    async handle(req: RequestWithDB, env: Env, context: ExecutionContext) {
        const result = await req.db
            .select().from(users)
            .where(eq(users.id, Number(req.params!['userID'])))
            .get();
        return json(result);
    }

}

class GetUsers extends OpenAPIRoute {
    static schema = {
        tags: ['User'],
        summary: 'Gets a list of all users',
        responses: {
            '200': {
                description: 'List of all users',
                schema: {
                    user: [User]
                }
            }
        }
    }

    async handle(req: RequestWithDB, env: Env, context: ExecutionContext) {
        const query = req.db.select().from(users);
        console.log(query.toSQL());
        const result: UserSelect[] = await query.all();
        return json(result);
    }

}

type _createUserBody = {
    name: string
    email: string
}

class CreateUser extends OpenAPIRoute {
    static schema = {
        tags: ['User'],
        summary: 'Creates a user',
        responses: {
            '200': {
                description: 'List of User objects',
                schema: {
                    user: [User]
                }
            }
        }
    }

    async handle(req: RequestWithDB) {
        const body: _createUserBody = await req.json!();
        const res = await req.db.insert(users)
            .values({email: body.email, name: body.email})
            .returning()
            .get();
        return json({res});
    }
}

export {CreateUser, GetUsers, GetUser}