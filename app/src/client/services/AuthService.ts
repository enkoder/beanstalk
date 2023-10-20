/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class AuthService {
  /**
   * Register a new a new user account
   * @param requestBody
   * @returns any User Object
   * @throws ApiError
   */
  public static postAuthRegister(requestBody?: {
    password: string;
    email: string;
    name: string;
  }): CancelablePromise<{
    user: {
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
    };
  }> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/auth/register",
      body: requestBody,
      mediaType: "application/json",
    });
  }

  /**
   * Log in via your email and password
   * @param requestBody
   * @returns any User Object
   * @throws ApiError
   */
  public static postAuthLogin(requestBody?: {
    password: string;
    email: string;
  }): CancelablePromise<{
    /**
     * JWT token
     */
    token: string;
  }> {
    return __request(OpenAPI, {
      method: "POST",
      url: "/api/auth/login",
      body: requestBody,
      mediaType: "application/json",
    });
  }
}
