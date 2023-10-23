/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { LeaderboardResponse } from "../models/LeaderboardResponse";

import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class LeaderboardService {
  /**
   * Gets the current season's leaderboard
   * @param size
   * @param page
   * @returns LeaderboardResponse Returns a array of rows compromising the full leaderboard for the given season
   * @throws ApiError
   */
  public static getGetLeaderboard(
    size?: number | null,
    page?: number | null,
  ): CancelablePromise<LeaderboardResponse> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/leaderboard",
      query: {
        size: size,
        page: page,
      },
    });
  }
}
