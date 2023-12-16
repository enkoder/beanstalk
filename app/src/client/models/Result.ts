/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Format } from "./Format";
import type { TournamentType } from "./TournamentType";

export type Result = {
  rank_swiss: number;
  rank_cut?: number | null;
  season_id: number | null;
  points_earned: number;
  tournament_id: number;
  tournament_name: string;
  tournament_type: TournamentType;
  players_count: number;
  corp_deck_identity_id: number;
  corp_deck_identity_name?: string | null;
  corp_deck_faction?: string | null;
  corp_deck_url?: string | null;
  runner_deck_identity_id: number;
  runner_deck_identity_name?: string | null;
  runner_deck_faction?: string | null;
  runner_deck_url?: string | null;
  user_id: number;
  user_name: string;
  format: Format;
  count_for_tournament_type: number;
  is_valid: boolean;
};
