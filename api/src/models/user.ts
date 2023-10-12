import { getDB } from "./index";
import { Insertable, Selectable, Updateable } from "kysely";
import { Tournament, UpdateTournament } from "./tournament";

export interface UsersTable {
  id: number;
  name: string | null;
  email: string | null;
  password: string | null;
}

type User = Selectable<UsersTable>;
type UpdateUser = Updateable<UsersTable>;
type InsertUser = Insertable<UsersTable>;

export class Users {
  public static async getAll(): Promise<User[]> {
    return await getDB().selectFrom("users").selectAll().execute();
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
  public static async update(user: UpdateUser): Promise<User> {
    return await getDB()
      .updateTable("users")
      .set(user)
      .returningAll()
      .executeTakeFirst();
  }
}
