import * as fs from "fs";
import { CompiledQuery, Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { Miniflare } from "miniflare";
import { g, initTestG } from "../g";
import { Database } from "../schema";

export async function initG(loggedInUser = 0) {
  console.log("Initializing Global State");
  const mf = new Miniflare({
    d1Databases: ["DB"],
    scriptPath: "./dist/index.js",
    modules: true,
    modulesRules: [{ type: "ESModule", include: ["**/*.ts"] }],
    verbose: true,
    compatibilityFlags: ["nodejs_compat"],
    bindings: {
      LOGGED_IN_USER_ID: loggedInUser,
      IS_TEST: true,
    },
  });

  const db = new Kysely<Database>({
    dialect: new D1Dialect({ database: await mf.getD1Database("DB") }),
  });

  initTestG({ db: db, mf: mf });
}

export async function wipeDB() {
  const db = g().db;
  await db.deleteFrom("results").execute();
  await db.deleteFrom("tournaments").execute();
  await db.deleteFrom("users").execute();
  await db.deleteFrom("seasons").execute();
}

export async function applyMigrations() {
  console.log("Applying Migrations");
  const migrations: string[] = [];
  for (const file of fs.readdirSync("./migrations")) {
    if (file.endsWith(".sql")) {
      migrations.push(file);
    }
  }

  const db = g().db;
  migrations.sort();

  for (const migration of migrations) {
    const sqlFile = fs.readFileSync(`./migrations/${migration}`, "utf-8");
    for (const sql of sqlFile.split(";")) {
      const query = CompiledQuery.raw(sql.trim());
      if (query.sql === "") {
        continue;
      }

      await db.executeQuery(query);
    }
  }
}
