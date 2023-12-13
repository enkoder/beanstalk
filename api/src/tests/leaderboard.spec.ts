import { getMF, initMf, wipeDB } from "./setup";
import {
  resultFactory,
  seasonFactory,
  tournamentFactory,
  userFactory,
} from "./factories";
import { Results } from "../models/results";
import { Leaderboards } from "../models/leaderboard";
import { Users } from "../models/user";
import { Tournaments, TournamentType } from "../models/tournament";
import { Seasons } from "../models/season";
import { Factions } from "../models/factions";

describe("leaderboard", () => {
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
    const rows = await Leaderboards.getExpanded({});
    expect(rows.length).toEqual(0);
  });

  test("check points total", async () => {
    const u = await Users.insert(userFactory({ id: 0 }));
    const t = await Tournaments.insert(tournamentFactory({ id: 0 }));
    await Results.insert(
      resultFactory({ tournament: t, user: u, points: 100 }),
    );
    const rows = await Leaderboards.getExpanded({});
    expect(rows[0].points).toEqual(100);
  });

  test("check simple ranking", async () => {
    const u0 = await Users.insert(userFactory({ id: 0 }));
    const u1 = await Users.insert(userFactory({ id: 1 }));
    const t = await Tournaments.insert(tournamentFactory({ id: 0 }));
    await Results.insert(
      resultFactory({ tournament: t, user: u0, points: 100 }),
    );
    await Results.insert(
      resultFactory({ tournament: t, user: u1, points: 100 }),
    );
    const rows = await Leaderboards.getExpanded({});
    expect(rows[0].rank).toEqual(1);
    expect(rows[0].user_id).toEqual(u0.id);

    expect(rows[1].rank).toEqual(2);
    expect(rows[1].user_id).toEqual(u1.id);
  });

  test("check attended tiebreaker", async () => {
    const u0 = await Users.insert(userFactory({ id: 0 }));
    const u1 = await Users.insert(userFactory({ id: 1 }));

    const t0 = await Tournaments.insert(tournamentFactory({ id: 0 }));
    const t1 = await Tournaments.insert(tournamentFactory({ id: 1 }));
    const t2 = await Tournaments.insert(tournamentFactory({ id: 2 }));

    await Results.insert(
      resultFactory({ tournament: t0, user: u0, points: 100 }),
    );
    await Results.insert(
      resultFactory({ tournament: t1, user: u1, points: 100 }),
    );
    await Results.insert(
      resultFactory({ tournament: t2, user: u1, points: 50 }),
    );
    const rows = await Leaderboards.getExpanded({});

    expect(rows[0].rank).toEqual(1);
    expect(rows[0].user_id).toEqual(u1.id);
    expect(rows[0].points).toEqual(150);
    expect(rows[0].attended).toEqual(2);

    expect(rows[1].rank).toEqual(2);
    expect(rows[1].user_id).toEqual(u0.id);
    expect(rows[1].attended).toEqual(1);
  });

  test("check season filter", async () => {
    const s0 = await Seasons.insert(seasonFactory({ id: 0 }));

    const u0 = await Users.insert(userFactory({ id: 0 }));
    const u1 = await Users.insert(userFactory({ id: 1 }));

    const t0 = await Tournaments.insert(
      tournamentFactory({ id: 0, season: s0 }),
    );

    const t1 = await Tournaments.insert(tournamentFactory({ id: 1 }));

    await Results.insert(
      resultFactory({ tournament: t0, user: u0, points: 100 }),
    );
    await Results.insert(
      resultFactory({ tournament: t1, user: u1, points: 50 }),
    );

    const rows = await Leaderboards.getExpanded({ seasonId: s0.id });
    expect(rows.length).toEqual(1);
    expect(rows[0].user_id).toEqual(u0.id);
    expect(rows[0].points).toEqual(100);
  });

  test("check faction filter", async () => {
    const u0 = await Users.insert(userFactory({ id: 0 }));
    const u1 = await Users.insert(userFactory({ id: 1 }));

    const t0 = await Tournaments.insert(tournamentFactory({ id: 0 }));
    const t1 = await Tournaments.insert(tournamentFactory({ id: 1 }));

    await Results.insert(
      resultFactory({
        tournament: t0,
        user: u0,
        points: 100,
        corpFaction: Factions.HaasBioroid,
      }),
    );
    await Results.insert(
      resultFactory({
        tournament: t1,
        user: u1,
        points: 100,
        corpFaction: Factions.Jinteki,
      }),
    );

    const rows = await Leaderboards.getExpanded({
      faction: Factions.HaasBioroid,
    });
    expect(rows.length).toEqual(1);
    expect(rows[0].user_id).toEqual(u0.id);
  });

  test("check format filter", async () => {
    const u0 = await Users.insert(userFactory({ id: 0 }));
    const u1 = await Users.insert(userFactory({ id: 1 }));

    const t0 = await Tournaments.insert(
      tournamentFactory({ id: 0, format: "startup" }),
    );
    const t1 = await Tournaments.insert(
      tournamentFactory({ id: 1, format: "standard" }),
    );

    await Results.insert(
      resultFactory({
        tournament: t0,
        user: u0,
        points: 100,
      }),
    );
    await Results.insert(
      resultFactory({
        tournament: t1,
        user: u1,
        points: 100,
      }),
    );

    const rows = await Leaderboards.getExpanded({
      format: "startup",
    });
    expect(rows.length).toEqual(1);
    expect(rows[0].user_id).toEqual(u0.id);
  });

  test("check tournament max limit", async () => {
    const s0 = await Seasons.insert(seasonFactory({ id: 0 }));
    const u0 = await Users.insert(userFactory({ id: 0 }));

    // Can only get points for 1 continental tournament
    const t0 = await Tournaments.insert(
      tournamentFactory({
        id: 0,
        season: s0,
        type: TournamentType.Continental,
      }),
    );
    const t1 = await Tournaments.insert(
      tournamentFactory({
        id: 1,
        season: s0,
        type: TournamentType.Continental,
      }),
    );

    await Results.insert(
      resultFactory({
        tournament: t0,
        user: u0,
        points: 100,
      }),
    );
    await Results.insert(
      resultFactory({
        tournament: t1,
        user: u0,
        points: 100,
      }),
    );

    // First check that across all-time, no season filter, we use all results
    let rows = await Leaderboards.getExpanded({});
    expect(rows.length).toEqual(1);
    expect(rows[0].user_id).toEqual(u0.id);
    expect(rows[0].points).toEqual(200);

    // Now check that we only use the single continental tournament
    rows = await Leaderboards.getExpanded({ seasonId: s0.id });
    expect(rows.length).toEqual(1);
    expect(rows[0].user_id).toEqual(u0.id);
    expect(rows[0].points).toEqual(100);
  });
});
