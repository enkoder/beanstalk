import {integer, sqliteTable, text} from 'drizzle-orm/sqlite-core';
import {InferSelectModel} from "drizzle-orm";

export const users = sqliteTable('users', {
    id: integer('id').primaryKey(),
    name: text('name').notNull(),
    email: text('email').notNull(),
});

export type UserSelect = InferSelectModel<typeof users>;