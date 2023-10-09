import { Generated, Insertable, Selectable, Updateable } from "kysely";

export interface Database {
  users: UsersTable;
  seasons: SeasonsTable;
  tournaments: TournamentTable;
}
export interface UsersTable {
  id: Generated<number>;
  name: string;
  email: string;
  password: string;
}
export type User = Selectable<UsersTable>;
export type NewUser = Insertable<UsersTable>;
export type UpdateUser = Updateable<UsersTable>;

export interface SeasonsTable {
  id: Generated<number>;
  name: string;
  tier: string;
  started_at: string;
  ended_at: string | null;
}

export type Season = Selectable<SeasonsTable>;
export type NewSeason = Insertable<SeasonsTable>;
export type UpdateSeason = Updateable<SeasonsTable>;

export interface TournamentTable {
  id: Generated<number>;
  name: string;
  date: string | null;
  is_done: boolean;
  season_id: number;
}
export type Tournament = Selectable<TournamentTable>;
export type NewTournament = Insertable<TournamentTable>;
export type UpdateTournament = Updateable<TournamentTable>;

//export const player_registration = sqliteTable("player_registration ", {
//  id: integer("id").primaryKey(),
//  tournament_id: integer("tournament_id").references(() => tournaments.id),
//  user_id: integer("user_id").references(() => users.id),
//  corp_id: text("nrdb_corp_id").notNull(),
//  runner_id: text("nrdb_runner_id").notNull(),
//});
//
//export const match_slip = sqliteTable("match_slip ", {
//  id: integer("id").primaryKey(),
//  date: text("date")
//    .notNull()
//    .default(sql`CURRENT_DATE`),
//  user_id_as_runner: integer("user_id_as_runner").references(() => users.id),
//  user_id_as_corp: integer("user_id_as_corp").references(() => users.id),
//  runner_points: integer("runner_points").notNull(),
//  corp_points: integer("corp_points").notNull(),
//  corp_id: text("nrdb_corp_id").notNull(),
//  runner_id: text("nrdb_runner_id").notNull(),
//  tournament_id: integer("tournament_id")
//    .notNull()
//    .references(() => tournaments.id),
//  round_number: integer("round_number"),
//});
//
