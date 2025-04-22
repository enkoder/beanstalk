/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AdminService {

    /**
     * Triggers updating all users names from nrdb
     * @returns any Updates all user accounts to pull from NRDB
     * @throws ApiError
     */
    public static getUpdateUsers(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/admin/updateNRDBNames',
        });
    }

    /**
     * Triggers a background job to ingest tournament data from ABR.
     * @param requestBody
     * @returns any Empty object indicates success on triggering ingestion.
     * @throws ApiError
     */
    public static postIngestTournament(
        requestBody?: {
            userId?: number;
            tournamentType?: 1 | 2 | 3 | 4 | 5 | 6 | 7 | 8 | 9 | 10 | 11 | 12 | 13 | 14 | 15 | 16 | 17;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/ingestTournament',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Triggers a background job to ingest all tournament data from ABR.
     * @returns any Empty object indicates success on triggering ingestion.
     * @throws ApiError
     */
    public static postIngestTournaments(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/ingestTournaments',
        });
    }

    /**
     * Fetches and updates the KV that stores the NRDB cards
     * @returns any Empty object indicates success on updating nrdb cards.
     * @throws ApiError
     */
    public static postUpdateCards(): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/updateCards',
        });
    }

    /**
     * Triggers a Season start & end date update across all tournaments.
     * @returns any How many tournaments were updated
     * @throws ApiError
     */
    public static postUpdateTournamentSeasons(): CancelablePromise<{
        tournamentsUpdated: number;
    }> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/admin/updateTournamentsSeason',
        });
    }

}
