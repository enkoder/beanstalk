/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { Tag } from '../models/Tag';
import type { TournamentTag } from '../models/TournamentTag';
import type { TournamentTagExpanded } from '../models/TournamentTagExpanded';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class TagsService {

    /**
     * Gets the list of tags with a count of tournaments associated with that tag
     * @param ownerId
     * @returns TournamentTagExpanded Returns a array of rows showing all tags, the owners, and the count of tournaments associated with each tag
     * @throws ApiError
     */
    public static getGetTournamentTags(
        ownerId?: number | null,
    ): CancelablePromise<Array<TournamentTagExpanded>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/tournaments/tags',
            query: {
                'owner_id': ownerId,
            },
        });
    }

    /**
     * Inserts a tournament tag
     * @param requestBody
     * @returns TournamentTag Returns a array of rows showing all tags, the owners, and the count of tournaments associated with each tag
     * @throws ApiError
     */
    public static putInsertTournamentTags(
        requestBody?: {
            tag_id: number;
            tournament_id: number;
        },
    ): CancelablePromise<TournamentTag> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/tournaments/tags',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Gets the list of tags with a count of tournaments associated with that tag
     * @returns Tag Returns a array of rows showing all tags, the owners, and the count of tournaments associated with each tag
     * @throws ApiError
     */
    public static getGetTags(): CancelablePromise<Array<Tag>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/tags',
        });
    }

    /**
     * Inserts a tag
     * @param requestBody
     * @returns Tag Returns the inserted tag
     * @throws ApiError
     */
    public static putInsertTags(
        requestBody?: {
            tag_name: string;
        },
    ): CancelablePromise<Tag> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/tags',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
