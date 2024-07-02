/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Season } from '../models/Season';
import type { Tournament } from '../models/Tournament';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class SeasonsService {

    /**
     * Gets a list of all existing and past Seasons.
     * @returns Season list of Seasons
     * @throws ApiError
     */
    public static getGetSeasons(): CancelablePromise<Array<Season>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/seasons',
        });
    }

    /**
     * Gets a list of all existing and past Seasons.
     * @param seasonId Season ID
     * @returns Tournament list of Tournaments for the given season
     * @throws ApiError
     */
    public static getGetSeasonTournaments(
        seasonId: number,
    ): CancelablePromise<Array<Tournament>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/seasons/{seasonId}/tournaments',
            path: {
                'seasonId': seasonId,
            },
        });
    }

}
