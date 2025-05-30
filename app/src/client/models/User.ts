/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type User = {
    /**
     * User ID
     */
    id: number;
    /**
     * User name
     */
    name: string | null;
    /**
     * User email
     */
    email: string | null;
    /**
     * Flag indicating if the user has opted-out
     */
    disabled?: boolean | null;
    /**
     * Flag indicating that the user is an Admin user
     */
    is_admin?: boolean | null;
    /**
     * Date of oldest viewed blog post page
     */
    oldest_blog_post_date: string | null;
};

