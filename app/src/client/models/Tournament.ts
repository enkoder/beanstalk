/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type Tournament = {
    id: number;
    name: string | null;
    date: string | null;
    players_count: number;
    location: string;
    concluded?: boolean | null;
    format: string;
    type: string;
    season_id: number | null;
    season_name?: string | null;
    season_tier?: string | null;
};

