/* generated using openapi-typescript-codegen -- do no edit */
/* istanbul ignore file */
/* tslint:disable */
/* eslint-disable */

export type IdentityTrend = {
    /**
     * Month in YYYY-MM format
     */
    month: string;
    /**
     * Name of the identity
     */
    identity_name: string;
    /**
     * ID of the identity
     */
    identity_id: number;
    /**
     * Faction of the identity
     */
    faction: string;
    side: IdentityTrend.side;
    /**
     * Number of times the identity was played
     */
    count: number;
    /**
     * Percentage of total decks for that month
     */
    percentage: number;
};

export namespace IdentityTrend {

    export enum side {
        RUNNER = 'runner',
        CORP = 'corp',
    }


}

