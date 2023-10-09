"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.users = void 0;
const sqlite_core_1 = require("drizzle-orm/sqlite-core");
exports.users = (0, sqlite_core_1.sqliteTable)("users", {
  id: (0, sqlite_core_1.integer)("id").primaryKey(),
  name: (0, sqlite_core_1.text)("name").notNull(),
  email: (0, sqlite_core_1.text)("email").notNull(),
});
