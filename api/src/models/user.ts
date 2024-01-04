import { g } from "../g.js";
import { traceDeco } from "../lib/tracer.js";
import { InsertUser, UpdateUser, User } from "../schema.js";

// biome-ignore lint/complexity/noStaticOnlyClass:
export class Users {
  @traceDeco
  public static async getAll(offset?: number, limit?: number) {
    let q = g().db.selectFrom("users").selectAll();
    if (offset) {
      q = q.offset(offset);
    }
    if (limit) {
      q = q.limit(limit);
    }
    return await q.execute();
  }

  @traceDeco
  public static async count() {
    const { count } = await g()
      .db.selectFrom("users")
      .select((eb) => {
        return eb.fn.countAll<number>().as("count");
      })
      .executeTakeFirst();
    return count;
  }

  @traceDeco
  public static async getAllWithoutName() {
    return await g()
      .db.selectFrom("users")
      .selectAll()
      .where("name", "is", null)
      .execute();
  }

  @traceDeco
  public static async getByIdOrName(user: string) {
    return await g()
      .db.selectFrom("users")
      .selectAll()
      .where((eb) =>
        eb.or([eb("id", "=", Number(user)), eb("name", "=", user)]),
      )
      .executeTakeFirst();
  }

  @traceDeco
  public static async get(id: number) {
    return await g()
      .db.selectFrom("users")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  @traceDeco
  public static async getByName(name: string) {
    return await g()
      .db.selectFrom("users")
      .selectAll()
      .where("name", "=", name)
      .executeTakeFirst();
  }

  @traceDeco
  public static async getByEmail(email: string) {
    return await g()
      .db.selectFrom("users")
      .selectAll()
      .where("email", "=", email)
      .executeTakeFirst();
  }

  @traceDeco
  public static async getById(id: number) {
    return await g()
      .db.selectFrom("users")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  @traceDeco
  public static async insert(
    user: InsertUser,
    overwriteOnConflict = true,
  ): Promise<User> {
    return await g()
      .db.insertInto("users")
      .values(user)
      .onConflict((oc) => {
        if (overwriteOnConflict) {
          return oc.column("id").doUpdateSet(user);
        }
        return oc.column("id").doNothing();
      })
      .returningAll()
      .executeTakeFirst();
  }

  @traceDeco
  public static async update(id: number, user: UpdateUser) {
    return await g()
      .db.updateTable("users")
      .set(user)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }
}
