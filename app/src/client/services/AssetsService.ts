/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class AssetsService {

    /**
     * Gets a cached ID image
     * @param id
     * @returns any Identity image PNG
     * @throws ApiError
     */
    public static getGetIdImg(
        id: number,
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'GET',
            url: '/api/assets/ids/{id}',
            path: {
                id: id,
            },
        });
    }

}
