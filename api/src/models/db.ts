import { Database } from "../schema.js";
import { error } from "itty-router";
import { D1Dialect } from "kysely-d1";
import { Kysely } from "kysely";
import type { D1Database } from "@cloudflare/workers-types";

let _db: Kysely<Database> | null = null;

export function initDB(db: D1Database) {
  _db = new Kysely<Database>({
    dialect: new D1Dialect({ database: db }),
    //log(event) {
    //  if (event.level === "query") {
    //    console.log(event.query.sql);
    //    console.log(event.query.parameters);
    //  }
    //},
  });
}

export function getDB() {
  if (_db) {
    return _db;
  } else {
    throw error(500, "DB has not been initialized");
  }
}
