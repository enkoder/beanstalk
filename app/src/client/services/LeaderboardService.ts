/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Faction } from '../models/Faction';
import type { Format } from '../models/Format';
import type { GetPointDistributionResponse } from '../models/GetPointDistributionResponse';
import type { LeaderboardRow } from '../models/LeaderboardRow';
import type { RankingConfig } from '../models/RankingConfig';
import type { TournamentType } from '../models/TournamentType';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class LeaderboardService {

    /**
     * Gets the current season's leaderboard
     * @param seasonId
     * @param factionCode
     * @param format
     * @returns LeaderboardRow Returns a array of rows compromising the full leaderboard for the given season
     * @throws ApiError
     */
    public static getGetLeaderboard(
        seasonId?: number | null,
        factionCode?: string,
        format?: Format,
    ): CancelablePromise<Array<LeaderboardRow>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/leaderboard',
            query: {
                'seasonId': seasonId,
                'factionCode': factionCode,
                'format': format,
            },
        });
    }

    /**
     * Tool to show distribution of points from various given parameters
     * @param numPlayers
     * @param type
     * @returns GetPointDistributionResponse Returns a array of numbers representing the point distribution of the simulated tournament
     * @throws ApiError
     */
    public static getGetPointDistribution(
        numPlayers?: number | null,
        type?: TournamentType,
    ): CancelablePromise<GetPointDistributionResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/point-distribution',
            query: {
                'numPlayers': numPlayers,
                'type': type,
            },
        });
    }

    /**
     * Returns a list of Netrunner Factions
     * @returns Faction Returns an array Factions
     * @throws ApiError
     */
    public static getGetFactions(): CancelablePromise<Array<Faction>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/factions',
        });
    }

    /**
     * Returns a list of supported Netrunner Formats
     * @returns Format Returns an array supported Formats
     * @throws ApiError
     */
    public static getGetFormats(): CancelablePromise<Array<Format>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/formats',
        });
    }

    /**
     * Returns an object containing configuration data for determining the leaderboard
     * @returns RankingConfig Returns a RankingConfig object
     * @throws ApiError
     */
    public static getGetRankingConfig(): CancelablePromise<RankingConfig> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/tournaments/config',
        });
    }

}
