import { getDB, initDB } from "../models/db.js";
import { Miniflare } from "miniflare";
import { error } from "itty-router";
import { CompiledQuery } from "kysely";
import * as fs from "fs";

let _mf: Miniflare | null = null;

export function getMF() {
  if (_mf) {
    return _mf;
  } else {
    throw error(500, "Miniflare has not been initialized");
  }
}

export async function initMf() {
  console.log("Initializing Miniflare");
  _mf = new Miniflare({
    d1Databases: ["DB"],
    scriptPath: "./dist/index.js",
    modules: true,
    modulesRules: [{ type: "ESModule", include: ["**/*.js"] }],
    verbose: true,
  });

  const db = await _mf.getD1Database("DB");
  initDB(db);

  await applyMigrations();

  return _mf;
}

export async function wipeDB() {
  const db = getDB();
  await db.deleteFrom("results").execute();
  await db.deleteFrom("tournaments").execute();
  await db.deleteFrom("users").execute();
  await db.deleteFrom("seasons").execute();
}

async function applyMigrations() {
  console.log("Applying Migrations");
  //const parser = new Parser();
  const migrations: string[] = [];
  for (const file of fs.readdirSync("./migrations")) {
    if (file.endsWith(".sql")) {
      migrations.push(file);
    }
  }

  const db = getDB();
  migrations.sort();

  for (const migration of migrations) {
    const sqlFile = fs.readFileSync(`./migrations/${migration}`, "utf-8");
    for (const sql of sqlFile.split(";")) {
      const query = CompiledQuery.raw(sql.trim());
      if (query.sql == "") {
        continue;
      }

      await db.executeQuery(query);
    }
  }
}
