/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { User } from "../models/User";

import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class UserService {
  /**
   * Gets your own profile
   * @returns User Your own user profile
   * @throws ApiError
   */
  public static getMe(): CancelablePromise<User> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/users/@me",
    });
  }

  /**
   * Gets a list of all users.
   * @returns User List of all users
   * @throws ApiError
   */
  public static getGetUsers(): CancelablePromise<Array<User>> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/users",
    });
  }

  /**
   * Gets a single user
   * @param userId
   * @returns User User Object
   * @throws ApiError
   */
  public static getGetUser(userId: number): CancelablePromise<User> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/users/{userID}",
      path: {
        userID: userId,
      },
    });
  }
}
