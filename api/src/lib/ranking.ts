import { TournamentType } from "../models/tournament";

export const TARGET_TOP_PERCENTAGE = 20.0;
export const TARGET_POINT_PERCENTAGE_FOR_TOP = 80.0;

export function calculateTournamentPointDistribution(
  totalPoints: number,
  numPlayers: number,
  alpha: number,
) {
  const payouts: number[] = [];

  // Calculate the proportionality constant to ensure the sum of payouts equals totalPoints.
  const proportionalityConstant =
    totalPoints /
    Array.from({ length: numPlayers }, (_, i) =>
      Math.pow(1 / (i + 1), alpha),
    ).reduce((a, b) => a + b, 0);

  // Distribute the points according to the power law.
  for (let i = 1; i <= numPlayers; i++) {
    payouts.push(proportionalityConstant * Math.pow(1 / i, alpha));
  }

  return payouts;
}

export function findAlphaForDesiredDistribution(
  numPlayers: number,
  targetTopPercentage: number,
  targetTopPointsPercentage: number,
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

export function getSeason0Points(
  type: TournamentType,
  numberPlayers: number,
  rankSwiss: number,
  rankCut: number | null,
) {
  let points = 0;
  // For now don't do anything with cut vs swiss
  const placement = rankCut !== null ? rankCut : rankSwiss;
  switch (type) {
    case TournamentType.Nationals: {
      if (placement <= 8) {
        points = 10;
      } else if (placement <= 16) {
        points = 5;
      }
      break;
    }
    case TournamentType.Continental: {
      if (placement <= 8) {
        points = 20;
      } else if (placement <= 16) {
        points = 10;
      }
      break;
    }
    case TournamentType.Intercontinental: {
      if (placement == 1) {
        points = 30;
      }
      if (placement == 2) {
        points = 15;
      }
      break;
    }
    case TournamentType.Worlds: {
      if (placement <= 8) {
        points = 50;
      } else if (placement <= 16) {
        points = 20;
      }
      break;
    }
  }
  return points;
}
//export const POINTS_BY_SEASON = [season0Points];
