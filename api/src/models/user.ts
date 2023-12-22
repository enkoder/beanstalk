import { g } from "../g.js";
import { InsertUser, UpdateUser, User } from "../schema.js";

export async function getAll(offset?: number, limit?: number) {
  let q = g().db.selectFrom("users").selectAll();
  if (offset) {
    q = q.offset(offset);
  }
  if (limit) {
    q = q.limit(limit);
  }
  return await q.execute();
}
export async function count() {
  const { count } = await g()
    .db.selectFrom("users")
    .select((eb) => {
      return eb.fn.countAll<number>().as("count");
    })
    .executeTakeFirst();
  return count;
}

export async function getAllWithoutName() {
  return await g()
    .db.selectFrom("users")
    .selectAll()
    .where("name", "is", null)
    .execute();
}

export async function getByIdOrName(user: string) {
  return await g()
    .db.selectFrom("users")
    .selectAll()
    .where((eb) => eb.or([eb("id", "=", Number(user)), eb("name", "=", user)]))
    .executeTakeFirst();
}

export async function get(id: number) {
  return await g()
    .db.selectFrom("users")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
}
export async function getByName(name: string) {
  return await g()
    .db.selectFrom("users")
    .selectAll()
    .where("name", "=", name)
    .executeTakeFirst();
}
export async function getByEmail(email: string) {
  return await g()
    .db.selectFrom("users")
    .selectAll()
    .where("email", "=", email)
    .executeTakeFirst();
}

export async function getById(id: number) {
  return await g()
    .db.selectFrom("users")
    .selectAll()
    .where("id", "=", id)
    .executeTakeFirst();
}

export async function insert(
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
export async function update(id: number, user: UpdateUser) {
  return await g()
    .db.updateTable("users")
    .set(user)
    .where("id", "=", id)
    .returningAll()
    .executeTakeFirst();
}
