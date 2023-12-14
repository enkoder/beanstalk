import { Generated, Insertable, Selectable, Updateable } from "kysely";

export type TournamentType =
  | "GNK / seasonal"
  | "asynchronous tournament"
  | "circuit breaker"
  | "circuit opener"
  | "community tournament"
  | "continental championship"
  | "infinite recursion"
  | "intercontinental championship"
  | "national championship"
  | "online event"
  | "store championship"
  | "team tournament"
  | "worlds championship"
  | "regional championship";

export enum TournamentTypeEnum {
  GNK = "GNK / seasonal",
  Asynchronous = "asynchronous tournament",
  CircuitBreaker = "circuit breaker",
  CircuitOpener = "circuit opener",
  Community = "community tournament",
  Continental = "continental championship",
  InfiniteRecursion = "infinite recursion",
  Intercontinental = "intercontinental championship",
  Nationals = "national championship",
  Online = "online event",
  StoreChamp = "store championship",
  Team = "team tournament",
  Worlds = "worlds championship",
  Regionals = "regional championship",
}

export type Format = "standard" | "startup" | "eternal";

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
}

export type User = Selectable<UsersTable>;
type UpdateUser = Updateable<UsersTable>;
type InsertUser = Insertable<UsersTable>;

export interface Database {
  users: UsersTable;
  seasons: SeasonsTable;
  tournaments: TournamentsTable;
  results: ResultsTable;
}
