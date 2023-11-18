/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { UserResultsResponse } from '../models/UserResultsResponse';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class ResultsService {

    /**
     * Gets the results for the given user
     * @param user
     * @param season
     * @returns UserResultsResponse Gets a list of all results for the given user and supplied filters
     * @throws ApiError
     */
    public static getGetUserResults(
        user: string,
        season?: number | null,
    ): CancelablePromise<UserResultsResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/{user}/results',
            path: {
                'user': user,
            },
            query: {
                'season': season,
            },
        });
    }

}
