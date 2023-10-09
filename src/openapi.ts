import { Int, Path, Str } from "@cloudflare/itty-router-openapi";
import { z } from "zod";

export const GetUserResponse = z.object({
  id: z.number({ description: "User ID" }),
  name: z.string({ description: "User name" }),
  email: z.string({ description: "User email" }),
});
export type GetUserResponseType = z.infer<typeof GetUserResponse>;

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
        user: GetUserResponse,
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
        user: [GetUserResponse],
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
        user: [GetUserResponse],
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
      schema: { user: GetUserResponse },
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

export const GetSeasonsResponse = z.object({
  id: z.number(),
  name: z.string(),
  tier: z.string(),
  started_at: z.string().datetime(),
  ended_at: z.date().optional().nullable(),
});
export type GetSeasonsResponseType = z.infer<typeof GetSeasonsResponse>;

export const GetSeasonsSchema = {
  tags: ["Leaderboard"],
  summary: "Gets a list of all existing and past Seasons.",
  responses: {
    "200": {
      schema: z.array(GetSeasonsResponse),
      description: "list of Seasons",
    },
  },
};

export const GetTournamentsResponse = z.object({
  id: z.number(),
  name: z.string(),
  date: z.string().datetime().nullable(),
  is_done: z.number(),
  season_id: z.number(),
  season_name: z.string(),
  season_tier: z.string(),
});
export type GetTournamentsResponseType = z.infer<typeof GetSeasonsResponse>;

export const GetTournamentsSchema = {
  tags: ["Leaderboard"],
  summary: "Gets a list of all Tournaments",
  responses: {
    "200": {
      schema: z.array(GetTournamentsResponse),
      description: "list of Tournaments",
    },
  },
};
