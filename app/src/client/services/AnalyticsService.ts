/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { IdentityTrend } from '../models/IdentityTrend';
import type { TournamentTypeTrend } from '../models/TournamentTypeTrend';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AnalyticsService {

    /**
     * Get monthly identity popularity trends
     * @param side Filter by side
     * @param faction Filter by faction
     * @param seasonId Season ID
     * @param topN Top N identities to show
     * @returns IdentityTrend Returns monthly identity trends
     * @throws ApiError
     */
    public static getGetIdentityTrends(
        side: 'runner' | 'corp',
        faction?: string,
        seasonId?: number,
        topN?: string,
    ): CancelablePromise<Array<IdentityTrend>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/analytics/identities',
            query: {
                'side': side,
                'faction': faction,
                'seasonId': seasonId,
                'topN': topN,
            },
        });
    }

    /**
     * Get monthly tournament type points distribution trends
     * @param seasonId Season ID
     * @returns TournamentTypeTrend Returns monthly tournament type trends
     * @throws ApiError
     */
    public static getGetTournamentTypeTrends(
        seasonId?: number,
    ): CancelablePromise<Array<TournamentTypeTrend>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/analytics/tournament-types',
            query: {
                'seasonId': seasonId,
            },
        });
    }

}
