// You can see this code on GitHub
// https://github.com/enkoder/beanstalk/api/src/lib/ranking.ts
import { TournamentType } from "../schema.js";

// Sets the number of players who will be receiving any points. Defined as a percentage
// of total players i.e. value of 50 implies half of the field will get points
export const PERCENT_RECEIVING_POINTS: Partial<Record<TournamentType, number>> =
  {
    "worlds championship": 50,
    "continental championship": 50,
    "national championship": 50,
    "intercontinental championship": 1,
    "circuit opener": 100,
  };

// Sets the percentage of the total adjusted point total first place receives
// i.e. 15 implies that first place will get 15% of the total available points for that tournament
export const PERCENT_FOR_FIRST_PLACE: Partial<Record<TournamentType, number>> =
  {
    "worlds championship": 10,
    "continental championship": 12,
    "national championship": 15,
    "intercontinental championship": 100,
    "circuit opener": 30,
  };

// Defines how many points are added per player to the total available point
// This is used to increase the overall payout for large tournaments
export const POINTS_PER_PLAYER: Partial<Record<TournamentType, number>> = {
  "worlds championship": 60,
  "continental championship": 45,
  "national championship": 30,
  // Winner take all! ~200 points for 1st place @ 12 person tournament
  "intercontinental championship": 16.667,
  "circuit opener": 15,
};

// Sets a baseline number of players a tournament must have in order to receive any points at all
// This means that small tournaments are not eligible for point payouts
export const MIN_PLAYERS_TO_BE_LEGAL: Partial<Record<TournamentType, number>> =
  {
    "worlds championship": 32,
    "continental championship": 20,
    "national championship": 16,
    // Winner take all! ~200 points for 1st place @ 12 person tournament
    "intercontinental championship": 12,
    "circuit opener": 10,
  };

// Defines the number of tournaments a person can get points for
// We take the top values if a person attends more than the defined max
export const MAX_TOURNAMENTS_PER_TYPE: Partial<Record<TournamentType, number>> =
  {
    "worlds championship": 1,
    "continental championship": 1,
    "national championship": 3,
    "intercontinental championship": 1,
    "circuit opener": 5,
  };

/**
 * Given the various input params, calculates the point distribution for a tournament.
 *
 * @param numPlayers Total number of players in the tournament
 * @param tournamentType Type of tournament which is used to conditionally change the payout structure
 */
export function calculateTournamentPointDistribution(
  numPlayers: number,
  tournamentType?: TournamentType,
): { points: number[]; totalPoints: number } {
  const totalPoints = numPlayers * POINTS_PER_PLAYER[tournamentType];

  // Must have enough players to earn any points
  if (numPlayers < MIN_PLAYERS_TO_BE_LEGAL[tournamentType]) {
    return {
      points: Array(numPlayers).fill(0),
      totalPoints: 0,
    };
  }

  let points: number[] = [];
  let sum = 0;

  // Limit the number of point winners to be based upon the given arg
  const totalWinners = Math.ceil(
    (numPlayers * PERCENT_RECEIVING_POINTS[tournamentType]) / 100,
  );

  // Calculate the number of points going to first place. This value sets the starting place
  // for the exponential decaying distribution.
  const firstPlacePoints =
    (totalPoints * PERCENT_FOR_FIRST_PLACE[tournamentType]) / 100;

  // Binary search - find an acceptable value for alpha that hits the sweet spot where
  // the payout distribution matches our adjusted total points.
  let lower = 0;
  let upper = 3;

  // Sets a target threshold for margin for error while performing the binary search
  // meaning when our upper and lower are within this threshold, we've found our
  // ideal distribution. Making this smaller makes the distribution more precise but
  // involves more work.
  const threshold = 0.001;

  while (upper - lower > threshold) {
    const alpha = (upper + lower) / 2;
    points = [];
    sum = 0;

    for (let i = 1; i <= numPlayers; i++) {
      let pointsAtIndex = 0;
      // Only the top % gets points, starting with an index of 1, hence <= totalWinners
      if (i <= totalWinners) {
        // Calculates the point value for the given alpha at the given index
        // This is the function that generates the slope and exponential decaying values
        // of the payout structure.
        pointsAtIndex = firstPlacePoints / i ** alpha;
      }

      points.push(pointsAtIndex);
      sum += pointsAtIndex;
    }

    // Adjust binary search params for next iteration
    if (sum > totalPoints) {
      lower = alpha;
    } else {
      upper = alpha;
    }
  }

  // we got there!
  return { points, totalPoints };
}
