import { g } from "../g";
import { Factions } from "../models/factions.js";
import { Leaderboard } from "../models/leaderboard";
import { Results } from "../models/results.js";
import { Seasons } from "../models/season.js";
import { Tags } from "../models/tags";
import { Tournaments } from "../models/tournament.js";
import { Users } from "../models/user.js";
import {
  LeaderboardRowComponent,
  LeaderboardRowComponentType,
} from "../openapi.js";
import * as Factories from "./factories.js";
import { applyMigrations, initG, wipeDB } from "./setup";

describe("leaderboard", () => {
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
    const rows = await Leaderboard.getExpanded({});
    expect(rows.length).toEqual(0);
  });

  test("check points total", async () => {
    const u = await Users.insert(Factories.user({ id: 0 }));
    const t = await Tournaments.insert(Factories.tournament({ id: 0 }));
    await Results.insert(
      Factories.result({ tournament: t, user: u, points: 100 }),
    );

    const response = await g().mf.dispatchFetch(Factories.urlLeaderboard({}));
    const rows = (await response.json()) as LeaderboardRowComponentType[];

    expect(rows.length).toEqual(1);
    expect(LeaderboardRowComponent.parse(rows[0]).points).toEqual(100);
  });

  test("check simple ranking", async () => {
    const u0 = await Users.insert(Factories.user({ id: 0 }));
    const u1 = await Users.insert(Factories.user({ id: 1 }));
    const t = await Tournaments.insert(Factories.tournament({ id: 0 }));
    await Results.insert(
      Factories.result({ tournament: t, user: u0, points: 100 }),
    );

    await Results.insert(
      Factories.result({ tournament: t, user: u1, points: 100 }),
    );

    const response = await g().mf.dispatchFetch(Factories.urlLeaderboard({}));
    const rows = (await response.json()) as LeaderboardRowComponentType[];

    expect(rows[0].rank).toEqual(1);
    expect(rows[0].user_id).toEqual(u0.id);

    expect(rows[1].rank).toEqual(2);
    expect(rows[1].user_id).toEqual(u1.id);
  });

  test("check attended tiebreaker", async () => {
    const u0 = await Users.insert(Factories.user({ id: 0 }));
    const u1 = await Users.insert(Factories.user({ id: 1 }));

    const t0 = await Tournaments.insert(Factories.tournament({ id: 0 }));
    const t1 = await Tournaments.insert(Factories.tournament({ id: 1 }));
    const t2 = await Tournaments.insert(Factories.tournament({ id: 2 }));

    await Results.insert(
      Factories.result({ tournament: t0, user: u0, points: 100 }),
    );
    await Results.insert(
      Factories.result({ tournament: t1, user: u1, points: 100 }),
    );
    await Results.insert(
      Factories.result({ tournament: t2, user: u1, points: 0 }),
    );

    const response = await g().mf.dispatchFetch(Factories.urlLeaderboard({}));
    const rows = (await response.json()) as LeaderboardRowComponentType[];

    expect(rows[0].rank).toEqual(1);
    expect(rows[0].user_id).toEqual(u1.id);
    expect(rows[0].points).toEqual(100);
    expect(rows[0].attended).toEqual(2);

    expect(rows[1].rank).toEqual(2);
    expect(rows[1].user_id).toEqual(u0.id);
    expect(rows[1].attended).toEqual(1);
  });

  test("check season filter", async () => {
    const s0 = await Seasons.insert(Factories.season({ id: 0 }));

    const u0 = await Users.insert(Factories.user({ id: 0 }));
    const u1 = await Users.insert(Factories.user({ id: 1 }));

    const t0 = await Tournaments.insert(
      Factories.tournament({ id: 0, season: s0 }),
    );

    const t1 = await Tournaments.insert(Factories.tournament({ id: 1 }));

    await Results.insert(
      Factories.result({ tournament: t0, user: u0, points: 100 }),
    );
    await Results.insert(
      Factories.result({ tournament: t1, user: u1, points: 50 }),
    );

    const response = await g().mf.dispatchFetch(
      Factories.urlLeaderboard({ season: s0 }),
    );
    const rows = (await response.json()) as LeaderboardRowComponentType[];

    expect(rows.length).toEqual(1);
    expect(rows[0].user_id).toEqual(u0.id);
    expect(rows[0].points).toEqual(100);
  });

  test("check faction filter", async () => {
    const u0 = await Users.insert(Factories.user({ id: 0 }));
    const u1 = await Users.insert(Factories.user({ id: 1 }));

    const t0 = await Tournaments.insert(Factories.tournament({ id: 0 }));
    const t1 = await Tournaments.insert(Factories.tournament({ id: 1 }));

    await Results.insert(
      Factories.result({
        tournament: t0,
        user: u0,
        points: 100,
        corpFaction: Factions.HaasBioroid,
      }),
    );
    await Results.insert(
      Factories.result({
        tournament: t1,
        user: u1,
        points: 100,
        corpFaction: Factions.Jinteki,
      }),
    );

    const response = await g().mf.dispatchFetch(
      Factories.urlLeaderboard({
        faction: Factions.HaasBioroid,
      }),
    );
    const rows = (await response.json()) as LeaderboardRowComponentType[];

    expect(rows.length).toEqual(1);
    expect(rows[0].user_id).toEqual(u0.id);
  });

  test("check format filter", async () => {
    const u0 = await Users.insert(Factories.user({ id: 0 }));
    const u1 = await Users.insert(Factories.user({ id: 1 }));

    const t0 = await Tournaments.insert(
      Factories.tournament({ id: 0, format: "startup" }),
    );
    const t1 = await Tournaments.insert(
      Factories.tournament({ id: 1, format: "standard" }),
    );

    await Results.insert(
      Factories.result({
        tournament: t0,
        user: u0,
        points: 100,
      }),
    );
    await Results.insert(
      Factories.result({
        tournament: t1,
        user: u1,
        points: 100,
      }),
    );

    const rows = await Leaderboard.getExpanded({
      format: "startup",
    });
    expect(rows.length).toEqual(1);
    expect(rows[0].user_id).toEqual(u0.id);
  });

  test("check tournament max limit", async () => {
    const s0 = await Seasons.insert(Factories.season({ id: 0 }));
    const u0 = await Users.insert(Factories.user({ id: 0 }));

    // Can only get points for 1 continental tournament
    const t0 = await Tournaments.insert(
      Factories.tournament({
        id: 0,
        season: s0,
        type: "intercontinental championship",
      }),
    );
    const t1 = await Tournaments.insert(
      Factories.tournament({
        id: 1,
        season: s0,
        type: "intercontinental championship",
      }),
    );

    await Results.insert(
      Factories.result({
        tournament: t0,
        user: u0,
        points: 100,
      }),
    );
    await Results.insert(
      Factories.result({
        tournament: t1,
        user: u0,
        points: 100,
      }),
    );

    // First check that across all-time, no season filter, we use all results
    let response = await g().mf.dispatchFetch(Factories.urlLeaderboard({}));
    let rows = (await response.json()) as LeaderboardRowComponentType[];
    expect(rows.length).toEqual(1);
    expect(rows[0].user_id).toEqual(u0.id);
    expect(rows[0].points).toEqual(200);

    // Now check that we only use the single continental tournament
    response = await g().mf.dispatchFetch(
      Factories.urlLeaderboard({ season: s0 }),
    );
    rows = (await response.json()) as LeaderboardRowComponentType[];
    expect(rows.length).toEqual(1);
    expect(rows[0].user_id).toEqual(u0.id);
    expect(rows[0].points).toEqual(100);
  });

  test("check tags filter", async () => {
    const u0 = await Users.insert(Factories.user({ id: 0 }));
    const u1 = await Users.insert(Factories.user({ id: 1 }));

    const t0 = await Tournaments.insert(Factories.tournament({ id: 0 }));
    const t1 = await Tournaments.insert(Factories.tournament({ id: 1 }));
    const t2 = await Tournaments.insert(Factories.tournament({ id: 2 }));

    const tag = await Tags.insert(Factories.tag({ name: "tag", user: u0 }));

    const tt0 = await Tags.insertTagTournament(
      Factories.tournament_tag({ tournament: t0, tag: tag }),
    );
    const tt2 = await Tags.insertTagTournament(
      Factories.tournament_tag({ tournament: t2, tag: tag }),
    );

    await Results.insert(
      Factories.result({
        tournament: t0,
        user: u0,
        points: 100,
      }),
    );
    await Results.insert(
      Factories.result({
        tournament: t1,
        user: u0,
        points: 100,
      }),
    );
    await Results.insert(
      Factories.result({
        tournament: t2,
        user: u1,
        points: 100,
      }),
    );

    const rows = await Leaderboard.getExpanded({
      tags: ["tag"],
    });

    expect(rows.length).toEqual(2);
    expect(rows[0].user_id).toEqual(u0.id);
    // User0 attended two tournaments, but only two of the three tourneys are returned
    expect(rows[0].points).toEqual(100);
  });

  test.each([[true], [false]])(
    "check tag filter with use_tournament_limits",
    async (use_tournament_limits: boolean) => {
      // Adds a season and user, required base models
      const s0 = await Seasons.insert(Factories.season({ id: 0 }));
      const u0 = await Users.insert(Factories.user({ id: 0 }));

      // Create two tournaments with type that have a limit of 1 per season
      const t0 = await Tournaments.insert(
        Factories.tournament({
          id: 0,
          season: s0,
          type: "worlds championship",
        }),
      );
      const t1 = await Tournaments.insert(
        Factories.tournament({
          id: 1,
          season: s0,
          type: "worlds championship",
        }),
      );

      // Create the tag with the right flag, and tag both tournaments
      const tag = await Tags.insert(
        Factories.tag({
          name: "tag",
          user: u0,
          use_tournament_limits: use_tournament_limits,
        }),
      );
      const tt0 = await Tags.insertTagTournament(
        Factories.tournament_tag({ tournament: t0, tag: tag }),
      );
      const tt2 = await Tags.insertTagTournament(
        Factories.tournament_tag({ tournament: t1, tag: tag }),
      );

      // Now add two results for both tournaments which will be used to ensure all points are being used
      await Results.insert(
        Factories.result({
          tournament: t0,
          user: u0,
          points: 100,
        }),
      );
      await Results.insert(
        Factories.result({
          tournament: t1,
          user: u0,
          points: 100,
        }),
      );

      const leaderboardResponse = await g().mf.dispatchFetch(
        Factories.urlLeaderboard({
          tags: [tag.normalized],
          season: s0,
        }),
      );
      expect(leaderboardResponse.status).toBe(200);
      const rows =
        (await leaderboardResponse.json()) as LeaderboardRowComponentType[];

      // Ensure that all points are reflected
      expect(rows[0].points).toEqual(use_tournament_limits ? 100 : 200);
    },
  );
});
