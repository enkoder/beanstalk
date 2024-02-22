import { g } from "../g";
import { Users } from "../models/user";
import type { UserComponentType } from "../openapi";
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
    const u = await Users.insert(Factories.user({ id: 0, disabled: 0 }));
    const response = await g().mf.dispatchFetch(
      Factories.urlMe(),
      Factories.authedOptions({ method: "GET" }),
    );

    expect(response.status).toBe(200);
    const data = (await response.json()) as UserComponentType;
    expect(data.id).toBe(u.id);
  });

  test("Patch @me", async () => {
    const u = await Users.insert(Factories.user({ id: 0, disabled: 0 }));
    const response = await g().mf.dispatchFetch(
      Factories.urlMe(),
      Factories.authedOptions({
        method: "PATCH",
        body: JSON.stringify({ email: "changed", disabled: 1 }),
      }),
    );

    expect(response.status).toBe(200);
    const data = (await response.json()) as UserComponentType;
    expect(data.id).toBe(u.id);
    expect(data.email).toBe("changed");
    expect(data.disabled).toBe(true);
  });

  test("check disabled user", async () => {
    const u0 = await Users.insert(Factories.user({ id: 100, disabled: 1 }));
    const response = await g().mf.dispatchFetch(
      Factories.urlUser({ id: u0.id }),
    );
    expect(response.status).toBe(400);
  });

  test("check disabled users", async () => {
    const u0 = await Users.insert(Factories.user({ id: 100, disabled: 1 }));
    const response = await g().mf.dispatchFetch(Factories.urlUsers());
    expect(response.status).toBe(200);
    const rows = (await response.json()) as [UserComponentType];
    expect(rows.length).toBe(0);
  });
});
