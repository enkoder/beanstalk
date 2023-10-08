import {error, Router} from 'itty-router';
import {drizzle} from "drizzle-orm/d1";
import {getUsers, getUser, createUser} from "./routes/users";
import {RequestWithDB, Env, CF} from "./types";

function withDB(request: RequestWithDB, env: Env): void  {
	request.db = drizzle(env.DB);
}

const router = Router<RequestWithDB, CF>()

router.all('*', withDB)
	  .get('/users', getUsers)
	  .get('/users/:id', getUser)
      .post('/users', createUser)
	  .all('*', () => error(404));

export default {
	fetch: router.handle
}