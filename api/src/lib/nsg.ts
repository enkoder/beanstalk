import { z } from "zod";

const identitySchema = z.object({
  name: z.string(),
  faction: z.string(),
});

const playerSchema = z
  .object({
    id: z.number(),
    name_with_pronouns: z.string(),
    corp_id: identitySchema.optional().nullable(),
    runner_id: identitySchema.optional().nullable(),
  })
  .optional();

const policySchema = z
  .object({
    view_decks: z.boolean(),
  })
  .optional();

const playerStandingSchema = z.object({
  player: playerSchema,
  policy: policySchema,
  position: z.number(),
  points: z.number().optional(),
  sos: z.union([z.string(), z.number()]).optional(),
  extended_sos: z.union([z.string(), z.number()]).optional(),
  corp_points: z.number().optional(),
  runner_points: z.number().optional(),
  manual_seed: z.number().nullable().optional(),
  side_bias: z.number().nullable().optional(),
  seed: z.number().optional(),
});

const stageSchema = z.object({
  format: z.string(),
  rounds_complete: z.number(),
  any_decks_viewable: z.boolean(),
  standings: z.array(playerStandingSchema),
});

const tournamentStandingsSchema = z.object({
  is_player_meeting: z.boolean(),
  manual_seed: z.boolean(),
  stages: z.array(stageSchema),
});

// Type inference from schemas
export type Identity = z.infer<typeof identitySchema>;
export type Player = z.infer<typeof playerSchema>;
export type Policy = z.infer<typeof policySchema>;
export type PlayerStanding = z.infer<typeof playerStandingSchema>;
export type Stage = z.infer<typeof stageSchema>;
export type TournamentStandings = z.infer<typeof tournamentStandingsSchema>;

const NSG_BASE_URL = "https://tournaments.nullsignal.games";
const MAX_RETRIES = 3;
const INITIAL_RETRY_DELAY = 1000; // 1 second

/**
 * Implements an exponential backoff retry strategy
 * @param fn The async function to retry
 * @param retries Maximum number of retries
 * @param delay Initial delay in milliseconds
 * @returns The result of the function or throws the last error
 */
async function withRetry<T>(
  fn: () => Promise<T>,
  retries = MAX_RETRIES,
  delay = INITIAL_RETRY_DELAY,
): Promise<T> {
  try {
    const result = await fn();
    return result;
  } catch (error) {
    if (retries === 0) {
      throw error;
    }

    // Wait with exponential backoff
    await new Promise((resolve) => setTimeout(resolve, delay));

    // Retry with exponential backoff
    return withRetry(fn, retries - 1, delay * 2);
  }
}

export async function getTournamentStandings(
  tournamentId: number,
): Promise<TournamentStandings> {
  return await withRetry(async () => {
    const response = await fetch(
      `${NSG_BASE_URL}/tournaments/${tournamentId}/players/standings_data`,
      {
        headers: {
          Accept: "application/json",
        },
      },
    );

    if (!response.ok) {
      throw new Error(
        `Failed to fetch tournament standings: ${response.statusText}`,
      );
    }

    const data = (await response.json()) as TournamentStandings;
    // Validate and parse the response data
    return tournamentStandingsSchema.parse(data);
  });
}

/**
 * Get normalized points for a player in a tournament.
 * This takes into account the number of rounds played and maximum possible points.
 * @param standing The player's standing data
 * @param roundCount The total number of rounds in the tournament
 * @returns A number between 0 and 1 representing the player's normalized score
 */
export function getNormalizedPoints(
  standing: PlayerStanding,
  roundCount: number,
): number {
  // Maximum points possible is 3 points per round
  const maxPoints = roundCount * 3;
  return standing.points / maxPoints;
}

/**
 * Get all player standings from a tournament, sorted by points (highest first)
 * @param tournamentId The NullSignal tournament ID
 * @returns Array of player standings
 */
export async function getPlayerStandings(
  tournamentId: number,
): Promise<PlayerStanding[]> {
  const data = await getTournamentStandings(tournamentId);
  // Get the latest stage's standings
  // Not sure when there would be more than one stage though.
  const latestStage = data.stages[data.stages.length - 1];
  return latestStage.standings.sort((a, b) => b.points - a.points);
}

/**
 * Sorts a list of players by their nomalized points.
 * If two players have the same normalized points, then it sorts by sos and then extended sos.
 */
export function sortPlayersByNormalizedPoints(
  tournaments: TournamentStandings[],
): PlayerStanding[] {
  type CombinedStandings = {
    player: PlayerStanding;
    points: number;
  };

  const combinedStandings: CombinedStandings[] = [];

  for (const tournament of tournaments) {
    for (const stage of tournament.stages) {
      for (const standing of stage.standings) {
        combinedStandings.push({
          player: standing,
          points: getNormalizedPoints(standing, stage.rounds_complete),
        });
      }
    }
  }
  return combinedStandings
    .sort((a: CombinedStandings, b: CombinedStandings) => {
      if (a.points === b.points) {
        return (
          Number(b.player.sos) - Number(a.player.sos) ||
          Number(b.player.extended_sos) - Number(a.player.extended_sos) ||
          0
        );
      }

      return b.points - a.points;
    })
    .map((c) => c.player);
}
