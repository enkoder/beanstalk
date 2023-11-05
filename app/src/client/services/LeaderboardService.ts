/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetPointDistributionResponse } from '../models/GetPointDistributionResponse';
import type { LeaderboardResponse } from '../models/LeaderboardResponse';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class LeaderboardService {

    /**
     * Gets the current season's leaderboard
     * @param size
     * @param page
     * @param seasonId
     * @returns LeaderboardResponse Returns a array of rows compromising the full leaderboard for the given season
     * @throws ApiError
     */
    public static getGetLeaderboard(
        size?: number | null,
        page?: number | null,
        seasonId?: number | null,
    ): CancelablePromise<LeaderboardResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/leaderboard',
            query: {
                'size': size,
                'page': page,
                'seasonId': seasonId,
            },
        });
    }

    /**
     * Tool to show distribution of points from various given parameters
     * @param totalPoints
     * @param numPlayers
     * @param percentReceivingPoints
     * @param targetTopPercentage
     * @param targetPointPercentageForTop
     * @returns GetPointDistributionResponse Returns a array of numbers representing the point distribution of the simulated tournament
     * @throws ApiError
     */
    public static getGetPointDistribution(
        totalPoints?: number | null,
        numPlayers?: number | null,
        percentReceivingPoints?: number | null,
        targetTopPercentage?: number | null,
        targetPointPercentageForTop?: number | null,
    ): CancelablePromise<GetPointDistributionResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/point-distribution',
            query: {
                'totalPoints': totalPoints,
                'numPlayers': numPlayers,
                'percentReceivingPoints': percentReceivingPoints,
                'targetTopPercentage': targetTopPercentage,
                'targetPointPercentageForTop': targetPointPercentageForTop,
            },
        });
    }

}
