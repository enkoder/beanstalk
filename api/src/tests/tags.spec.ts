import { g } from "../g";
import { Tags } from "../models/tags";
import { Tournaments } from "../models/tournament";
import { Users } from "../models/user";
import type {
  GetTagsResponseComponentType,
  TagComponentType,
  TournamentTagComponentType,
} from "../openapi";
import type { Tag } from "../schema";
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
      Factories.urlTags({}),
      Factories.authedOptions({
        method: "PUT",
        body: JSON.stringify({ name: name }),
      }),
    );
    expect(insertTagResponse.status).toBe(201);
    const tagComponent = (await insertTagResponse.json()) as TagComponentType;
    expect(tagComponent.name).toBe(name);
    expect(tagComponent.normalized).toBe(normalized);
    expect(tagComponent.owner_id).toBe(0);

    const tag = {
      id: tagComponent.id,
      name: tagComponent.name,
      normalized: tagComponent.normalized,
      owner_id: tagComponent.owner_id,
    } as Tag;

    // Check tag was created
    let getTagsResponse = await g().mf.dispatchFetch(Factories.urlTags({}));
    expect(getTagsResponse.status).toBe(200);
    let tags = (await getTagsResponse.json()) as GetTagsResponseComponentType[];

    expect(tags.length).toBe(1);
    expect(tags[0].owner_id).toBe(u.id);
    expect(tags[0].owner_name).toBe(u.name);
    expect(tags[0].name).toBe(name);
    expect(tags[0].normalized).toBe(normalized);
    expect(tags[0].count).toBe(0);

    // insert tournament tag
    const insertTTResponse = await g().mf.dispatchFetch(
      Factories.urlTags({ tag: tag, tournamentsUrl: true }),
      Factories.authedOptions({
        method: "PUT",
        body: JSON.stringify({ tournament_id: t.id }),
      }),
    );

    expect(insertTTResponse.status).toBe(200);
    const tt = (await insertTTResponse.json()) as TournamentTagComponentType;
    expect(tt.tournament_id).toBe(t.id);
    expect(tt.tag_id).toBe(tag.id);

    // Check tags has count
    getTagsResponse = await g().mf.dispatchFetch(Factories.urlTags({}));

    expect(getTagsResponse.status).toBe(200);
    tags = (await getTagsResponse.json()) as GetTagsResponseComponentType[];

    expect(tags.length).toBe(1);
    expect(tags[0].count).toBe(1);
    expect(tags[0].owner_id).toBe(u.id);
    expect(tags[0].id).toBe(tag.id);
    expect(tags[0].normalized).toBe(normalized);
    expect(tags[0].name).toBe(name);
  });

  test("Check OwnerId filter", async () => {
    // adds two users
    const u0 = await Users.insert(Factories.user({ id: 0 }));
    const u1 = await Users.insert(Factories.user({ id: 1 }));
    const t0 = await Tournaments.insert(Factories.tournament({ id: 0 }));
    const t1 = await Tournaments.insert(Factories.tournament({ id: 1 }));
    const tag0 = await Tags.insert(Factories.tag({ name: "name0", user: u0 }));
    const tag1 = await Tags.insert(Factories.tag({ name: "name1", user: u1 }));
    const tt0 = await Tags.insertTagTournament(
      Factories.tournament_tag({
        tag: tag0,
        tournament: t0,
      }),
    );
    await Tags.insertTagTournament(
      Factories.tournament_tag({
        tag: tag1,
        tournament: t1,
      }),
    );

    const getTagsResponse = await g().mf.dispatchFetch(
      Factories.urlTags({ owner: u0 }),
    );
    expect(getTagsResponse.status).toBe(200);
    const tags =
      (await getTagsResponse.json()) as GetTagsResponseComponentType[];

    // Ensure there's only one tag returned, and that it's the right owner
    expect(tags.length).toBe(1);
    expect(tags[0].count).toBe(1);
    expect(tags[0].owner_id).toBe(u0.id);
    expect(tags[0].id).toBe(tag0.id);
  });

  test("Insert & Update Tag", async () => {
    // adds two users
    const u0 = await Users.insert(Factories.user({ id: 0 }));

    const tagToBeInserted = Factories.tag({
      name: "name0",
      user: u0,
      use_tournament_limits: true,
    });
    let getTagsResponse = await g().mf.dispatchFetch(
      Factories.urlTags({}),
      Factories.authedOptions({
        method: "PUT",
        body: JSON.stringify(tagToBeInserted),
      }),
    );
    expect(getTagsResponse.status).toBe(201);
    const tag = (await getTagsResponse.json()) as TagComponentType;

    expect(tag.normalized).toBe(tagToBeInserted.normalized);
    expect(tag.name).toBe(tagToBeInserted.name);
    expect(tag.owner_id).toBe(tagToBeInserted.owner_id);
    expect(tag.use_tournament_limits).toBe(true);

    getTagsResponse = await g().mf.dispatchFetch(
      Factories.urlTags({ tag: tag }),
      Factories.authedOptions({
        method: "POST",
        body: JSON.stringify({ use_tournament_limits: false }),
      }),
    );
    expect(getTagsResponse.status).toBe(200);
    const updatedTag = (await getTagsResponse.json()) as TagComponentType;

    expect(updatedTag.id).toBe(tag.id);
    expect(updatedTag.use_tournament_limits).toBe(false);
  });
});
