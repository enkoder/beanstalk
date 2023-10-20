import { getDB } from "./index";
import { Expression, Insertable, Selectable, Updateable } from "kysely";
import { Tournament, UpdateTournament } from "./tournament";
import { Result } from "./results";

export interface UsersTable {
  id: number;
  name: string | null;
  email: string | null;
  password: string | null;
  is_admin: boolean;
}

type User = Selectable<UsersTable>;
type UpdateUser = Updateable<UsersTable>;
type InsertUser = Insertable<UsersTable>;

export class Users {
  public static async getAll(offset?: number, limit?: number): Promise<User[]> {
    let q = getDB().selectFrom("users").selectAll();
    if (offset) {
      q = q.offset(offset);
    }
    if (limit) {
      q = q.limit(limit);
    }
    return await q.execute();
  }
  public static async count(): Promise<number> {
    const { count } = await getDB()
      .selectFrom("users")
      .select((eb) => {
        return eb.fn.countAll<number>().as("count");
      })
      .executeTakeFirst();
    return count;
  }

  public static async getAllWithoutName(): Promise<User[]> {
    return await getDB()
      .selectFrom("users")
      .selectAll()
      .where("name", "is", null)
      .execute();
  }

  public static async getByIdOrName(user: string): Promise<User> {
    return await getDB()
      .selectFrom("users")
      .selectAll()
      .where((eb) =>
        eb.or([eb("id", "=", Number(user)), eb("name", "=", user)]),
      )
      .executeTakeFirst();
  }

  public static async get(id: number): Promise<User> {
    return await getDB()
      .selectFrom("users")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }
  public static async getFromEmail(email: string): Promise<User> {
    return await getDB()
      .selectFrom("users")
      .selectAll()
      .where("email", "=", email)
      .executeTakeFirst();
  }

  public static async getFromId(id: number): Promise<User> {
    return await getDB()
      .selectFrom("users")
      .selectAll()
      .where("id", "=", id)
      .executeTakeFirst();
  }

  public static async insert(
    user: InsertUser,
    overwriteOnConflict: boolean = true,
  ): Promise<User> {
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
  public static async update(id: number, user: UpdateUser): Promise<User> {
    return await getDB()
      .updateTable("users")
      .set(user)
      .where("id", "=", id)
      .returningAll()
      .executeTakeFirst();
  }
}
