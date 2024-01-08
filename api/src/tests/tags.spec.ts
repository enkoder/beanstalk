import { g } from "../g";
import { Tags, TournamentTags } from "../models/tags";
import { Tournaments } from "../models/tournament";
import { Users } from "../models/user";
import {
  GetTagsResponseComponentType,
  TagComponentType,
  TournamentTagComponentType,
  TournamentTagsExpandedComponent,
} from "../openapi";
import * as Factories from "./factories";
import { applyMigrations, initG, wipeDB } from "./setup";

describe("tags", () => {
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

  test("Get TournamentTags & Tags", async () => {
    const normalized = "tag-name";
    const name = "Tag Name";
    // create initial objects
    const u = await Users.insert(Factories.user({ id: 0 }));
    const t = await Tournaments.insert(Factories.tournament({ id: 0 }));

    // insert initial tag
    const insertTagResponse = await g().mf.dispatchFetch(
      Factories.urlTags(),
      Factories.authedOptions("PUT", JSON.stringify({ tag_name: name })),
    );
    expect(insertTagResponse.status).toBe(200);
    const tag = (await insertTagResponse.json()) as TagComponentType;
    expect(tag.name).toBe(name);
    expect(tag.normalized).toBe(normalized);
    expect(tag.owner_id).toBe(0);

    // Check tag was created
    const getTagResponse = await g().mf.dispatchFetch(Factories.urlTags());
    expect(getTagResponse.status).toBe(200);
    const tags =
      (await getTagResponse.json()) as GetTagsResponseComponentType[];

    expect(tags.length).toBe(1);
    expect(tags[0].owner_id).toBe(u.id);
    expect(tags[0].owner_name).toBe(u.name);
    expect(tags[0].name).toBe(name);
    expect(tags[0].normalized).toBe(normalized);

    // insert tournament tag
    const insertTTResponse = await g().mf.dispatchFetch(
      Factories.urlTournamentTags(),
      Factories.authedOptions(
        "PUT",
        JSON.stringify({ tournament_id: t.id, tag_id: tag.id }),
      ),
    );
    expect(insertTTResponse.status).toBe(200);
    const tt = (await insertTTResponse.json()) as TournamentTagComponentType;
    expect(tt.tournament_id).toBe(t.id);
    expect(tt.tag_id).toBe(tag.id);

    // Check tournament tags
    const getTTsResponse = await g().mf.dispatchFetch(
      Factories.urlTournamentTags(),
    );

    expect(getTTsResponse.status).toBe(200);
    const tts =
      (await getTTsResponse.json()) as TournamentTagsExpandedComponent[];

    expect(tts.length).toBe(1);
    expect(tts[0].count).toBe(1);
    expect(tts[0].owner_id).toBe(u.id);
    expect(tts[0].tag_id).toBe(tag.id);
    expect(tts[0].tag_normalized).toBe(normalized);
    expect(tts[0].tag_name).toBe(name);
  });

  test("Check OwnerId filter", async () => {
    // adds two users
    const u0 = await Users.insert(Factories.user({ id: 0 }));
    const u1 = await Users.insert(Factories.user({ id: 1 }));
    const t0 = await Tournaments.insert(Factories.tournament({ id: 0 }));
    const t1 = await Tournaments.insert(Factories.tournament({ id: 1 }));
    const tag0 = await Tags.insert(Factories.tag({ name: "name0", user: u0 }));
    const tag1 = await Tags.insert(Factories.tag({ name: "name1", user: u1 }));
    const tt0 = await TournamentTags.insert(
      Factories.tournament_tag({
        tag: tag0,
        tournament: t0,
      }),
    );
    await TournamentTags.insert(
      Factories.tournament_tag({
        tag: tag1,
        tournament: t1,
      }),
    );

    const getTTsResponse = await g().mf.dispatchFetch(
      Factories.urlTournamentTags(u0.id),
    );

    expect(getTTsResponse.status).toBe(200);
    const tts =
      (await getTTsResponse.json()) as TournamentTagsExpandedComponent[];

    // Ensure there's only one tag returned, and that it's the right owner
    expect(tts.length).toBe(1);
    expect(tts[0].count).toBe(1);
    expect(tts[0].owner_id).toBe(u0.id);
    expect(tts[0].tag_id).toBe(tag0.id);
  });
});
