/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TournamentType } from './TournamentType';

export type TournamentTypeTrend = {
    /**
     * Month in YYYY-MM format
     */
    month: string;
    tournament_type: TournamentType;
    /**
     * Total points awarded for this tournament type
     */
    total_points: number;
    /**
     * Number of tournaments of this type
     */
    tournament_count: number;
};

