import { TournamentType } from "../models/tournament";

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
