import { Int, Path, Str } from "@cloudflare/itty-router-openapi";
import { z } from "zod";

export const User = z.object({
  id: z.number({ description: "User ID" }),
  name: z.string({ description: "User name" }),
  email: z.string({ description: "User email" }),
});
export type UserType = z.infer<typeof User>;

export const GetUserSchema = {
  tags: ["User"],
  summary: "Gets a single user",
  parameters: {
    userID: Path(Int, {
      description: "User ID (integer)",
    }),
  },
  responses: {
    "200": {
      description: "User Object",
      schema: {
        user: User,
      },
    },
  },
};

export const GetUsersSchema = {
  tags: ["User"],
  summary: "Gets a list of all users",
  responses: {
    "200": {
      description: "List of all users",
      schema: {
        user: [User],
      },
    },
  },
};

export const MeSchema = {
  tags: ["User"],
  summary: "Gets your own profile",
  responses: {
    "200": {
      description: "Your own user profile",
      schema: {
        user: [User],
      },
    },
  },
};

export const AuthRegisterSchema = {
  tags: ["Auth"],
  summary: "Register a new a new user account",
  requestBody: {
    //TODO: use Regex here
    password: new Str({ required: true }),
    email: new Str({ required: true }),
    name: new Str({ required: true }),
  },
  responses: {
    "200": {
      description: "User Object",
      schema: { user: User },
    },
  },
};

export const AuthLoginBody = z.object({
  //TODO: use Regex here
  password: z.string({ required_error: "password is required" }),
  email: z.string({ required_error: "email is required" }),
});

export const AuthLoginSchema = {
  tags: ["Auth"],
  summary: "Log in via your email and password",
  requestBody: AuthLoginBody,
  responses: {
    "200": {
      description: "User Object",
      schema: { token: new Str({ description: "JWT token" }) },
    },
  },
};
