/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class AdminService {
  /**
   * Triggers updating all users names from nrdb
   * @returns any Updates all user accounts to pull from NRDB
   * @throws ApiError
   */
  public static getUpdateUsers(): CancelablePromise<any> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/admin/updateNRDBNames",
    });
  }

  /**
   * Triggers a re-rank on all User rows. Limited to admin users
   * @returns any Summary of what was changed during the re-ranking
   * @throws ApiError
   */
  public static getRerank(): CancelablePromise<{
    numberUsersUpdate: number;
  }> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/admin/rerank",
    });
  }
}
