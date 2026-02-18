import { g } from "../g.js";
import { Tournaments } from "../models/tournament.js";
import type { Tournament } from "../schema.js";
import {
  type ABREntryType,
  type ABRTjsonPlayerType,
  type ABRTournamentType,
  abrToTournament,
  getEntries,
  getTournamentJson,
} from "./abr.js";
import {} from "./nsg.js";
import {
  type PlayerStanding,
  type TournamentStandings,
  getTournamentStandings,
} from "./nsg.js";

type PodType = "americas" | "apac" | "emea";

export interface PodConfig {
  abr_tournament_id: number;
  nsg_tournament_id: number;
  rounds_played: number;
  pod: PodType;
}

export interface CBIConfig {
  name: string;
  pods: Record<PodType, PodConfig>;
  top_cut: {
    abr_tournament_id: number;
  };
}

export const CBI_2024 = {
  name: "Circuit Breaker Invitational 2024",
  pods: {
    emea: {
      abr_tournament_id: 4678,
      nsg_tournament_id: 3736,
      rounds_played: 8,
    },
    apac: {
      // https://alwaysberunning.net/tournaments/4676
      abr_tournament_id: 4676,
      nsg_tournament_id: 3733,
      rounds_played: 7,
    },
    // https://alwaysberunning.net/tournaments/4677
    americas: {
      abr_tournament_id: 4677,
      nsg_tournament_id: 3734,
      rounds_played: 8,
    },
  },
  // https://alwaysberunning.net/tournaments/4689
  top_cut: {
    abr_tournament_id: 4689,
  },
} as CBIConfig;

// V2 config: uses ABR tjson endpoint only, no NSG dependency
export interface MultiPodConfig {
  name: string;
  pods: { abr_id: number }[];
  top_cut: { abr_id: number };
}

export const CBI_2025_V2: MultiPodConfig = {
  name: "Circuit Breaker Invitational 2025",
  pods: [
    { abr_id: 5304 }, // EMEA
    { abr_id: 5302 }, // APAC
    { abr_id: 5303 }, // Americas
  ],
  top_cut: { abr_id: 5301 },
};

const MULTI_POD_CONFIGS: MultiPodConfig[] = [CBI_2025_V2];

interface MultiPodEntry extends ABREntryType {
  points: number;
  sos: number;
  extended_sos: number;
  rounds_played: number;
}

export async function handleMultiPodTournamentV2(
  seasonId: number,
  abrTournament: ABRTournamentType,
  config: MultiPodConfig,
): Promise<{
  entries: ABREntryType[];
  cutTo: number;
  tournamentBlob: Tournament;
}> {
  // Fetch top cut entries for rank_top assignment
  const topCutEntries = await getEntries(config.top_cut.abr_id);
  const cutTo = topCutEntries.filter((e) => e.rank_top !== null).length;

  const allEntries: MultiPodEntry[] = [];

  for (const pod of config.pods) {
    // Fetch the tjson (has standings: matchPoints, sos, esos, preliminaryRounds)
    const tjson = await getTournamentJson(pod.abr_id);
    // Build a map of tjson players by name for quick lookup
    const tjsonPlayersByName = new Map<string, ABRTjsonPlayerType>();
    for (const player of tjson.players) {
      tjsonPlayersByName.set(player.name.toLowerCase(), player);
    }

    // Fetch ABR entries (has deck info, user_id, user_name, user_import_name)
    const abrEntries = await getEntries(pod.abr_id);

    for (const entry of abrEntries) {
      // user_import_name is the Cobra name which matches tjson player.name
      const importName = entry.user_import_name?.toLowerCase();
      const tjsonPlayer = importName
        ? tjsonPlayersByName.get(importName)
        : undefined;

      if (!tjsonPlayer) {
        console.log(
          `Could not find tjson player for ${
            entry.user_name || entry.user_import_name
          } (${entry.user_id}), assigning 0 points`,
        );
      }

      allEntries.push({
        ...entry,
        points: tjsonPlayer?.matchPoints ?? 0,
        sos: Number(tjsonPlayer?.strengthOfSchedule ?? 0),
        extended_sos: Number(tjsonPlayer?.extendedStrengthOfSchedule ?? 0),
        rounds_played: tjson.preliminaryRounds,
      });
    }
  }

  // Sort by normalized score, then sos, then esos
  allEntries.sort((a, b) => {
    const aNorm = a.points / (a.rounds_played * 3);
    const bNorm = b.points / (b.rounds_played * 3);
    if (aNorm !== bNorm) return bNorm - aNorm;
    if (a.sos !== b.sos) return b.sos - a.sos;
    return b.extended_sos - a.extended_sos;
  });

  // Assign swiss placement and top cut rank
  const finalEntries: ABREntryType[] = allEntries.map((entry, i) => {
    const topCutEntry = topCutEntries.find(
      (p) =>
        (p.user_id && p.user_id === entry.user_id) ||
        (p.user_name && p.user_name === entry.user_name) ||
        (p.user_import_name && p.user_import_name === entry.user_import_name),
    );
    return {
      ...entry,
      rank_swiss: i + 1,
      rank_top: topCutEntry ? topCutEntry.rank_top : null,
    };
  });

  const baseAbrTournament = {
    ...abrTournament,
    title: config.name,
    players_count: finalEntries.length,
  };
  const tournamentBlob = abrToTournament(baseAbrTournament, seasonId, cutTo);

  return {
    entries: finalEntries,
    cutTo,
    tournamentBlob: {
      ...tournamentBlob,
      players_count: finalEntries.length,
      name: config.name,
      multi_swiss: 1,
    },
  };
}

