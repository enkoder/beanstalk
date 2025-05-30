/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TournamentType } from './TournamentType';

export type TournamentConfig = {
    code: TournamentType;
    name: string;
    tournament_limit: number;
    min_players_to_be_legal: number;
    baseline_points: number;
    points_per_player: number;
    additional_top_cut_percentage: number;
};

