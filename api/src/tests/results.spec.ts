import { g } from "../g";
import { Results } from "../models/results";
import { Seasons } from "../models/season";
import { Tournaments } from "../models/tournament";
import { Users } from "../models/user";
import { result, season, tournament, user } from "./factories.js";
import { applyMigrations, initG, wipeDB } from "./setup";

describe("results", () => {
  beforeAll(async () => {
    await initG();
    await applyMigrations();
  });

  afterAll(async () => {
    await g().mf.dispose();
  });

  beforeEach(async () => {
    await wipeDB();
  });

  test("check empty state", async () => {
    const u = await Users.insert(user({ id: 0 }));
    const rows = await Results.getExpanded({ userId: u.id });
    expect(rows.length).toEqual(0);
  });

  test("check simple sum", async () => {
    const u = await Users.insert(user({ id: 0 }));

    const t0 = await Tournaments.insert(tournament({ id: 0, name: "test" }));
    const t1 = await Tournaments.insert(tournament({ id: 1, name: "test" }));
    const t2 = await Tournaments.insert(tournament({ id: 2, name: "test" }));

    await Results.insert(result({ tournament: t0, user: u, points: 100 }));
    await Results.insert(result({ tournament: t1, user: u, points: 100 }));
    await Results.insert(result({ tournament: t2, user: u, points: 100 }));

    const rows = await Results.getExpanded({ userId: u.id });
    expect(rows.length).toEqual(3);
    for (let i = 0; i < rows.length; i++) {
      expect(rows[i].points_earned).toEqual(100);
      expect(rows[i].tournament_name).toEqual("test");
    }
  });

  test("check season filter", async () => {
    const u = await Users.insert(user({ id: 0 }));
    const s = await Seasons.insert(season({ id: 0 }));

    const t0 = await Tournaments.insert(tournament({ id: 0 }));
    const t1 = await Tournaments.insert(tournament({ id: 1, season: s }));

    await Results.insert(result({ tournament: t0, user: u, points: 100 }));
    await Results.insert(result({ tournament: t1, user: u, points: 100 }));

    const rows = await Results.getExpanded({ userId: u.id, seasonId: s.id });
    expect(rows.length).toEqual(1);
    for (let i = 0; i < rows.length; i++) {
      expect(rows[i].points_earned).toEqual(100);
    }
  });
});
