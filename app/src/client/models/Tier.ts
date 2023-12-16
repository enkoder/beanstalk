/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { TournamentType } from "./TournamentType";

export type Tier = {
  id: number;
  code: TournamentType;
  name: string;
  points: number;
  season?: number;
  type?: TournamentType;
};
