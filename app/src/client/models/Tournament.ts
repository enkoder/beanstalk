/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Tournament = {
  id: number;
  name: string;
  date: string | null;
  registration_count: number;
  location: string;
  concluded?: boolean | null;
  format: string;
  type: string;
  season_id: number;
  season_name?: string;
  season_tier?: string;
};
