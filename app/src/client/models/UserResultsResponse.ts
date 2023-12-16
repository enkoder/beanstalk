/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Format } from "./Format";
import type { Result } from "./Result";

export type UserResultsResponse = {
  user_name: string;
  user_id: number;
  rank: number;
  seasonId?: number;
  seasonName?: string;
  format?: Format;
  factionCode?: string;
  results: Array<Result>;
};
