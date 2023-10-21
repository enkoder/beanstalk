import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import type { D1Database } from "@cloudflare/workers-types";
import { error } from "itty-router";
import { UsersTable } from "./user";
import { SeasonsTable } from "./season";
import { TournamentsTable } from "./tournament";
import { LeaderboardTable } from "./leaderboard";
import { ResultsTable } from "./results";

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

export interface Database {
  users: UsersTable;
  seasons: SeasonsTable;
  tournaments: TournamentsTable;
  leaderboard: LeaderboardTable;
  results: ResultsTable;
}
