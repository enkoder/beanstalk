/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { TokenResponse } from '../models/TokenResponse';

import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AuthService {

    /**
     * Fetches the NRDB login url
     * @returns string Object containing the auth_url
     * @throws ApiError
     */
    public static getGetLoginUrl(): CancelablePromise<string> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/login_url',
        });
    }

    /**
     * From the code supplied during the OAuth redirect, perform the secret exchange and create a token
     * @param code
     * @returns TokenResponse Blob containing the token and refresh_token
     * @throws ApiError
     */
    public static getGetTokenFromCode(
        code: string,
    ): CancelablePromise<TokenResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/token',
            query: {
                'code': code,
            },
        });
    }

    /**
     * Attempts to create a new token from the given refresh_token
     * @param refreshToken
     * @returns TokenResponse Blob containing the token and refresh_token
     * @throws ApiError
     */
    public static getRefreshToken(
        refreshToken: string,
    ): CancelablePromise<TokenResponse> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/auth/refresh_token',
            query: {
                'refresh_token': refreshToken,
            },
        });
    }

}
