/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class LeaderboardService {
  /**
   * Gets a list of all existing and past Seasons.
   * @returns any list of Seasons
   * @throws ApiError
   */
  public static getGetSeasons(): CancelablePromise<
    Array<{
      id: number;
      name: string;
      tier: string;
      started_at: string;
      ended_at?: string | null;
    }>
  > {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/seasons",
    });
  }

  /**
   * Gets a list of all Tournaments
   * @returns any list of Tournaments
   * @throws ApiError
   */
  public static getGetTournaments(): CancelablePromise<
    Array<{
      id: number;
      name: string;
      date: string | null;
      is_done: number;
      season_id: number;
      season_name: string;
      season_tier: string;
    }>
  > {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/tournaments",
    });
  }

  /**
   * Gets the current season's leaderboard
   * @param size
   * @param page
   * @returns any Returns a array of rows compromising the full leaderboard for the given season
   * @throws ApiError
   */
  public static getGetLeaderboard(
    size?: number | null,
    page?: number | null,
  ): CancelablePromise<{
    users: Array<{
      rank: number;
      id: number;
      name?: string | null;
      points: number;
      attended: number;
    }>;
    total: number;
    pages: number;
    current_page: number;
  }> {
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
