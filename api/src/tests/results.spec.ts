import { getMF, initMf, wipeDB } from "./setup.js";
import {
  resultFactory,
  seasonFactory,
  tournamentFactory,
  userFactory,
} from "./factories.js";
import { Results } from "../models/results.js";
import { Users } from "../models/user.js";
import { Tournaments } from "../models/tournament.js";
import { Seasons } from "../models/season.js";

describe("results", () => {
  beforeAll(async () => {
    await initMf();
  });

  afterAll(async () => {
    await getMF().dispose();
  });

  beforeEach(async () => {
    await wipeDB();
  });

  test("check empty state", async () => {
    const u = await Users.insert(userFactory({ id: 0 }));
    const rows = await Results.getExpanded({ userId: u.id });
    expect(rows.length).toEqual(0);
  });

  test("check simple sum", async () => {
    const u = await Users.insert(userFactory({ id: 0 }));

    const t0 = await Tournaments.insert(
      tournamentFactory({ id: 0, name: "test" }),
    );
    const t1 = await Tournaments.insert(
      tournamentFactory({ id: 1, name: "test" }),
    );
    const t2 = await Tournaments.insert(
      tournamentFactory({ id: 2, name: "test" }),
    );

    await Results.insert(
      resultFactory({ tournament: t0, user: u, points: 100 }),
    );
    await Results.insert(
      resultFactory({ tournament: t1, user: u, points: 100 }),
    );
    await Results.insert(
      resultFactory({ tournament: t2, user: u, points: 100 }),
    );

    const rows = await Results.getExpanded({ userId: u.id });
    expect(rows.length).toEqual(3);
    for (let i = 0; i < rows.length; i++) {
      expect(rows[i].points_earned).toEqual(100);
      expect(rows[i].tournament_name).toEqual("test");
    }
  });

  test("check season filter", async () => {
    const u = await Users.insert(userFactory({ id: 0 }));
    const s = await Seasons.insert(seasonFactory({ id: 0 }));

    const t0 = await Tournaments.insert(tournamentFactory({ id: 0 }));
    const t1 = await Tournaments.insert(
      tournamentFactory({ id: 1, season: s }),
    );

    await Results.insert(
      resultFactory({ tournament: t0, user: u, points: 100 }),
    );
    await Results.insert(
      resultFactory({ tournament: t1, user: u, points: 100 }),
    );

    const rows = await Results.getExpanded({ userId: u.id, seasonId: s.id });
    expect(rows.length).toEqual(1);
    for (let i = 0; i < rows.length; i++) {
      expect(rows[i].points_earned).toEqual(100);
    }
  });
});
