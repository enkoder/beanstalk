import { TournamentType } from "../schema";
import {
  ADDITIONAL_TOP_CUT_PERCENTAGE,
  BASELINE_POINTS,
  MIN_PLAYERS_TO_BE_LEGAL,
  PERCENT_RECEIVING_POINTS,
  POINTS_PER_PLAYER,
  SWISS_BOTTOM_THRESHOLD,
  calculatePointDistribution,
} from "./ranking.js";

test.each([
  ["circuit opener" as TournamentType],
  ["continental championship" as TournamentType],
  ["national championship" as TournamentType],
  ["worlds championship" as TournamentType],
])("calculate points", (type: TournamentType) => {
  const cutTo = 4;
  const num = MIN_PLAYERS_TO_BE_LEGAL[type];
  const swissPointsForFirst =
    num * POINTS_PER_PLAYER[type] + BASELINE_POINTS[type];
  const cutPointsForFirst =
    (swissPointsForFirst * ADDITIONAL_TOP_CUT_PERCENTAGE[type]) / 100;

  const { points, totalPoints } = calculatePointDistribution(num, type, cutTo);

  expect(points.length).toBe(num);
  expect(points[0]).toBe(swissPointsForFirst + cutPointsForFirst);
  expect(points[points.length - 1]).toBeLessThan(SWISS_BOTTOM_THRESHOLD);

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
  expect(sum.toFixed(4)).toBe(totalPoints.toFixed(4));
});

test("not enough players", () => {
  const cutTo = 8;
  const type = "national championship";
  const num = MIN_PLAYERS_TO_BE_LEGAL[type] - 1;
  const { points, totalPoints } = calculatePointDistribution(num, type, cutTo);

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
])("Monotonically decreasing", (type: TournamentType) => {
  const cutTo = 16;
  const numPlayers = 100;

  const { points, totalPoints } = calculatePointDistribution(
    numPlayers,
    type,
    cutTo,
  );

  let lastValue = points[0];
  for (let i = 1; i < numPlayers; i++) {
    if (points[i] !== 0) {
      expect(points[i]).toBeLessThan(lastValue);
    }
    lastValue = points[i];
  }
});

test.each([
  ["circuit opener" as TournamentType],
  ["continental championship" as TournamentType],
  ["national championship" as TournamentType],
  ["worlds championship" as TournamentType],
])("Monotonically increasing when adding players", (type: TournamentType) => {
  const cutTo = 8;
  const numPlayers: number[] = Array.from(Array(100).keys()).slice(16);

  let lastValue = 0;
  for (let i = 0; i < numPlayers.length; i++) {
    const { points, totalPoints } = calculatePointDistribution(
      numPlayers[i],
      type,
      cutTo,
    );

    if (lastValue) {
      expect(points[5]).toBeGreaterThan(lastValue);
    }
    lastValue = points[5];
  }
});
