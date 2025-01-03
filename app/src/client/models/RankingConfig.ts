/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TournamentConfig } from './TournamentConfig';

export type RankingConfig = {
    bottom_threshold: number;
    tournament_configs: {
        'GNK / seasonal'?: TournamentConfig;
        'asynchronous tournament'?: TournamentConfig;
        'circuit breaker'?: TournamentConfig;
        'circuit breaker invitational'?: TournamentConfig;
        'circuit opener'?: TournamentConfig;
        'community tournament'?: TournamentConfig;
        'continental championship'?: TournamentConfig;
        'infinite recursion'?: TournamentConfig;
        'intercontinental championship'?: TournamentConfig;
        'national championship'?: TournamentConfig;
        'online event'?: TournamentConfig;
        'store championship'?: TournamentConfig;
        'team tournament'?: TournamentConfig;
        'worlds championship'?: TournamentConfig;
        'regional championship'?: TournamentConfig;
        'players circuit'?: TournamentConfig;
    };
};

