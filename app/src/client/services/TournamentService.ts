/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Tournament } from '../models/Tournament';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class TournamentService {

    /**
     * Gets a list of all Tournaments
     * @returns Tournament list of Tournaments
     * @throws ApiError
     */
    public static getGetTournaments(): CancelablePromise<Array<Tournament>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/tournaments',
        });
    }

    /**
     * Gets a single tournament
     * @param tournamentId
     * @returns Tournament Full Tournament object
     * @throws ApiError
     */
    public static getGetTournament(
        tournamentId: number,
    ): CancelablePromise<Tournament> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/tournaments/{tournamentId}',
            path: {
                'tournamentId': tournamentId,
            },
        });
    }

    /**
     * Gets a single tournament
     * @param tournamentId
     * @returns Tournament Full Tournament object
     * @throws ApiError
     */
    public static getGetTournamentResults(
        tournamentId: number,
    ): CancelablePromise<Tournament> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/tournaments/{tournamentId}/results',
            path: {
                'tournamentId': tournamentId,
            },
        });
    }

}
