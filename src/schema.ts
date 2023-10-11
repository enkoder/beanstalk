import {
  Generated,
  Insertable,
  Selectable,
  SelectExpression,
  Updateable,
} from "kysely";

export interface Database {
  users: UsersTable;
  seasons: SeasonsTable;
  tournaments: TournamentsTable;
  leaderboard: LeaderboardTable;
}
export interface UsersTable {
  id: Generated<number>;
  name: string;
  email: string;
  password: string;
}

export interface SeasonsTable {
  id: Generated<number>;
  name: string;
  tier: string;
  started_at: string;
  ended_at: string | null;
}

export interface TournamentsTable {
  id: Generated<number>;
  name: string;
  date: string | null;
  is_done: boolean;
  season_id: number;
}

export interface LeaderboardTable {
  user_id: number;
  rank: number;
  points: number;
  most_recent_tournament_id: number | null;
}
