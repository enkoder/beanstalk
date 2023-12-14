import { getDB } from "./db.js";
import { InsertUser, UpdateUser } from "../schema.js";

export class Users {
  public static async getAll(offset?: number, limit?: number) {
    let q = getDB().selectFrom("users").selectAll();
    if (offset) {
      q = q.offset(offset);
    }
    if (limit) {
      q = q.limit(limit);
    }
    return await q.execute();
  }
  public static async count() {
    const { count } = await getDB()
      .selectFrom("users")
      .select((eb) => {
        return eb.fn.countAll<number>().as("count");
      })
      .executeTakeFirst();
    return count;
  }

  public static async getAllWithoutName() {
    return await getDB()
      .selectFrom("users")
      .selectAll()
      .where("name", "is", null)
      .execute();
  }

  public static async getByIdOrName(user: string) {
    return await getDB()
      .selectFrom("users")
      .selectAll()
      .where((eb) =>
        eb.or([eb("id", "=", Number(user)), eb("name", "=", user)]),
      )
      .executeTakeFirst();
  }

  public static async get(id: number) {
    return await getDB()
      .selectFrom("users")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }
  public static async getByName(name: string) {
    return await getDB()
      .selectFrom("users")
      .selectAll()
      .where("name", "=", name)
      .executeTakeFirst();
  }
  public static async getByEmail(email: string) {
    return await getDB()
      .selectFrom("users")
      .selectAll()
      .where("email", "=", email)
      .executeTakeFirst();
  }

  public static async getById(id: number) {
    return await getDB()
      .selectFrom("users")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  public static async insert(
    user: InsertUser,
    overwriteOnConflict: boolean = true,
  ) {
    return await getDB()
      .insertInto("users")
      .values(user)
      .onConflict((oc) => {
        if (overwriteOnConflict) {
          return oc.column("id").doUpdateSet(user);
        } else {
          return oc.column("id").doNothing();
        }
      })
      .returningAll()
      .executeTakeFirst();
  }
  public static async update(id: number, user: UpdateUser) {
    return await getDB()
      .updateTable("users")
      .set(user)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }
}
