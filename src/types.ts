import { DrizzleD1Database } from "drizzle-orm/d1";
import { IRequest } from "itty-router";

// declare what's available in our env
type Env = {
  DB: D1Database;
};

//type CF = [env: Env, context: ExecutionContext]

// define a custom RequestType to inject db into the request
type RequestWithDB = {
  db: DrizzleD1Database;
} & IRequest;

export { Env, RequestWithDB };
