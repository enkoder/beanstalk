// You can see this code on GitHub
// https://github.com/enkoder/beanstalk/api/src/lib/ranking.ts
import { TournamentType } from "../schema.js";

// Sets the number of players who will be receiving any points. Defined as a percentage
// of total players i.e. value of 50 implies half of the field will get points
export const PERCENT_RECEIVING_POINTS: Partial<Record<TournamentType, number>> =
  {
    "worlds championship": 50,
    "continental championship": 50,
    "national championship": 66,
    "intercontinental championship": 100,
    "circuit opener": 100,
  };

// Defines how many points are added per player registered to the tournament
// Used to scale the number of points for large tournaments
export const POINTS_PER_PLAYER: Partial<Record<TournamentType, number>> = {
  "worlds championship": 2,
  "continental championship": 2,
  "national championship": 2,
  "intercontinental championship": 0,
  "circuit opener": 1,
};

export const BASELINE_POINTS: Partial<Record<TournamentType, number>> = {
  "worlds championship": 500,
  "continental championship": 250,
  "national championship": 100,
  "intercontinental championship": 200,
  "circuit opener": 15,
};

// Sets a baseline number of players a tournament must have in order to distribute any points at all
// This means that small tournaments are not eligible for payouts
export const MIN_PLAYERS_TO_BE_LEGAL: Partial<Record<TournamentType, number>> =
  {
    "worlds championship": 8,
    "continental championship": 8,
    "national championship": 16,
    "intercontinental championship": 8,
    "circuit opener": 8,
  };

// Defines the max number of tournaments a person can get points for
// We take the top values if a person attends more than the defined max
export const MAX_TOURNAMENTS_PER_TYPE: Partial<Record<TournamentType, number>> =
  {
    "worlds championship": 1,
    "continental championship": 1,
    "national championship": 3,
    "intercontinental championship": 1,
    "circuit opener": 5,
  };

export const BOTTOM_THRESHOLD = 1;

export function calculateTournamentPointDistribution(
  numPlayers: number,
  tournamentType?: TournamentType,
): { points: number[]; totalPoints: number } {
  const pointsForFirst =
    numPlayers * POINTS_PER_PLAYER[tournamentType] +
    BASELINE_POINTS[tournamentType];

  // Must have enough players to earn any points
  if (numPlayers < MIN_PLAYERS_TO_BE_LEGAL[tournamentType]) {
    return {
      points: Array(numPlayers).fill(0),
      totalPoints: 0,
    };
  }

  let points: number[] = [];
  let totalPoints = 0;

  // Limit the number of point winners to be based upon the given arg
  const totalWinners = Math.ceil(
    (numPlayers * PERCENT_RECEIVING_POINTS[tournamentType]) / 100,
  );

  // Start low and ramp up the percentage for first place until we hit the sweet spot
  let ratio = 0.99;

  // Outer loop conditions that iterates over the first place percentage until we find a smooth fit
  while (points.length === 0 || points[totalWinners - 1] > BOTTOM_THRESHOLD) {
    points = [pointsForFirst];
    totalPoints = pointsForFirst;

    for (let i = 1; i < numPlayers; i++) {
      const pointsAtIndex = i < totalWinners ? points[i - 1] * ratio : 0;
      points.push(pointsAtIndex);
      totalPoints += pointsAtIndex;
    }

    ratio -= 0.0001;
  }

  // we got there!
  return { points, totalPoints };
}
