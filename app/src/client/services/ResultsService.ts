/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */
import type { CancelablePromise } from "../core/CancelablePromise";
import { OpenAPI } from "../core/OpenAPI";
import { request as __request } from "../core/request";

export class ResultsService {
  /**
   * Gets the results for the given user
   * @param user
   * @returns any Gets a list of all results for the given user and supplied filters
   * @throws ApiError
   */
  public static getGetResults(user: string): CancelablePromise<{
    user_name: string;
    user_id: number;
    results: Array<{
      runner_deck_identity_id: number;
      runner_deck_url: string | null;
      corp_deck_identity_id: number;
      corp_deck_url: string | null;
      rank_swiss: number;
      rank_cut?: number | null;
      season_id: number;
      points_earned: number;
      tournament_id: number;
      tournament_name: string;
    }>;
  }> {
    return __request(OpenAPI, {
      method: "GET",
      url: "/api/results/{user}",
      path: {
        user: user,
      },
    });
  }
}
