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
    "circuit breaker": 50,
  };

// Defines how many points are added per player registered to the tournament
// Used to scale the number of points for large tournaments
export const POINTS_PER_PLAYER: Partial<Record<TournamentType, number>> = {
  "worlds championship": 2,
  "continental championship": 2,
  "national championship": 2,
  "intercontinental championship": 0,
  "circuit opener": 1,
  "circuit breaker": 2,
};

// Flat points added to the total point pool that gets awarded to 1st place
// Each tournament gets a different point total to reflect the tournament prestige
export const BASELINE_POINTS: Partial<Record<TournamentType, number>> = {
  "worlds championship": 500,
  "continental championship": 250,
  "national championship": 100,
  "intercontinental championship": 200,
  "circuit opener": 15,
  "circuit breaker": 200,
};

// Award all players who make the cut with an additional chunk of points.
// Values in this map indicate an additional percentage that goes to first place and follows the same decaying
// distribution as the swiss ranking point system.
export const ADDITIONAL_TOP_CUT_PERCENTAGE: Partial<
  Record<TournamentType, number>
> = {
  "worlds championship": 35,
  "continental championship": 25,
  "national championship": 20,
  "intercontinental championship": 0,
  "circuit opener": 20,
  "circuit breaker": 25,
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
    "circuit breaker": 8,
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
    "circuit breaker": 1,
  };

// Means the last person in swiss to receive less than 1 point
export const SWISS_BOTTOM_THRESHOLD = 1;

// Means the last person in the cut will receive 10% of the additional points that top of swiss is receiving
// i.e. first place receives 100 points for taking down the tournament, 8th place will receive an extra 10 points,
// assuming it's a cut to top 8
export const CUT_BOTTOM_THRESHOLD_PERCENT_OF_FIRST = 20;

export function calculatePointDistribution(
  numPlayers: number,
  tournamentType: TournamentType,
  cutTo?: number,
): {
  points: number[];
  totalPoints: number;
  cutPoints: number[];
  swissPoints: number[];
} {
  const pointsForFirst =
    numPlayers * POINTS_PER_PLAYER[tournamentType] +
    BASELINE_POINTS[tournamentType];

  // Must have enough players to earn any points
  if (numPlayers < MIN_PLAYERS_TO_BE_LEGAL[tournamentType]) {
    return {
      points: Array(numPlayers).fill(0),
      cutPoints: Array(numPlayers).fill(0),
      swissPoints: Array(numPlayers).fill(0),
      totalPoints: 0,
    };
  }

  let swissPoints: number[] = [];
  let swissTotalPoints = 0;

  // Limit the number of point winners to be based upon the given arg
  const totalWinners = Math.ceil(
    (numPlayers * PERCENT_RECEIVING_POINTS[tournamentType]) / 100,
  );

  // Start low and ramp up the percentage for first place until we hit the sweet spot
  let ratio = 0.99;

  // Outer loop conditions that iterates over the first place percentage until we find a smooth fit
  while (
    swissPoints.length === 0 ||
    swissPoints[totalWinners - 1] > SWISS_BOTTOM_THRESHOLD
  ) {
    swissPoints = [pointsForFirst];
    swissTotalPoints = pointsForFirst;

    for (let i = 1; i < numPlayers; i++) {
      const pointsAtIndex = i < totalWinners ? swissPoints[i - 1] * ratio : 0;
      swissPoints.push(pointsAtIndex);
      swissTotalPoints += pointsAtIndex;
    }

    ratio -= 0.0001;
  }

  const extraPointsFirstPlaceCut =
    (swissPoints[0] * ADDITIONAL_TOP_CUT_PERCENTAGE[tournamentType]) / 100.0;
  let cutPoints: number[] = [];
  let cutTotalPoints = 0;

  // Start low and ramp up the percentage for first place until we hit the sweet spot
  ratio = 0.99;

  // Outer loop conditions that iterates over the first place percentage until we find a smooth fit
  if (cutTo !== undefined && cutTo > 1) {
    while (
      cutPoints.length === 0 ||
      cutPoints[cutTo - 1] >
        (extraPointsFirstPlaceCut * CUT_BOTTOM_THRESHOLD_PERCENT_OF_FIRST) / 100
    ) {
      cutPoints = [extraPointsFirstPlaceCut];
      cutTotalPoints = cutPoints[0];

      for (let i = 1; i < cutTo; i++) {
        // using previous value, decrease the number of points by the current ratio
        const pointsAtIndex = cutPoints[i - 1] * ratio;
        cutPoints.push(pointsAtIndex);
        cutTotalPoints += pointsAtIndex;
      }

      ratio -= 0.0001;
    }
  }

  const points: number[] = [];
  for (let i = 0; i < swissPoints.length; i++) {
    points.push(swissPoints[i] + (i < cutPoints.length ? cutPoints[i] : 0));
  }

  return {
    points: points,
    swissPoints: swissPoints,
    cutPoints: cutPoints,
    totalPoints: swissTotalPoints + cutTotalPoints,
  };
}