export async function tryHandleMultiPodTournament(
  seasonId: number,
  abrTournament: ABRTournamentType,
): Promise<{
  entries: ABREntryType[];
  cutTo: number;
  tournamentBlob: Tournament;
} | null> {
  const multiPodConfig = MULTI_POD_CONFIGS.find(
    (c) => c.top_cut.abr_id === abrTournament.id,
  );
  if (multiPodConfig) {
    return handleMultiPodTournamentV2(seasonId, abrTournament, multiPodConfig);
  }

  if (CBI_2024.top_cut.abr_tournament_id === abrTournament.id) {
    return handleMultiPodTournament(seasonId, abrTournament, CBI_2024);
  }

  return null;
}

interface PodResult {
  points: number;
  sos: number;
  extended_sos: number;
  // Use either user_id or user_name to match with ABR entry
  user_id?: number;
  user_name?: string;
}

// Ordered list of pod results, matching the order of players in each pod

interface CBIEntry extends ABREntryType {
  points?: number;
  sos?: number;
  extended_sos?: number;
  rounds_played?: number;
}

const STANDINGS: Record<number, PlayerStanding> = {
  31796: {
    player: {
      id: 41759,
      name_with_pronouns: "The King (he/him)",
    },
    points: 20,
    sos: "1.76339285714285625",
    extended_sos: "1.7596540178571425",
  },
  47610: {
    player: {
      id: 41729,
      name_with_pronouns: "Eden (it)",
    },
    points: 15,
    sos: "1.375",
    extended_sos: "1.627253401360544285714285714285714286",
  },
};

/**
 * This is a mega hack, but it works even though this will likely never happen again.
 * We'll always remember the good times in 2024/5
 *
 * We need to:
 * - Get all pod standings
 * - Combine standings across all pods
 * - Sort players by their best normalized score and top cut
 * - Create a new tournament if it doesn't exist
 * - Create results for each entry using new placement swiss & top cut
 */
