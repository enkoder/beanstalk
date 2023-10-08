import {error} from 'itty-router';
import {drizzle} from "drizzle-orm/d1";
import {GetUser, GetUsers, CreateUser} from "./routes/users";
import {RequestWithDB, Env, CF} from "./types";
import {OpenAPIRouter} from '@cloudflare/itty-router-openapi'

function withDB(request: RequestWithDB, env: Env): void {
    request.db = drizzle(env.DB);
}

const router = OpenAPIRouter()

router.all('*', withDB)
    .get('/users', GetUsers)
    .get('/users/:userID', GetUser)
    .post('/users', CreateUser)
    .all('*', () => error(404));

export default {
    fetch: router.handle
}