import { IRequest } from "itty-router";
import { Kysely } from "kysely";
import { Database } from "./models";

// declare what's available in our env
export type Env = {
  DB: D1Database;
  JWT_SIGNER_SECRET_KEY: string;
  PASSWORD_SECRET_KEY: string;
};

//type CF = [env: Env, context: ExecutionContext]

// define a custom RequestType to inject db into the request
export type RequestWithDB = {
  db: Kysely<Database>;
  user_id: number | null;
} & IRequest;
