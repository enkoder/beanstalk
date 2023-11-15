// You can see this code on Github
// https://github.com/enkoder/beanstalk/api/src/lib/ranking.ts
import { TournamentType } from "../models/tournament";

// Percentage of people in the top of the tournament who should receive the target amount, defined below
export const TARGET_TOP_PERCENTAGE = 33.3;
// Target point percentage defines how much of the total points the top percentage of players receives
export const TARGET_POINT_PERCENTAGE_FOR_TOP = 66.6;
// Sets the number of players who will be receiving any points. Defined as a percentage of total players
export const PERCENT_RECEIVING_POINTS = 50.0;

export const TOURNAMENT_POINTS = {
  [TournamentType.Worlds]: 1000,
  [TournamentType.Continental]: 750,
  [TournamentType.Nationals]: 500,
  [TournamentType.Intercontinental]: 200,
};

export function calculateTournamentPointDistribution(
  totalPoints: number,
  numPlayers: number,
  alpha: number,
  percentReceivingPoints: number = PERCENT_RECEIVING_POINTS,
) {
  const points: number[] = [];

  // Adjust the total points based upon the number of players.
  // 8 players => .73
  // 100 players => 1.52
  // 256 players => 1.71
  const adjustedTotalPoints = totalPoints * Math.log(Math.log(numPlayers));

  // Filter numPlayers by percentage given
  const numPlayersGettingPoints = Math.round(
    numPlayers * (percentReceivingPoints / 100),
  );

  // Calculate the proportionality constant to ensure the sum of points equals adjustedPoints
  const proportionalityConstant =
    adjustedTotalPoints /
    Array.from({ length: numPlayersGettingPoints }, (_, i) =>
      Math.pow(1 / (i + 1), alpha),
    ).reduce((a, b) => a + b, 0);

  // Distribute the points according to the power law
  for (let i = 1; i <= numPlayers; i++) {
    if (i <= numPlayersGettingPoints) {
      points.push(proportionalityConstant * Math.pow(1 / i, alpha));
    } else {
      points.push(0);
    }
  }

  return { points, adjustedTotalPoints };
}

export function findAlphaForDesiredDistribution(
  numPlayers: number,
  percentReceivingPoints: number = PERCENT_RECEIVING_POINTS,
  targetTopPercentage: number = TARGET_TOP_PERCENTAGE,
  targetTopPointsPercentage: number = TARGET_POINT_PERCENTAGE_FOR_TOP,
) {
  const totalPoints = 100;
  const lowerBound = 0.1;
  const increment = 0.01;
  const upperBound = 3;
  let alpha = lowerBound; // Initialize alpha as the lower bound

  while (alpha < upperBound) {
    // Calculate the points using the current alpha
    const { points, adjustedTotalPoints } =
      calculateTournamentPointDistribution(
        totalPoints,
        numPlayers,
        alpha,
        percentReceivingPoints,
      );

    // Sort the points in descending order, highest first
    points.sort((a, b) => b - a);

    // calculate cumulative points for top % of players
    const sumTopPoints = points
      .slice(
        0,
        Math.round(
          points.filter((val) => val > 0).length *
            (targetTopPercentage / 100.0),
        ),
      )
      .reduce((a, b) => a + b, 0);

    // Check if we've found a value for alpha where the top % of points hits the target
    if (
      (sumTopPoints / adjustedTotalPoints) * 100 >=
      targetTopPointsPercentage
    ) {
      return alpha;
    }

    // Increment alpha and try again until we get the right value
    alpha += increment;
  }

  return 0;
}
