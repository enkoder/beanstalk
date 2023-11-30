import { calculateTournamentPointDistribution } from "./ranking";

test("calculate points", () => {
  const total = 100;
  const num = 10;
  const { points, adjustedTotalPoints } = calculateTournamentPointDistribution(
    total,
    num,
    0.2,
    0.5,
    20,
  );

  expect(points[0]).toBe(adjustedTotalPoints * 0.2);
  expect(adjustedTotalPoints).toBe(total + num * 20);

  let sum = 0;
  for (let i = num / 2; i < points.length; i++) {
    sum += points[i];
  }
  expect(sum).toBe(0);

  sum = 0;
  for (let i = 0; i < points.length / 2; i++) {
    sum += points[i];
  }
  expect(
    sum > adjustedTotalPoints * 0.98 && sum < adjustedTotalPoints * 1.02,
  ).toBe(true);
});

test("not enough players", () => {
  const total = 100;
  const num = 8;
  const { points, adjustedTotalPoints } = calculateTournamentPointDistribution(
    total,
    num,
    0.2,
    0.5,
    20,
  );

  let sum = 0;
  for (let i = num / 2; i < points.length; i++) {
    sum += points[i];
  }
  expect(sum).toBe(0);
  expect(adjustedTotalPoints).toBe(total);
});
