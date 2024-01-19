/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetTagsResponse } from '../models/GetTagsResponse';
import type { Tag } from '../models/Tag';
import type { TagTournament } from '../models/TagTournament';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class TagsService {

    /**
     * Gets the list of tags with a count of tournaments associated with that tag
     * @param ownerId
     * @returns GetTagsResponse Returns a array of rows showing all tags, the owners, and the count of tournaments associated with each tag
     * @throws ApiError
     */
    public static getGetTags(
        ownerId?: number | null,
    ): CancelablePromise<Array<GetTagsResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/tags',
            query: {
                'owner_id': ownerId,
            },
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
            name: string;
        },
    ): CancelablePromise<Tag> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/tags',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Deletes a tag
     * @param tagId
     * @returns any Empty object indicates deleted tag
     * @throws ApiError
     */
    public static deleteDeleteTag(
        tagId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/tags/{tag_id}',
            path: {
                'tag_id': tagId,
            },
        });
    }

    /**
     * Updates a tag
     * @param tagId
     * @param requestBody
     * @returns any Empty object indicates deleted tag
     * @throws ApiError
     */
    public static postUpdateTag(
        tagId: number,
        requestBody?: {
            use_tournament_limits: boolean;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/tags/{tag_id}',
            path: {
                'tag_id': tagId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Inserts a tournament tag
     * @param tagId
     * @param requestBody
     * @returns TagTournament Returns a array of rows showing all tags, the owners, and the count of tournaments associated with each tag
     * @throws ApiError
     */
    public static putInsertTagTournament(
        tagId: number,
        requestBody?: {
            tournament_id: number;
        },
    ): CancelablePromise<TagTournament> {
        return __request(OpenAPI, {
            method: 'PUT',
            url: '/api/tags/{tag_id}/tournament',
            path: {
                'tag_id': tagId,
            },
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Gets a list of tag tournaments
     * @param tagId
     * @returns TagTournament List of tag tournaments
     * @throws ApiError
     */
    public static getGetTagTournaments(
        tagId: number,
    ): CancelablePromise<Array<TagTournament>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/tags/{tag_id}/tournament',
            path: {
                'tag_id': tagId,
            },
        });
    }

    /**
     * Deletes the given tag tournament
     * @param tagId
     * @param tagTournamentId
     * @returns any Empty object indicating tag tournament was deleted
     * @throws ApiError
     */
    public static deleteDeleteTagTournament(
        tagId: number,
        tagTournamentId: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'DELETE',
            url: '/api/tags/{tag_id}/tournament/{tag_tournament_id}',
            path: {
                'tag_id': tagId,
                'tag_tournament_id': tagTournamentId,
            },
        });
    }

}
