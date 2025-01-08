// You can see this code on GitHub
// https://github.com/enkoder/beanstalk/api/src/lib/ranking.ts
import type { TournamentType } from "../schema.js";

// Default configuration (Season 0)
export const DEFAULT_CONFIG = {
  // Defines how many points are added per player registered to the tournament
  // Used to scale the number of points for large tournaments
  POINTS_PER_PLAYER: {
    "worlds championship": 2,
    "continental championship": 2,
    "national championship": 2,
    "intercontinental championship": 0,
    "circuit opener": 1,
    "circuit breaker": 2,
    "circuit breaker invitational": 2,
    "players circuit": 2,
    "casual tournament kit": 1,
  },
  // Flat points added to the total point pool that gets awarded to 1st place
  // Each tournament gets a different point total to reflect the tournament prestige
  BASELINE_POINTS: {
    "worlds championship": 250,
    "continental championship": 250,
    "national championship": 100,
    "intercontinental championship": 200,
    "circuit opener": 15,
    "circuit breaker": 200,
    "circuit breaker invitational": 200,
    "players circuit": 25,
    "casual tournament kit": 15,
  },
  // Sets a baseline number of players a tournament must have in order to distribute any points at all
  // This means that small tournaments are not eligible for payouts
  MIN_PLAYERS_TO_BE_LEGAL: {
    "worlds championship": 8,
    "continental championship": 8,
    "national championship": 12,
    "intercontinental championship": 8,
    "circuit opener": 8,
    "circuit breaker": 8,
    "circuit breaker invitational": 8,
    "players circuit": 8,
    "casual tournament kit": 8,
  },
  // Defines the max number of tournaments a person can get points for
  // We take the top values if a person attends more than the defined max
  MAX_TOURNAMENTS_PER_TYPE: {
    "worlds championship": 1,
    "continental championship": 1,
    "national championship": 3,
    "intercontinental championship": 1,
    "circuit opener": 5,
    "circuit breaker": 1,
    "circuit breaker invitational": 1,
    "players circuit": 1,
    "casual tournament kit": 5,
  },
  // Defines the bottom anchor point which means the last place player will receive less than the value provided
  // This is used to help set the rate of decay and the payout slope. A higher number indicates a more gradual slope
  BOTTOM_THRESHOLD: {
    "worlds championship": 1,
    "continental championship": 1,
    "national championship": 1,
    "intercontinental championship": 20,
    "circuit opener": 1,
    "circuit breaker": 1,
    "circuit breaker invitational": 1,
    "players circuit": 1,
    "casual tournament kit": 1,
  },
};

// Season 3 configuration
export const SEASON_3_CONFIG = {
  ...DEFAULT_CONFIG,
  BASELINE_POINTS: {
    ...DEFAULT_CONFIG.BASELINE_POINTS,
    "worlds championship": 0,
    "continental championship": 0,
    "national championship": 0,
    "intercontinental championship": 0,
    "circuit opener": 0,
    "circuit breaker": 0,
    "circuit breaker invitational": 0,
    "players circuit": 0,
    "casual tournament kit": 0,
  },
  POINTS_PER_PLAYER: {
    ...DEFAULT_CONFIG.POINTS_PER_PLAYER,
    "worlds championship": 1.5,
    "continental championship": 2,
    "national championship": 1.5,
    // special case since we use num players as total number of players across continental championships
    "intercontinental championship": 0.25,
    "circuit opener": 1,
    "circuit breaker": 1,
    "circuit breaker invitational": 1,
    "players circuit": 1,
    "casual tournament kit": 1,
  },
};

// Map of season IDs to their configurations
export const SEASON_CONFIGS = {
  0: DEFAULT_CONFIG,
  1: DEFAULT_CONFIG,
  2: SEASON_3_CONFIG,
  3: SEASON_3_CONFIG,
};

export function getSeasonConfig(seasonId?: number) {
  if (seasonId === undefined) return DEFAULT_CONFIG;
  return SEASON_CONFIGS[seasonId] || DEFAULT_CONFIG;
}

export function calculatePointDistribution(
  numPlayers: number,
  tournamentType: TournamentType,
  customPointsForFirst?: number,
  seasonId?: number,
): {
  totalPoints: number;
  points: number[];
} {
  const config = getSeasonConfig(seasonId);

  let pointsForFirst: number;
  if (customPointsForFirst) {
    pointsForFirst = customPointsForFirst;
  } else {
    pointsForFirst =
      numPlayers * config.POINTS_PER_PLAYER[tournamentType] +
      config.BASELINE_POINTS[tournamentType];
  }

  // Must have enough players to earn any points
  if (numPlayers < config.MIN_PLAYERS_TO_BE_LEGAL[tournamentType]) {
    return {
      points: Array(numPlayers).fill(0),
      totalPoints: 0,
    };
  }

  let points: number[] = [];
  let totalPoints = 0;

  /* Calculate the correct rate of decay. The formula for the number of points
  that player i receives is (pointsForFirst)*ratio**(i-1). We want player with index
  totalWinners to receive BOTTOM_THRESHOLD[tournamentType] points. Thus, we solve the
  equation (pointsForFirst)*ratio**(totalWinners-1) = BOTTOM_THRESHOLD[tournamentType]
  for ratio to find the correct rate.
  */
  const ratio =
    (config.BOTTOM_THRESHOLD[tournamentType] / pointsForFirst) **
    (1 / (numPlayers - 1));

  // Create array of points for each player
  points = [pointsForFirst];
  totalPoints = pointsForFirst;

  for (let i = 1; i < numPlayers; i++) {
    const pointsAtIndex = i < numPlayers ? points[i - 1] * ratio : 0;
    points.push(pointsAtIndex);
    totalPoints += pointsAtIndex;
  }

  return {
    points: points,
    totalPoints: totalPoints,
  };
}
