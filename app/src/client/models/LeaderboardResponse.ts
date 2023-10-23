/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type LeaderboardResponse = {
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
};
