// You can see this code on Github
// https://github.com/enkoder/beanstalk/api/src/lib/ranking.ts
import { TournamentType } from "../models/tournament";

// Sets the number of players who will be receiving any points. Defined as a percentage of total players
export const PERCENT_RECEIVING_POINTS = 50.0;
export const PERCENT_FOR_FIRST_PLACE = 15.0;
export const EXTRA_POINTS_PER_PERSON = 10;
export const MIN_PLAYERS_TO_BE_LEGAL = 8;

export const TOURNAMENT_POINTS = {
  [TournamentType.Worlds]: 5000,
  [TournamentType.Continental]: 2000,
  [TournamentType.Nationals]: 1000,
  [TournamentType.Intercontinental]: 1000,
};

export function calculateTournamentPointDistribution(
  totalPoints: number,
  numPlayers: number,
  firstPlacePercentage: number = PERCENT_FOR_FIRST_PLACE,
  percentReceivingPoints: number = PERCENT_RECEIVING_POINTS,
  extraPointsPerPerson: number = EXTRA_POINTS_PER_PERSON,
  minimumPrize: number = 0,
) {
  let points = [];

  // Must have enough players to earn points
  if (numPlayers < MIN_PLAYERS_TO_BE_LEGAL) {
    points = Array(numPlayers).fill(0);
    return { points, adjustedTotalPoints: totalPoints };
  }

  const adjustedTotalPoints = totalPoints + numPlayers * extraPointsPerPerson;
  const firstPlacePoints = (adjustedTotalPoints * firstPlacePercentage) / 100;
  const totalWinners = Math.ceil(numPlayers * (percentReceivingPoints / 100));

  const sumPowerLaw = (alpha: number) => {
    let sum = 0;
    for (let i = 1; i <= totalWinners; i++) {
      sum += firstPlacePoints / Math.pow(i, alpha);
    }
    return sum;
  };

  const getAlpha = () => {
    let lower = 0;
    let upper = 3;
    const threshold = 0.01;
    const target = adjustedTotalPoints - totalWinners * minimumPrize;

    while (upper - lower > threshold) {
      const mid = (upper + lower) / 2;
      if (sumPowerLaw(mid) > target) {
        lower = mid;
      } else {
        upper = mid;
      }
    }

    return (upper + lower) / 2;
  };

  const distributePayouts = (alpha: number) => {
    const payouts = [];
    for (let i = 1; i <= totalWinners; i++) {
      const prize =
        minimumPrize + (firstPlacePoints - minimumPrize) / Math.pow(i, alpha);
      payouts.push(prize);
    }
    return payouts;
  };

  const winners = distributePayouts(getAlpha());
  for (let i = 0; i < numPlayers; i++) {
    points.push(i < winners.length ? winners[i] : 0);
  }
  return { points, adjustedTotalPoints };
}