export async function handleMultiPodTournament(
  seasonId: number,
  abrTournament: ABRTournamentType,
  config: CBIConfig,
): Promise<{
  entries: ABREntryType[];
  cutTo: number;
  tournamentBlob: Tournament;
}> {
  // Get top cut entries
  const topCutEntries = await getEntries(config.top_cut.abr_tournament_id);
  const cutTo = topCutEntries.filter((e) => e.rank_top !== null).length;

  // Get all pod entries unsorted
  const podEntries = {
    emea: await getEntries(config.pods.emea.abr_tournament_id),
    apac: await getEntries(config.pods.apac.abr_tournament_id),
    americas: await getEntries(config.pods.americas.abr_tournament_id),
  };

  const cbiEntries: CBIEntry[] = [];

  // fetch the pod standings from tournaments.nullsignal.games
  const podStandings: {
    emea: TournamentStandings;
    apac: TournamentStandings;
    americas: TournamentStandings;
  } = {
    emea: await getTournamentStandings(config.pods.emea.nsg_tournament_id),
    apac: await getTournamentStandings(config.pods.apac.nsg_tournament_id),
    americas: await getTournamentStandings(
      config.pods.americas.nsg_tournament_id,
    ),
  };

  // Join up the pod results with the abr entries
  for (const [pod, abrEntries] of Object.entries(podEntries)) {
    for (const abrEntry of abrEntries) {
      const abrName = (
        abrEntry.user_name ||
        abrEntry.user_import_name ||
        ""
      ).toLowerCase();

      // Find this player's cobra results
      const playerStanding =
        podStandings[pod].stages[0].standings.find(
          (s: PlayerStanding) => {
            if (!s.player) return false;
            // Strip pronouns from NSG name e.g. "The King (he/him)" -> "the king"
            const nsgName = s.player.name_with_pronouns
              .replace(/\s*\(.*?\)\s*$/, "")
              .toLowerCase()
              .trim();
            return (
              nsgName === abrName ||
              nsgName.includes(abrName) ||
              (abrName.length > 0 && abrName.includes(nsgName))
            );
          },
          // Need to hard code some of these as they used different accounts for their swiss and top cut rounds
        ) || STANDINGS[abrEntry.user_id];
      if (!playerStanding) {
        console.log(
          `Could not find player standing for ${
            abrEntry.user_name || abrEntry.user_import_name
          } (${abrEntry.user_id}), assigning 0 points`,
        );
      }

      cbiEntries.push({
        ...abrEntry,
        points: playerStanding?.points ?? 0,
        sos: Number(playerStanding?.sos ?? 0),
        extended_sos: Number(playerStanding?.extended_sos ?? 0),
        rounds_played: config.pods[pod].rounds_played,
      });
    }
  }

  // Sort players by their best normalized score
  const sortedCbiEntries: CBIEntry[] = [
    ...cbiEntries.sort((a, b) => {
      const aNormalized = a.points / (a.rounds_played * 3);
      const bNormalized = b.points / (b.rounds_played * 3);
      if (aNormalized === bNormalized) {
        // sort by sos then esos
        if (a.sos === b.sos) {
          return b.extended_sos - a.extended_sos;
        }
        return b.sos - a.sos;
      }
      return bNormalized - aNormalized;
    }),
  ];

  // Now finally make sure that the swiss and top cut placements are correct
  const finalEntries: CBIEntry[] = [];
  for (let i = 0; i < sortedCbiEntries.length; i++) {
    const entry = sortedCbiEntries[i];

    // thanks for this NotAgain
    if (entry.user_import_name === "dranked") {
      entry.user_import_name = "NotAgain";
    }

    const topCutEntry = topCutEntries.find(
      (p) =>
        (p.user_id && p.user_id === entry.user_id) ||
        (p.user_name && p.user_name === entry.user_name) ||
        (p.user_import_name && p.user_import_name === entry.user_import_name),
    );

    finalEntries.push({
      ...entry,
      rank_swiss: i + 1,
      rank_top: topCutEntry ? topCutEntry.rank_top : null,
    });
  }

  // Create the tournament blob
  const baseAbrTournament = {
    ...abrTournament,
    title: config.name,
    players_count: finalEntries.length,
  };

  const finalTournament = abrToTournament(baseAbrTournament, seasonId, cutTo);

  return {
    entries: finalEntries,
    cutTo,
    tournamentBlob: {
      ...finalTournament,
      players_count: finalEntries.length,
      name: config.name,
      multi_swiss: 1,
    },
  };
}
