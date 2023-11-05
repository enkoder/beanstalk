import { TournamentType } from "../models/tournament";

export const TARGET_TOP_PERCENTAGE = 20.0;
export const TARGET_POINT_PERCENTAGE_FOR_TOP = 80.0;
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
  const payouts: number[] = [];

  const numPlayersGettingPoints = Math.round(
    numPlayers * (percentReceivingPoints / 100),
  );
  // Calculate the proportionality constant to ensure the sum of payouts equals totalPoints.
  const proportionalityConstant =
    totalPoints /
    Array.from({ length: numPlayersGettingPoints }, (_, i) =>
      Math.pow(1 / (i + 1), alpha),
    ).reduce((a, b) => a + b, 0);

  // Distribute the points according to the power law.
  for (let i = 1; i <= numPlayers; i++) {
    if (i <= numPlayersGettingPoints) {
      payouts.push(proportionalityConstant * Math.pow(1 / i, alpha));
    } else {
      payouts.push(0);
    }
  }

  return payouts;
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
    // Calculate the payouts using the current alpha
    const payouts = calculateTournamentPointDistribution(
      totalPoints,
      numPlayers,
      alpha,
      percentReceivingPoints,
    );

    // Sort the payouts in descending order, highest first
    payouts.sort((a, b) => b - a);

    // calculate cumulative points for top % of players
    const sumTopPoints = payouts
      .slice(0, Math.round(payouts.length * (targetTopPercentage / 100.0)))
      .reduce((a, b) => a + b, 0);

    //console.log(sumTopPoints);

    // Check if we've found a value for alpha where the top % of points hits the target
    if ((sumTopPoints / totalPoints) * 100 >= targetTopPointsPercentage) {
      return alpha;
    }

    // Increment alpha and try again until we get the right value
    alpha += increment;
  }

  return 0;
}
