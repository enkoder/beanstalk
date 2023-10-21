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
      if (numberPlayers > 16 && placement <= 8) {
        points = 10 + 8 - placement + 1;
      } else if (numberPlayers > 16 && placement <= 16) {
        points = 5;
      }
      break;
    }
  }
  return points;
}
//export const POINTS_BY_SEASON = [season0Points];
