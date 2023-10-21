import { Int, Path, Query, Str } from "@cloudflare/itty-router-openapi";
import { z } from "zod";
import { ABRTournamentTypeFilter } from "./lib/abr";

export const GetUserResponse = z.object({
  id: z.number({ description: "User ID" }),
  name: z.string({ description: "User name" }).nullable(),
  email: z.string({ description: "User email" }).nullable(),
});
export type GetUserResponseType = z.infer<typeof GetUserResponse>;

export const GetUserSchema = {
  tags: ["User"],
  summary: "Gets a single user",
  security: [{ bearerAuth: [] }],
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
  security: [{ bearerAuth: [] }],
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
  security: [{ bearerAuth: [] }],
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
  security: [{ bearerAuth: [] }],
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
  security: [{ bearerAuth: [] }],
  responses: {
    "200": {
      schema: z.array(GetTournamentsResponse),
      description: "list of Tournaments",
    },
  },
};

export const GetLeaderboardRow = z.object({
  rank: z.number(),
  id: z.number(),
  name: z.coerce.string(),
  points: z.number(),
  attended: z.number(),
});
export type GetLeaderboardRowType = z.infer<typeof GetLeaderboardRow>;

export const GetLeaderboardSchema = {
  tags: ["Leaderboard"],
  summary: "Gets the current season's leaderboard",
  security: [{ bearerAuth: [] }],
  parameters: {
    size: Query(z.coerce.number().optional()),
    page: Query(z.coerce.number().optional()),
  },
  responses: {
    "200": {
      schema: {
        users: z.array(GetLeaderboardRow),
        total: z.number(),
        pages: z.number(),
        current_page: z.number(),
      },
      description:
        "Returns a array of rows compromising the full leaderboard for the given season",
    },
  },
};

export const RerankSummary = z.object({
  numberUsersUpdate: z.number(),
});
export const RerankSchema = {
  tags: ["Admin"],
  summary: "Triggers a re-rank on all User rows. Limited to admin users",
  security: [{ bearerAuth: [] }],
  responses: {
    "200": {
      schema: RerankSummary,
      description: "Summary of what was changed during the re-ranking",
    },
  },
};

export const UpdateUsersSchema = {
  tags: ["Admin"],
  summary: "Triggers updating all users names from nrdb",
  security: [{ bearerAuth: [] }],
  responses: {
    "200": {
      schema: z.object({}),
      description: "Updates all user accounts to pull from NRDB",
    },
  },
};

const IngestTournamentBody = z.object({
  userId: z.number().optional(),
  tournamentType: z.nativeEnum(ABRTournamentTypeFilter).optional(),
});
export const IngestTournamentSchema = {
  tags: ["Admin"],
  summary: "Triggers a background job to ingest tournament data from ABR.",
  security: [{ bearerAuth: [] }],
  requestBody: IngestTournamentBody,
  responses: {
    "200": {
      schema: z.object({}),
      description: "Empty object indicates success on triggering ingestion.",
    },
  },
};

export const GetResultsResponse = z.object({
  user_name: z.string(),
  user_id: z.number(),
  results: z.array(
    z.object({
      runner_deck_identity_id: z.number(),
      runner_deck_url: z.string().nullable(),
      corp_deck_identity_id: z.number(),
      corp_deck_url: z.string().nullable(),
      rank_swiss: z.number(),
      rank_cut: z.number().nullable().optional(),
      season_id: z.number(),
      points_earned: z.number(),
      tournament_id: z.number(),
      tournament_name: z.string(),
      num_players: z.number(),
    }),
  ),
});
export const GetResultsSchema = {
  tags: ["Results"],
  summary: "Gets the results for the given user",
  parameters: { user: Path(Str, { description: "Name or ID of the user" }) },
  security: [{ bearerAuth: [] }],
  responses: {
    "200": {
      schema: GetResultsResponse,
      description:
        "Gets a list of all results for the given user and supplied filters",
    },
  },
};
