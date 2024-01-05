import { Factions } from "../models/factions.js";
import { PrivateAccountInfo } from "../openapi";
import {
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

export function urlTournamentTags() {
  return new URL("http://localhost:8787/api/tournaments/tags");
}

export function urlTags() {
  return new URL("http://localhost:8787/api/tags");
}

export function authedOptions(method: string, body?: string) {
  const headers = { Authorization: `Bearer ${TEST_TOKEN}` };
  return { method: method, headers: headers, body: body };
}

export function urlLeaderboard({
  season,
  faction,
  format,
}: {
  season?: Season;
  faction?: Faction;
  format?: Format;
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
};

export function tournament({ id, name, season, type, format }: TournamentArgs) {
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
};

export function tag({ name, normalized, user }: TagArgs) {
  return {
    name: name,
    normalized: normalized || "",
    owner_id: user.id,
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
