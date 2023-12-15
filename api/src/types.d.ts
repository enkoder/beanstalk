import { IRequest } from "itty-router";
import { Kysely } from "kysely";
import { ABREntryType, ABRTournamentType } from "./lib/abr.js";
import { Database, Tournament } from "./schema.d.js";

export type IngestResultQueueMessage = {
  tournament: Tournament;
  entry: ABREntryType;
};

// declare what's available in our env
export type Env = {
  DB: D1Database;
  BACKUP_BUCKET: R2Bucket;
  INGEST_TOURNAMENT_Q: Queue<ABRTournamentType>;
  INGEST_RESULT_Q: Queue<IngestResultQueueMessage>;
  // TODO: types for cards
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  INGEST_CARD_Q: Queue<any>;
  LEADERBOARD_KV: KVNamespace;
  CARDS_KV: KVNamespace;
  // Auth secrets
  JWT_SIGNER_SECRET_KEY: string;
  PASSWORD_SECRET_KEY: string;
  // NRDB OAuth secrets
  NRDB_OAUTH_CLIENT_ID: string;
  NRDB_OAUTH_CLIENT_SECRET: string;
  REDIRECT_BASE_URL: string;
};

//type CF = [env: Env, context: ExecutionContext]

// define a custom RequestType to inject db into the request
export type RequestWithDB = {
  db: Kysely<Database>;
  user_id: number | null;
  is_admin: boolean | null;
} & IRequest;
