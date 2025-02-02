import { TournamentType } from "../schema";
import { DEFAULT_CONFIG, calculatePointDistribution } from "./ranking.js";

test.each([
  ["circuit opener" as TournamentType],
  ["continental championship" as TournamentType],
  ["national championship" as TournamentType],
  ["worlds championship" as TournamentType],
])("calculate points with default config", (type: TournamentType) => {
  const num = DEFAULT_CONFIG.MIN_PLAYERS_TO_BE_LEGAL[type];
  const pointsForFirst =
    num * DEFAULT_CONFIG.POINTS_PER_PLAYER[type] +
    DEFAULT_CONFIG.BASELINE_POINTS[type];

  const { points, totalPoints } = calculatePointDistribution(num, type);

  // Check first placement
  expect(points.length).toBe(num);
  expect(points[0]).toBe(pointsForFirst);
  // Rounding here to bypass floating point errors
  expect(Math.round(points[points.length - 1])).toBeLessThanOrEqual(
    DEFAULT_CONFIG.BOTTOM_THRESHOLD[type],
  );

  let sum = 0;
  for (let i = 0; i < num; i++) {
    sum += points[i];
  }

  // Check to make sure the selected alpha hits ~100% of the intended total points
  expect(sum.toFixed(4)).toBe(totalPoints.toFixed(4));
});

test("season 1 config", () => {
  const type = "worlds championship" as TournamentType;
  const num = DEFAULT_CONFIG.MIN_PLAYERS_TO_BE_LEGAL[type];
  const pointsForFirst =
    num * DEFAULT_CONFIG.POINTS_PER_PLAYER[type] +
    DEFAULT_CONFIG.BASELINE_POINTS[type];

  const { points } = calculatePointDistribution(num, type, undefined, 1);

  expect(points[0]).toBe(pointsForFirst);
  expect(points[0]).toBe(
    num * DEFAULT_CONFIG.POINTS_PER_PLAYER[type] +
      DEFAULT_CONFIG.BASELINE_POINTS[type],
  );
});

test("not enough players", () => {
  const type = TournamentType.NATIONAL_CHAMPIONSHIP;
  const num = DEFAULT_CONFIG.MIN_PLAYERS_TO_BE_LEGAL[type] - 1;
  const { points, totalPoints } = calculatePointDistribution(num, type);

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
  const numPlayers = 100;

  const { points } = calculatePointDistribution(numPlayers, type);

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
  const numPlayers: number[] = Array.from(Array(100).keys()).slice(16);

  let lastValue = 0;
  for (let i = 0; i < numPlayers.length; i++) {
    const { points } = calculatePointDistribution(numPlayers[i], type);

    if (lastValue) {
      expect(points[5]).toBeGreaterThan(lastValue);
    }
    lastValue = points[5];
  }
});

test("Interconts", () => {
  const overridePoints = 1000;
  const numPlayers = 12;

  const { points } = calculatePointDistribution(
    numPlayers,
    "intercontinental championship" as TournamentType,
    overridePoints,
  );

  expect(points[0]).toBe(overridePoints);
});
