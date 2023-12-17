/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TournamentType } from './TournamentType';

export type RankingConfig = {
    min_players_to_be_legal: number;
    extra_points_per_person: number;
    percent_for_first_place: number;
    percent_receiving_points: number;
    tournament_configs: Record<string, {
        code: TournamentType;
        tournament_limit: number;
        name: string;
        points: number;
    }>;
};
