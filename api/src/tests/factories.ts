import type { IncomingRequestCfProperties } from "@cloudflare/workers-types/experimental/index";
import type { RequestInit } from "miniflare";
import { Factions } from "../models/factions.js";
import { Tags } from "../models/tags";
import { PrivateAccountInfo, type TagComponentType } from "../openapi";
import type {
  Faction,
  Format,
  Result,
  Season,
  Tag,
  Tournament,
  TournamentTag,
  TournamentType,
  User,
} from "../schema";

const TEST_TOKEN = "test token";

export function urlMe() {
  return new URL("http://localhost:8787/api/users/@me");
}

export function urlTags({
  tag,
  owner,
  tournamentsUrl = false,
}: { tag?: Tag | TagComponentType; owner?: User; tournamentsUrl?: boolean }) {
  const base = "http://localhost:8787/api/tags";
  let url: URL;
  if (tag && tournamentsUrl) {
    url = new URL(`${base}/${tag.id}/tournament`);
  } else if (tag) {
    url = new URL(`${base}/${tag.id}`);
  } else {
    url = new URL(base);
  }

  if (owner !== undefined) {
    url.searchParams.append("owner_id", String(owner.id));
  }

  return url;
}

export function authedOptions({
  method,
  body,
}: RequestInit): RequestInit<Partial<IncomingRequestCfProperties>> {
  const headers = { Authorization: `Bearer ${TEST_TOKEN}` };
  return { method: method, headers: headers, body: body };
}

export function urlLeaderboard({
  season,
  faction,
  format,
  tags = [],
}: {
  season?: Season;
  faction?: Faction;
  format?: Format;
  tags?: string[];
}) {
  const url = new URL("http://localhost:8787/api/leaderboard");
  if (season) {
    url.searchParams.append("seasonId", String(season.id));
  }
  if (faction) {
    url.searchParams.append("factionCode", faction.code);
  }
  if (format) {
    url.searchParams.append("format", format);
  }
  for (const tag of tags) {
    url.searchParams.append("tags", tag);
  }
  return url;
}

type ResultArgs = {
  tournament: Tournament;
  user: User;
  points: number;
  runnerFaction?: Faction;
  corpFaction?: Faction;
};

export function result({
  tournament,
  user,
  points,
  runnerFaction,
  corpFaction,
}: ResultArgs) {
  return {
    tournament_id: tournament.id,
    user_id: user.id,
    points_earned: points,
    runner_deck_identity_id: 0,
    runner_deck_faction: runnerFaction?.code || Factions.Shaper.code,
    runner_deck_url: "",
    runner_deck_identity_name: "",
    corp_deck_identity_id: 0,
    corp_deck_faction: corpFaction?.code || Factions.HaasBioroid.code,
    corp_deck_url: "",
    corp_deck_identity_name: "",
    rank_swiss: 1,
    rank_cut: 1,
  } as Result;
}

type TournamentArgs = {
  id: number;
  season?: Season;
  name?: string;
  type?: TournamentType;
  format?: Format;
  cutTo?: number;
};

export function tournament({
  id,
  name,
  season,
  type,
  format,
  cutTo,
}: TournamentArgs) {
  return {
    id: id,
    name: name || "test name",
    concluded: 1,
    location: "location",
    format: format || "standard",
    type: type || "worlds championship",
    players_count: 10,
    season_id: season?.id,
    date: "",
    fingerprint: "",
    cutTo: cutTo || null,
  } as Tournament;
}

type UserArgs = {
  id: number;
  isAdmin?: number;
};

export function user({ id, isAdmin }: UserArgs) {
  return {
    id: id,
    name: `user${id} name`,
    email: `user${id} email`,
    password: `user${id} password`,
    is_admin: isAdmin,
  } as User;
}

type SeasonArgs = {
  id: number;
  endedAt?: string | null;
};

export function season({ id, endedAt = null }: SeasonArgs) {
  return {
    id: id,
    name: `season${id} name`,
    started_at: "",
    ended_at: endedAt,
  } as Season;
}

export function getPrivateAccountInfo(u: User) {
  return PrivateAccountInfo.parse({
    id: u.id,
    username: u.name,
    email: u.email,
    reputation: 0,
    sharing: false,
  });
}

type TagArgs = {
  name: string;
  normalized?: string;
  user: User;
  use_tournament_limits?: boolean;
};

export function tag({
  name,
  normalized,
  user,
  use_tournament_limits,
}: TagArgs) {
  return {
    name: name,
    normalized: normalized || Tags.normalizeName(name),
    owner_id: user.id,
    use_tournament_limits:
      use_tournament_limits !== undefined && use_tournament_limits ? 1 : 0,
  } as Tag;
}

type TournamentTagArgs = {
  tournament: Tournament;
  tag: Tag;
};

export function tournament_tag({ tournament, tag }: TournamentTagArgs) {
  return {
    tag_id: tag.id,
    tournament_id: tournament.id,
  } as TournamentTag;
}
