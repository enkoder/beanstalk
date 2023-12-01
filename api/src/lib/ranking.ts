// You can see this code on Github
// https://github.com/enkoder/beanstalk/api/src/lib/ranking.ts
import { TournamentType } from "../models/tournament";

// Sets the number of players who will be receiving any points. Defined as a percentage
// of total players i.e. value of .5 implies half of the field will get points
export const PERCENT_RECEIVING_POINTS = 0.5;

// Sets the percentage of the total adjusted point total first place receives
// i.e. .2 implies that first place will get 20% of the total available points for that tournament
export const PERCENT_FOR_FIRST_PLACE = 0.2;

// Defines how many additional points are added per player to the total available point
// This is used to increase the overall payout for large tournaments
export const EXTRA_POINTS_PER_PERSON = 20;

// Sets a baseline number of players a tournament must have in order to receive any points at all
// This means that small tournaments are not eligible for point payouts
export const MIN_PLAYERS_TO_BE_LEGAL = 10;

// Defines the baseline point total per tournament type before the additional points per player is added
export const TOURNAMENT_POINTS = {
  [TournamentType.Worlds]: 4000,
  [TournamentType.Continental]: 2000,
  [TournamentType.Nationals]: 1000,
};

/**
 * Given the various input params, calculates the point distribution for a tournament.
 *
 * @param totalPoints Baseline number of total points the tournament will distribute amongst players
 * @param numPlayers Total number of players in the tournament
 * @param firstPlacePercentage Flat percentage of points first place receives from the adjusted total point pool
 * @param percentReceivingPoints Percentage of the field that should receive any points
 * @param extraPointsPerPerson Extra points to add to the total point pool per person
 */
export function calculateTournamentPointDistribution(
  totalPoints: number,
  numPlayers: number,
  firstPlacePercentage: number = PERCENT_FOR_FIRST_PLACE,
  percentReceivingPoints: number = PERCENT_RECEIVING_POINTS,
  extraPointsPerPerson: number = EXTRA_POINTS_PER_PERSON,
) {
  // Must have enough players to earn any points
  if (numPlayers < MIN_PLAYERS_TO_BE_LEGAL) {
    return {
      points: Array(numPlayers).fill(0),
      adjustedTotalPoints: totalPoints,
    };
  }

  let points: number[] = [];
  let sum = 0;

  // Adjust the total point pool based upon the total number of players
  const adjustedTotalPoints = totalPoints + numPlayers * extraPointsPerPerson;

  // Limit the number of point winners to be based upon the given arg
  const totalWinners = Math.ceil(numPlayers * percentReceivingPoints);

  // Calculate the number of points going to first place. This value sets the starting place
  // for the exponential decaying distribution.
  const firstPlacePoints = adjustedTotalPoints * firstPlacePercentage;

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
        pointsAtIndex = firstPlacePoints / Math.pow(i, alpha);
      }

      points.push(pointsAtIndex);
      sum += pointsAtIndex;
    }

    // Adjust binary search params for next iteration
    if (sum > adjustedTotalPoints) {
      lower = alpha;
    } else {
      upper = alpha;
    }
  }

  // Check to see we actually found an acceptable distribution
  if (sum < adjustedTotalPoints * 0.98 || sum > adjustedTotalPoints * 1.02) {
    throw new Error(
      `Error - invalid distribution. Targeting total of ${adjustedTotalPoints}, but found ${sum}`,
    );
  }

  // we got there!
  return { points, adjustedTotalPoints };
}
