import { TournamentType } from "../schema";
import {
  MIN_PLAYERS_TO_BE_LEGAL,
  PERCENT_FOR_FIRST_PLACE,
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
  const intendedTotal = POINTS_PER_PLAYER[type] * num;
  const { points, totalPoints } = calculateTournamentPointDistribution(
    num,
    type,
  );

  expect(points.length).toBe(num);
  expect(points[0]).toBe((intendedTotal * PERCENT_FOR_FIRST_PLACE[type]) / 100);
  expect(totalPoints).toBe(intendedTotal);

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
  expect(sum).toBeGreaterThan(intendedTotal * 0.98);
  expect(sum).toBeLessThan(intendedTotal * 1.02);
});

test("not enough players", () => {
  const type = "national championship";
  const num = MIN_PLAYERS_TO_BE_LEGAL[type] - 1;
  const { points, totalPoints } = calculateTournamentPointDistribution(
    num,
    "worlds championship",
  );

  expect(points.length).toBe(num);
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    sum += points[i];
  }
  expect(sum).toBe(0);
  expect(totalPoints).toBe(0);
});

test("Intercontinentals", () => {
  const type: TournamentType = "intercontinental championship";
  const num = MIN_PLAYERS_TO_BE_LEGAL[type];
  const intendedTotal = POINTS_PER_PLAYER[type] * num;
  const { points, totalPoints } = calculateTournamentPointDistribution(
    num,
    type,
  );

  expect(points.length).toBe(num);
  let sum = 0;
  for (let i = 0; i < points.length; i++) {
    sum += points[i];
  }
  expect(sum).toBe(intendedTotal);
  expect(totalPoints).toBe(intendedTotal);
  expect(points[0]).toBe(intendedTotal);
});

test.each([
  ["circuit opener" as TournamentType, 1],
  ["continental championship" as TournamentType, 2],
  ["national championship" as TournamentType, 2],
  ["worlds championship" as TournamentType, 1],
])("Monotonically increasing point values", (type: TournamentType, offset) => {
  const numPlayers: number[] = Array.from(Array(100).keys()).slice(
    MIN_PLAYERS_TO_BE_LEGAL[type],
  );

  /** Let's check one of the lowest placements to ensure that the point values are always increasing as you add people
   * At the lowest values, there's a chance that as you add one more person, the point value can decrease
   * Need to set an offset here to make sure the placement is high enough so if you add +1 person it still increases
   * the point value
   */
  const checkingPlacement = MIN_PLAYERS_TO_BE_LEGAL[type] - offset;
  let lastValue = 0;
  for (let i = 0; i < numPlayers.length; i++) {
    const { points, totalPoints } = calculateTournamentPointDistribution(
      numPlayers[i],
      type,
    );

    expect(points[checkingPlacement]).toBeGreaterThan(lastValue);
    lastValue = points[checkingPlacement];
  }
});
