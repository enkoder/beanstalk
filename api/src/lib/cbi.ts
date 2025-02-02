import { g } from "../g.js";
import { Tournaments } from "../models/tournament.js";
import type { Tournament } from "../schema.js";
import {
  type ABREntryType,
  type ABRTournamentType,
  abrToTournament,
  getEntries,
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
): Promise<{
  entries: ABREntryType[];
  cutTo: number;
  tournamentBlob: Tournament;
}> {
  // Get top cut entries
  const topCutEntries = await getEntries(CBI_2024.top_cut.abr_tournament_id);
  const cutTo = topCutEntries.filter((e) => e.rank_top !== null).length;

  // Get all pod entries unsorted
  const podEntries = {
    emea: await getEntries(CBI_2024.pods.emea.abr_tournament_id),
    apac: await getEntries(CBI_2024.pods.apac.abr_tournament_id),
    americas: await getEntries(CBI_2024.pods.americas.abr_tournament_id),
  };

  const cbiEntries: CBIEntry[] = [];

  // fetch the pod standings from tournaments.nullsignal.games
  const podStandings: {
    emea: TournamentStandings;
    apac: TournamentStandings;
    americas: TournamentStandings;
  } = {
    emea: await getTournamentStandings(CBI_2024.pods.emea.nsg_tournament_id),
    apac: await getTournamentStandings(CBI_2024.pods.apac.nsg_tournament_id),
    americas: await getTournamentStandings(
      CBI_2024.pods.americas.nsg_tournament_id,
    ),
  };

  // Join up the pod results with the abr entries
  for (const [pod, abrEntries] of Object.entries(podEntries)) {
    for (const abrEntry of abrEntries) {
      // Find this player's cobra results
      const playerStanding =
        podStandings[pod].stages[0].standings.find(
          (s: PlayerStanding) =>
            s.player?.id === abrEntry.user_id ||
            s.player?.name_with_pronouns
              .toLowerCase()
              .includes(
                abrEntry.user_name?.toLowerCase() ||
                  abrEntry.user_import_name?.toLowerCase(),
              ),
          // Need to hard code some of these as they used different accounts for their swiss and top cut rounds
        ) || STANDINGS[abrEntry.user_id];
      if (!playerStanding) {
        if (!playerStanding) {
          console.log(
            abrEntry.user_name || abrEntry.user_import_name,
            abrEntry.user_id,
          );
          throw new Error(
            `Could not find player standing for ${abrEntry.user_name} (${abrEntry.user_id})`,
          );
        }
      }

      cbiEntries.push({
        ...abrEntry,
        points: playerStanding.points,
        sos: Number(playerStanding.sos),
        extended_sos: Number(playerStanding.extended_sos),
        rounds_played: CBI_2024.pods[pod].rounds_played,
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
    title: CBI_2024.name,
    players_count: finalEntries.length,
  };

  const finalTournament = abrToTournament(baseAbrTournament, seasonId, cutTo);

  return {
    entries: finalEntries,
    cutTo,
    tournamentBlob: {
      ...finalTournament,
      players_count: finalEntries.length,
      name: CBI_2024.name,
      multi_swiss: 1,
    },
  };
}
