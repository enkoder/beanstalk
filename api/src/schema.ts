import type { Generated, Insertable, Selectable, Updateable } from "kysely";
import {
  BASELINE_POINTS,
  BOTTOM_THRESHOLD,
  MAX_TOURNAMENTS_PER_TYPE,
  MIN_PLAYERS_TO_BE_LEGAL,
  PERCENT_RECEIVING_POINTS,
  POINTS_PER_PLAYER,
} from "./lib/ranking.js";
import type { RankingConfigType, TournamentConfigType } from "./openapi.js";

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
  | "regional championship"
  | "players circuit";

export const RankingConfig = {
  tournament_configs: {
    "worlds championship": {
      code: "worlds championship",
      name: "Worlds",
      tournament_limit: MAX_TOURNAMENTS_PER_TYPE["worlds championship"],
      min_players_to_be_legal: MIN_PLAYERS_TO_BE_LEGAL["worlds championship"],
      points_per_player: POINTS_PER_PLAYER["worlds championship"],
      baseline_points: BASELINE_POINTS["worlds championship"],
      percent_receiving_points: PERCENT_RECEIVING_POINTS["worlds championship"],
      bottom_threshold: BOTTOM_THRESHOLD["worlds championship"],
    } as TournamentConfigType,
    "continental championship": {
      code: "continental championship",
      name: "Continentals",
      tournament_limit: MAX_TOURNAMENTS_PER_TYPE["continental championship"],
      min_players_to_be_legal:
        MIN_PLAYERS_TO_BE_LEGAL["continental championship"],
      points_per_player: POINTS_PER_PLAYER["continental championship"],
      baseline_points: BASELINE_POINTS["continental championship"],
      percent_receiving_points:
        PERCENT_RECEIVING_POINTS["continental championship"],
      bottom_threshold: BOTTOM_THRESHOLD["continental championship"],
    } as TournamentConfigType,
    "national championship": {
      code: "national championship",
      name: "Nationals",
      tournament_limit: MAX_TOURNAMENTS_PER_TYPE["national championship"],
      min_players_to_be_legal: MIN_PLAYERS_TO_BE_LEGAL["national championship"],
      points_per_player: POINTS_PER_PLAYER["national championship"],
      baseline_points: BASELINE_POINTS["national championship"],
      percent_receiving_points:
        PERCENT_RECEIVING_POINTS["national championship"],
      bottom_threshold: BOTTOM_THRESHOLD["national championship"],
    } as TournamentConfigType,
    "intercontinental championship": {
      code: "intercontinental championship",
      name: "Interconts",
      tournament_limit:
        MAX_TOURNAMENTS_PER_TYPE["intercontinental championship"],
      min_players_to_be_legal:
        MIN_PLAYERS_TO_BE_LEGAL["intercontinental championship"],
      points_per_player: POINTS_PER_PLAYER["intercontinental championship"],
      baseline_points: BASELINE_POINTS["intercontinental championship"],
      percent_receiving_points:
        PERCENT_RECEIVING_POINTS["intercontinental championship"],
      bottom_threshold: BOTTOM_THRESHOLD["intercontinental championship"],
    } as TournamentConfigType,
    "circuit opener": {
      code: "circuit opener",
      name: "Circuit Opener",
      tournament_limit: MAX_TOURNAMENTS_PER_TYPE["circuit opener"],
      min_players_to_be_legal: MIN_PLAYERS_TO_BE_LEGAL["circuit opener"],
      points_per_player: POINTS_PER_PLAYER["circuit opener"],
      baseline_points: BASELINE_POINTS["circuit opener"],
      percent_receiving_points: PERCENT_RECEIVING_POINTS["circuit opener"],
      bottom_threshold: BOTTOM_THRESHOLD["circuit opener"],
    } as TournamentConfigType,
    "circuit breaker": {
      code: "circuit breaker",
      name: "Circuit Breaker",
      tournament_limit: MAX_TOURNAMENTS_PER_TYPE["circuit breaker"],
      min_players_to_be_legal: MIN_PLAYERS_TO_BE_LEGAL["circuit breaker"],
      points_per_player: POINTS_PER_PLAYER["circuit breaker"],
      baseline_points: BASELINE_POINTS["circuit breaker"],
      percent_receiving_points: PERCENT_RECEIVING_POINTS["circuit breaker"],
      bottom_threshold: BOTTOM_THRESHOLD["circuit breaker"],
    } as TournamentConfigType,
    "players circuit": {
      code: "players circuit",
      name: "Players Circuit",
      tournament_limit: MAX_TOURNAMENTS_PER_TYPE["players circuit"],
      min_players_to_be_legal: MIN_PLAYERS_TO_BE_LEGAL["players circuit"],
      points_per_player: POINTS_PER_PLAYER["players circuit"],
      baseline_points: BASELINE_POINTS["players circuit"],
      percent_receiving_points: PERCENT_RECEIVING_POINTS["players circuit"],
      bottom_threshold: BOTTOM_THRESHOLD["players circuit"],
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
  fingerprint: string | null;
  cutTo: number | null;
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
