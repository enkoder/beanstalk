/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

import type { Format } from './Format';
import type { Result } from './Result';

export type UserResultsResponse = {
    userName: string;
    userId: number;
    rank: number;
    seasonId?: number | null;
    seasonName?: string | null;
    format?: Format;
    factionCode?: string | null;
    results: Array<Result>;
};

