import { Generated, Insertable, Selectable, Updateable } from "kysely";
import {
  EXTRA_POINTS_PER_PERSON,
  MAX_TOURNAMENTS_PER_TYPE,
  MIN_PLAYERS_TO_BE_LEGAL,
  PERCENT_FOR_FIRST_PLACE,
  PERCENT_RECEIVING_POINTS,
  TOURNAMENT_POINTS,
} from "./lib/ranking.js";
import { RankingConfigType, TournamentConfigType } from "./openapi.js";

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

export const RankingConfig = {
  min_players_to_be_legal: MIN_PLAYERS_TO_BE_LEGAL,
  extra_points_per_person: EXTRA_POINTS_PER_PERSON,
  percent_for_first_place: PERCENT_FOR_FIRST_PLACE,
  percent_receiving_points: PERCENT_RECEIVING_POINTS,
  tournament_configs: {
    "worlds championship": {
      code: "worlds championship",
      name: "Worlds",
      points: TOURNAMENT_POINTS["worlds championship"],
      tournament_limit: MAX_TOURNAMENTS_PER_TYPE["worlds championship"],
    } as TournamentConfigType,
    "continental championship": {
      code: "continental championship",
      name: "Continentals",
      points: TOURNAMENT_POINTS["continental championship"],
      tournament_limit: MAX_TOURNAMENTS_PER_TYPE["continental championship"],
    } as TournamentConfigType,
    "national championship": {
      code: "national championship",
      name: "Nationals",
      points: TOURNAMENT_POINTS["national championship"],
      tournament_limit: MAX_TOURNAMENTS_PER_TYPE["national championship"],
    } as TournamentConfigType,
    "intercontinental championship": {
      code: "intercontinental championship",
      name: "Interconts",
      points: TOURNAMENT_POINTS["intercontinental championship"],
      tournament_limit:
        MAX_TOURNAMENTS_PER_TYPE["intercontinental championship"],
    } as TournamentConfigType,
    "circuit opener": {
      code: "circuit opener",
      name: "Circuit Opener",
      points: TOURNAMENT_POINTS["circuit opener"],
      tournament_limit: MAX_TOURNAMENTS_PER_TYPE["circuit opener"],
    } as TournamentConfigType,
  },
} as RankingConfigType;

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
export type UpdateUser = Updateable<UsersTable>;
export type InsertUser = Insertable<UsersTable>;

export interface Database {
  users: UsersTable;
  seasons: SeasonsTable;
  tournaments: TournamentsTable;
  results: ResultsTable;
}
