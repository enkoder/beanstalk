import type { Generated, Insertable, Selectable, Updateable } from "kysely";

export enum TournamentType {
  GNK_SEASONAL = "GNK / seasonal",
  ASYNCHRONOUS_TOURNAMENT = "asynchronous tournament",
  CIRCUIT_BREAKER = "circuit breaker",
  CIRCUIT_BREAKER_INVITATIONAL = "circuit breaker invitational",
  CIRCUIT_OPENER = "circuit opener",
  COMMUNITY_TOURNAMENT = "community tournament",
  CONTINENTAL_CHAMPIONSHIP = "continental championship",
  INFINITE_RECURSION = "infinite recursion",
  INTERCONTINENTAL_CHAMPIONSHIP = "intercontinental championship",
  NATIONAL_CHAMPIONSHIP = "national championship",
  ONLINE_EVENT = "online event",
  STORE_CHAMPIONSHIP = "store championship",
  TEAM_TOURNAMENT = "team tournament",
  WORLDS_CHAMPIONSHIP = "worlds championship",
  REGIONAL_CHAMPIONSHIP = "regional championship",
  PLAYERS_CIRCUIT = "players circuit",
  CASUAL_TOURNAMENT_KIT = "casual tournament kit",
  DISTRICT_CHAMPIONSHIP = "district championship",
  MEGA_CITY_CHAMPIONSHIP = "megacity championship",
}

export type Format = "standard" | "startup" | "eternal" | "other";

export type ResultsTable = {
  tournament_id: number;
  user_id: number;

  runner_deck_identity_id: number;
  runner_deck_faction: FactionCode;
  runner_deck_url: string;
  runner_deck_identity_name: string;

  corp_deck_identity_id: number;
  corp_deck_faction: FactionCode;
  corp_deck_url: string;
  corp_deck_identity_name: string;

  rank_swiss: number;
  rank_cut: number;

  points_earned: number;
};

export type UpdateResult = Updateable<ResultsTable>;
export type Result = Selectable<ResultsTable>;

export interface SeasonsTable {
  id: Generated<number>;
  name: string;
  started_at: string;
  ended_at: string | null;
}

export type Season = Selectable<SeasonsTable>;
export type InsertSeason = Insertable<SeasonsTable>;

export type FactionCode =
  | "anarch"
  | "criminal"
  | "shaper"
  | "neutral-runner"
  | "haas-bioroid"
  | "jinteki"
  | "nbn"
  | "weyland-consortium"
  | "neutral-corp"
  | "apex"
  | "adam"
  | "sunny-lebeau";

export type Faction = {
  code: FactionCode;
  color: string;
  is_mini: boolean;
  name: string;
  side_code: "runner" | "corp";
};

export interface TournamentsTable {
  id: number;
  name: string;
  concluded: number;
  location: string;
  format: Format;
  type: TournamentType;
  players_count: number;
  season_id: number | null;
  date: string | null;
  fingerprint: string | null;
  cutTo: number | null;
  multi_swiss: number | null;
}

export type Tournament = Selectable<TournamentsTable>;
export type UpdateTournament = Updateable<TournamentsTable>;
export type InsertTournament = Insertable<TournamentsTable>;

export interface UsersTable {
  id: number;
  name: string | null;
  email: string | null;
  password: string | null;
  is_admin: number;
  disabled: number;
  oldest_blog_post_date: string | null;
}

export type User = Selectable<UsersTable>;
export type UpdateUser = Updateable<UsersTable>;
export type InsertUser = Insertable<UsersTable>;

export interface TagsTable {
  id: Generated<number>;
  name: string;
  normalized: string;
  owner_id: number;
  use_tournament_limits: number;
}

export type Tag = Selectable<TagsTable>;
export type InsertTag = Insertable<TagsTable>;
export type UpdateTag = Updateable<TagsTable>;

export interface TournamentTagsTable {
  id: Generated<number>;
  tournament_id: number;
  tag_id: number;
}
export type TournamentTag = Selectable<TournamentTagsTable>;
export type InsertTournamentTag = Insertable<TournamentTagsTable>;

export interface Database {
  users: UsersTable;
  seasons: SeasonsTable;
  tournaments: TournamentsTable;
  results: ResultsTable;
  tags: TagsTable;
  tournament_tags: TournamentTagsTable;
}
