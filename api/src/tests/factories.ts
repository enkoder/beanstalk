import { Faction, Factions } from "../models/factions";
import { Result } from "../models/results";
import { Format, Tournament, TournamentType } from "../models/tournament";
import { User } from "../models/user";
import { Season } from "../models/season";

type ResultArgs = {
  tournament: Tournament;
  user: User;
  points: number;
  runnerFaction?: Faction;
  corpFaction?: Faction;
};

export function resultFactory({
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

export function tournamentFactory({
  id,
  name,
  season,
  type,
  format,
}: TournamentArgs) {
  return {
    id: id,
    name: name || "test name",
    concluded: 1,
    location: "location",
    format: format || "standard",
    type: type || TournamentType.Worlds,
    players_count: 10,
    season_id: season?.id,
    date: "",
  } as Tournament;
}

type UserArgs = {
  id: number;
  isAdmin?: number;
};

export function userFactory({ id, isAdmin }: UserArgs) {
  return {
    id: id,
    name: `user${id} name`,
    email: `user${id} email`,
    password: `user${id} password`,
    is_admin: isAdmin,
  } as User;
}

export function usersFactory(num: number, startId: number = 0) {
  const retArr: User[] = [];
  for (let i = startId; i < num + startId; i++) {
    retArr.push(userFactory({ id: i }));
  }
  return retArr;
}

type SeasonArgs = {
  id: number;
  endedAt?: string | null;
};

export function seasonFactory({ id, endedAt = null }: SeasonArgs) {
  return {
    id: id,
    name: `season${id} name`,
    started_at: "",
    ended_at: endedAt,
  } as Season;
}
