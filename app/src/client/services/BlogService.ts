/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from '../core/CancelablePromise';
import { OpenAPI } from '../core/OpenAPI';
import { request as __request } from '../core/request';

export class BlogService {

    /**
     * Views a blog post
     * @param requestBody
     * @returns any Empty object indicates success on viewing blog post
     * @throws ApiError
     */
    public static postViewBlogPost(
        requestBody?: {
            blogDate: string;
        },
    ): CancelablePromise<any> {
        return __request(OpenAPI, {
            method: 'POST',
            url: '/api/users/@me/view-blog',
            body: requestBody,
            mediaType: 'application/json',
        });
    }

}
