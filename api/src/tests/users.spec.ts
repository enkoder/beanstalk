import { g } from "../g";
import { Users } from "../models/user";
import { UserComponentType } from "../openapi";
import * as Factories from "./factories";
import { applyMigrations, initG, wipeDB } from "./setup";

describe("users", () => {
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

  afterEach(() => {
    jest.restoreAllMocks();
  });

  test("Get @me", async () => {
    const u = await Users.insert({ id: 0 });
    const response = await g().mf.dispatchFetch(
      Factories.urlMe(),
      Factories.authedOptions("GET"),
    );

    expect(response.status).toBe(200);
    const data = (await response.json()) as UserComponentType;
    expect(data.id).toBe(u.id);
  });

  test("Patch @me", async () => {
    const u = await Users.insert({ id: 0, email: "", disabled: 0 });
    const response = await g().mf.dispatchFetch(
      Factories.urlMe(),
      Factories.authedOptions(
        "PATCH",
        JSON.stringify({ email: "changed", disabled: 1 }),
      ),
    );

    expect(response.status).toBe(200);
    const data = (await response.json()) as UserComponentType;
    expect(data.id).toBe(u.id);
    expect(data.email).toBe("changed");
    expect(data.disabled).toBe(true);
  });
});
