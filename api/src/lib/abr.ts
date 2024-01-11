import { z } from "zod";
import { g } from "../g.js";
import { TournamentTypes } from "../models/tournament.js";
import { Format, Result, Tournament } from "../schema.js";

async function gatherResponse(response) {
  const { headers } = response;
  const contentType = headers.get("content-type") || "";
  if (contentType.includes("application/json")) {
    return JSON.stringify(await response.json());
  }
  return await response.text();
}

export enum ABRTournamentTypeFilter {
  GNK = 1,
  StoreChampionship = 2,
  RegionalChampionship = 3,
  NationalChampionship = 4,
  WorldsChampionship = 5,
  Community = 6,
  OnlineEvent = 7,
  NonTournamentEvent = 8,
  ContinentalChampionship = 9,
  TeamTournament = 10,
  CircuitOpener = 11,
  Asynchronous = 12,
  CircuitBreaker = 13,
  IntercontinentalChampionship = 14,
}

export const ABRTournament = z.object({
  id: z.coerce.number(),
  title: z.string(),
  creator_id: z.number(),
  creator_name: z.string(),
  created_at: z.coerce.date(),
  location: z.string(),
  location_lat: z.number().nullable(),
  location_lng: z.number().nullable(),
  location_country: z.string().nullable(),
  location_state: z.string().nullable(),
  approved: z.number().nullable(),
  players_count: z.number(),
  url: z.string().url(),
  // TODO: check enum
  cardpool: z.string(),
  // TODO: parse
  date: z.coerce.date(),
  // TODO: check enum
  type: z.enum(TournamentTypes),
  // TODO: check enum
  format: z.string(),
  mwl: z.string(),
  concluded: z.coerce.boolean(),
  matchdata: z.boolean(),
  winner_runner_identity: z.string().optional(),
  winner_corp_identity: z.string().optional(),
});

export function abrToTournament(
  abr: ABRTournamentType,
  seasonId: number | null,
): Tournament {
  return {
    id: abr.id,
    name: abr.title,
    concluded: abr.concluded ? 1 : 0,
    location: abr.location,
    format: abr.format as Format,
    type: abr.type,
    players_count: abr.players_count,
    season_id: seasonId,
    date: abr.date.toString(),
    fingerprint: "",
  };
}

export type ABRTournamentType = z.infer<typeof ABRTournament>;

export const ABREntry = z.object({
  corp_deck_identity_faction: z.string(),
  corp_deck_identity_id: z.coerce.number(),
  corp_deck_identity_title: z.string(),
  corp_deck_title: z.string(),
  corp_deck_url: z.string().nullable(),
  rank_swiss: z.number(),
  rank_top: z.number().nullable(),
  runner_deck_identity_faction: z.string(),
  runner_deck_identity_id: z.coerce.number(),
  runner_deck_identity_title: z.string(),
  runner_deck_title: z.string(),
  runner_deck_url: z.string().nullable(),
  user_id: z.number(),
  user_import_name: z.string().nullable(),
  user_name: z.string().nullable(),
});
export type ABREntryType = z.infer<typeof ABREntry>;

export function abrToResult(abr: ABREntryType, { ...args }): Partial<Result> {
  return {
    corp_deck_identity_id: abr.corp_deck_identity_id,
    corp_deck_url: abr.corp_deck_url,
    rank_swiss: abr.rank_swiss,
    runner_deck_identity_id: abr.runner_deck_identity_id,
    runner_deck_url: abr.runner_deck_url,
    user_id: abr.user_id,
    rank_cut: abr.rank_top,
    ...args,
  };
}

const ABR_BASE_URL = "https://alwaysberunning.net/api";

async function _getTournaments(url: URL): Promise<ABRTournamentType[]> {
  const retArr: ABRTournamentType[] = [];
  const resp = await fetch(url.toString());
  if (!resp.ok) {
    throw new Error(`Error (${resp.status}): ${await resp.text()}`);
  }
  const bodyStr = await gatherResponse(resp);
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const body: any[] = JSON.parse(bodyStr);

  if (body.length) {
    for (const tournament of body) {
      retArr.push(ABRTournament.parse(tournament));
    }
  }

  return retArr;
}

export async function getTournamentsByType(type: ABRTournamentTypeFilter) {
  const url = new URL(`${ABR_BASE_URL}/tournaments`);
  url.searchParams.append("type", String(type));
  url.searchParams.append("concluded", "1");
  return _getTournaments(url);
}

export async function getTournamentsByUserId(id: number) {
  const url = new URL(`${ABR_BASE_URL}/tournaments`);
  url.searchParams.append("foruser", String(id));
  url.searchParams.append("concluded", "1");
  return await _getTournaments(url);
}

export async function getTournaments(
  offset: number | null,
  limit: number | null,
): Promise<ABRTournamentType[]> {
  const url = new URL(`${ABR_BASE_URL}/tournaments/results`);
  if (offset) {
    url.searchParams.append("offset", String(offset));
  }
  if (limit) {
    url.searchParams.append("limit", String(limit));
  }
  return _getTournaments(url);
}

export async function getEntries(
  tournament_id: number,
): Promise<ABREntryType[]> {
  const retArr: ABREntryType[] = [];

  const url = new URL(`${ABR_BASE_URL}/entries`);
  url.searchParams.append("id", String(tournament_id));

  const resp = await fetch(url.toString());
  if (!resp.ok) {
    throw new Error(`Error (${resp.status}): ${await resp.text()}`);
  }
  const bodyStr = await gatherResponse(resp);
  // biome-ignore lint/suspicious/noExplicitAny: <explanation>
  const body: any[] = JSON.parse(bodyStr);

  if (body.length) {
    for (const entry of body) {
      try {
        retArr.push(ABREntry.parse(entry));
      } catch (error) {
        g().sentry.captureException(error);
        console.log(error);
      }
    }
  }
  return retArr;
}
