import { TournamentType } from "../schema";
import {
  BASELINE_POINTS,
  BOTTOM_THRESHOLD,
  MIN_PLAYERS_TO_BE_LEGAL,
  PERCENT_RECEIVING_POINTS,
  POINTS_PER_PLAYER,
  calculateTournamentPointDistribution,
} from "./ranking.js";

test.each([
  ["circuit opener" as TournamentType],
  ["continental championship" as TournamentType],
  ["national championship" as TournamentType],
  ["worlds championship" as TournamentType],
])("calculate points", (type: TournamentType) => {
  const num = MIN_PLAYERS_TO_BE_LEGAL[type];
  const pointsForFirst = num * POINTS_PER_PLAYER[type] + BASELINE_POINTS[type];

  const { points, totalPoints } = calculateTournamentPointDistribution(
    num,
    type,
  );

  expect(points.length).toBe(num);
  expect(points[0]).toBe(pointsForFirst);
  expect(points[points.length - 1]).toBeLessThan(BOTTOM_THRESHOLD);

  let sum = 0;
  for (
    let i = Math.ceil((num * PERCENT_RECEIVING_POINTS[type]) / 100);
    i < points.length;
    i++
  ) {
    sum += points[i];
  }
  expect(sum).toBe(0);

  sum = 0;
  for (
    let i = 0;
    i < Math.ceil((num * PERCENT_RECEIVING_POINTS[type]) / 100);
    i++
  ) {
    sum += points[i];
  }

  // Check to make sure the selected alpha hits ~100% of the intended total points
  expect(sum).toBe(totalPoints);
});

test("not enough players", () => {
  const type = "national championship";
  const num = MIN_PLAYERS_TO_BE_LEGAL[type] - 1;
  const { points, totalPoints } = calculateTournamentPointDistribution(
    num,
    type,
  );

  expect(points.length).toBe(num);
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    sum += points[i];
  }
  expect(sum).toBe(0);
  expect(totalPoints).toBe(0);
});

test.each([
  ["circuit opener" as TournamentType],
  ["continental championship" as TournamentType],
  ["national championship" as TournamentType],
  ["worlds championship" as TournamentType],
])("Monotonically increasing point", (type: TournamentType) => {
  const numPlayers: number[] = Array.from(Array(100).keys()).slice(16);

  let lastValue = 0;
  for (let i = 0; i < numPlayers.length; i++) {
    const { points, totalPoints } = calculateTournamentPointDistribution(
      numPlayers[i],
      type,
    );

    if (lastValue) {
      expect(points[5]).toBeGreaterThan(lastValue);
    }
    lastValue = points[5];
  }
});
