/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { GetUsersResponse } from '../models/GetUsersResponse';
import type { UpdateUser } from '../models/UpdateUser';
import type { User } from '../models/User';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class UserService {

    /**
     * Gets your own profile
     * @returns User Your own user profile
     * @throws ApiError
     */
    public static getMe(): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/@me',
        });
    }

    /**
     * Updates your profile
     * @param requestBody
     * @returns User Your updated user profile
     * @throws ApiError
     */
    public static patchPatchMe(
        requestBody?: UpdateUser,
    ): CancelablePromise<User> {
        return __request(OpenAPI, {
            method: 'PATCH',
            url: '/api/users/@me',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

    /**
     * Gets a list of all users.
     * @returns GetUsersResponse List of all users
     * @throws ApiError
     */
    public static getGetUsers(): CancelablePromise<Array<GetUsersResponse>> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users',
        });
    }

    /**
     * Gets a single user
     * @param userId User ID (integer)
     * @returns GetUsersResponse User Object
     * @throws ApiError
     */
    public static getGetUser(
        userId: number,
    ): CancelablePromise<GetUsersResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/users/{userID}',
            path: {
                'userID': userId,
            },
        });
    }

}
