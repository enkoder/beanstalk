import { g } from "../g";
import { Results } from "../models/results";
import { Seasons } from "../models/season";
import { Tournaments } from "../models/tournament";
import { Users } from "../models/user";
import type { ResultComponentType, TournamentComponentType } from "../openapi";
import * as Factories from "./factories";
import { applyMigrations, initG, wipeDB } from "./setup";

describe("tournaments", () => {
  beforeAll(async () => {
    await initG(0);
    await applyMigrations();
  });

  afterAll(async () => {
    await g().mf.dispose();
  });

  beforeEach(async () => {
    await wipeDB();
  });

  test("Get tournament 4xx", async () => {
    const s0 = await Seasons.insert(Factories.season({ id: 0 }));

    const response = await g().mf.dispatchFetch(
      Factories.urlTournament({ id: 100 }),
    );

    expect(response.status).toBe(400);
  });

  test("Get tournament", async () => {
    const s0 = await Seasons.insert(Factories.season({ id: 0 }));
    const t = await Tournaments.insert(
      Factories.tournament({ id: 0, name: "name", season: s0 }),
    );

    const response = await g().mf.dispatchFetch(
      Factories.urlTournament({ id: t.id }),
    );

    expect(response.status).toBe(200);
    const data = (await response.json()) as TournamentComponentType;
    expect(data.id).toBe(t.id);
    expect(data.name).toBe(t.name);
  });

  test("Get tournaments", async () => {
    const s0 = await Seasons.insert(Factories.season({ id: 0 }));
    const t0 = await Tournaments.insert(
      Factories.tournament({ id: 0, name: "name0", season: s0 }),
    );
    const t1 = await Tournaments.insert(
      Factories.tournament({ id: 1, name: "name1", season: s0 }),
    );

    const response = await g().mf.dispatchFetch(Factories.urlTournaments());

    expect(response.status).toBe(200);
    const data = (await response.json()) as TournamentComponentType[];
    expect(data[0].id).toBe(t0.id);
    expect(data[1].id).toBe(t1.id);
  });

  test("Get tournament results", async () => {
    const s0 = await Seasons.insert(Factories.season({ id: 0 }));
    const t0 = await Tournaments.insert(
      Factories.tournament({ id: 0, name: "name0", season: s0 }),
    );

    // Note the disabled and enabled users
    const u0 = await Users.insert(Factories.user({ id: 10, disabled: 0 }));
    const u1 = await Users.insert(Factories.user({ id: 11, disabled: 1 }));

    await Results.insert(
      Factories.result({
        tournament: t0,
        user: u0,
        points: 100,
        rank_swiss: 1,
        rank_cut: 1,
      }),
    );
    await Results.insert(
      Factories.result({
        tournament: t0,
        user: u1,
        points: 50,
        rank_swiss: 2,
        rank_cut: 2,
      }),
    );

    const response = await g().mf.dispatchFetch(
      Factories.urlTournamentResults({ id: t0.id }),
    );

    expect(response.status).toBe(200);
    const data = (await response.json()) as ResultComponentType[];
    console.log(JSON.stringify(data, null, 2));
    expect(data[0].user_id).toBe(u0.id);
    expect(data[0].user_name).toBe(u0.name);
    expect(data[0].points_earned).toBe(100);
    expect(data[0].rank_cut).toBe(1);
    expect(data[0].rank_swiss).toBe(1);

    // Disabled user
    expect(data[1].user_id).toBe(0);
    expect(data[1].user_name).toBe(null);
    expect(data[1].points_earned).toBe(50);
    expect(data[1].rank_cut).toBe(2);
    expect(data[1].rank_swiss).toBe(2);
  });
});
