import type { D1Database } from "@cloudflare/workers-types";
import { error } from "itty-router";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { Database } from "../schema.js";

let _db: Kysely<Database> | null = null;

export function initDB(db: D1Database) {
  _db = new Kysely<Database>({
    // @ts-ignore
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
  }
  throw error(500, "DB has not been initialized");
}