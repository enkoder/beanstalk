/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { LeaderboardRow } from "./LeaderboardRow";

export type LeaderboardResponse = {
  users: Array<LeaderboardRow>;
  total: number;
  pages: number;
  current_page: number;
};
