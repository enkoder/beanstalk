import { ABRTournamentTypeFilter } from "./lib/abr";
import { Int, Path, Query, Str } from "@cloudflare/itty-router-openapi";
import { z } from "zod";

export const UserComponent = z
  .object({
    id: z.number({ description: "User ID" }),
    name: z.string({ description: "User name" }).nullable(),
    email: z.string({ description: "User email" }).nullable(),
    is_admin: z.coerce.boolean({
      description: "Flag indicating that the user is an Admin user",
    }),
  })
  .openapi("User");
export type UserComponentType = z.infer<typeof UserComponent>;

export const ResultComponent = z
  .object({
    rank_swiss: z.number(),
    rank_cut: z.number().nullable().optional(),
    season_id: z.number(),
    points_earned: z.number(),
    tournament_id: z.number(),
    tournament_name: z.string(),
    registration_count: z.number(),
    corp_deck_identity_id: z.number(),
    corp_deck_identity_name: z.string().nullable().optional(),
    corp_deck_faction: z.string().nullable().optional(),
    corp_deck_url: z.string().nullable().optional(),
    runner_deck_identity_id: z.number(),
    runner_deck_identity_name: z.string().nullable().optional(),
    runner_deck_faction: z.string().optional().nullable(),
    runner_deck_url: z.string().nullable().optional(),
  })
  .openapi("Result");
export type ResultComponentType = z.infer<typeof ResultComponent>;

export const SeasonComponent = z
  .object({
    id: z.number(),
    name: z.string(),
    tier: z.string(),
    started_at: z.string().datetime(),
    ended_at: z.coerce.date().optional().nullable(),
  })
  .openapi("Season");
export type SeasonComponentType = z.infer<typeof SeasonComponent>;

export const TournamentComponent = z
  .object({
    id: z.number(),
    name: z.string(),
    date: z.string().datetime().nullable(),
    registration_count: z.number(),
    location: z.string(),
    concluded: z.coerce.boolean(),
    format: z.string(),
    type: z.string(),
    season_id: z.number(),
    season_name: z.string().optional(),
    season_tier: z.string().optional(),
  })
  .openapi("Tournament");
export type TournamentComponentType = z.infer<typeof TournamentComponent>;

export const LeaderboardRowComponent = z
  .object({
    rank: z.number(),
    id: z.number(),
    name: z.coerce.string(),
    points: z.number(),
    attended: z.number(),
  })
  .openapi("LeaderboardRow");
export type LeaderboardRowComponentType = z.infer<
  typeof LeaderboardRowComponent
>;

export const TokenResponseComponent = z
  .object({
    access_token: z.string(),
    refresh_token: z.string(),
    expires_in: z.number(),
    token_type: z.string(),
  })
  .openapi("TokenResponse");
export type GetTokenResponseComponent = z.infer<typeof TokenResponseComponent>;

export const PrivateAccountInfo = z.object({
  id: z.number(),
  username: z.string(),
  email: z.string(),
  reputation: z.number(),
  sharing: z.coerce.boolean(),
});
export type PrivateAccountInfoType = z.infer<typeof PrivateAccountInfo>;

export const GetPointDistributionResponseComponent = z
  .object({
    currentTargetTopPercentage: z.number(),
    currentTargetPointPercentageForTop: z.number(),
    adjustedTotalPoints: z.number(),
    pointDistribution: z.array(
      z.object({
        placement: z.number(),
        points: z.number(),
        cumulative: z.number(),
      }),
    ),
  })
  .openapi("GetPointDistributionResponse");
export type GetPointDistributionResponseComponentType = z.infer<
  typeof GetPointDistributionResponseComponent
>;

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
      schema: UserComponent,
    },
  },
};

export const GetUsersSchema = {
  tags: ["User"],
  summary: "Gets a list of all users.",
  responses: {
    "200": {
      description: "List of all users",
      schema: z.array(UserComponent),
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
      schema: UserComponent,
    },
  },
};

export const GetOAuthLoginURLSchema = {
  tags: ["Auth"],
  summary: "Fetches the NRDB login url",
  responses: {
    "200": {
      description: "Object containing the auth_url",
      schema: z.object({ auth_url: z.string() }),
    },
  },
};

export const OAuthGetTokenFromCodeSchema = {
  tags: ["Auth"],
  summary:
    "From the code supplied during the OAuth redirect, perform the secret exchange and create a token",
  parameters: {
    code: Query(z.string()),
  },
  responses: {
    "200": {
      description: "Blob containing the token and refresh_token",
      schema: TokenResponseComponent,
    },
  },
};

export const LoginSchema = {
  tags: ["Auth"],
  summary: "Fetch user information from token passed in via cookie.",
  responses: {
    "200": {
      description: "Logged in User",
      schema: UserComponent,
    },
  },
};

export const RefreshTokenSchema = {
  tags: ["Auth"],
  summary: "Attempts to create a new token from the given refresh_token",
  parameters: { refresh_token: Query(z.string()) },
  responses: {
    "200": {
      description: "Blob containing the token and refresh_token",
      schema: TokenResponseComponent,
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
      schema: UserComponent,
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

export const GetSeasonsSchema = {
  tags: ["Seasons"],
  summary: "Gets a list of all existing and past Seasons.",
  responses: {
    "200": {
      schema: z.array(SeasonComponent),
      description: "list of Seasons",
    },
  },
};

export const GetSeasonTournamentsSchema = {
  tags: ["Seasons"],
  summary: "Gets a list of all existing and past Seasons.",
  parameters: { seasonId: Path(Number, { description: "Season ID" }) },
  responses: {
    "200": {
      schema: z.array(TournamentComponent),
      description: "list of Tournaments for the given season",
    },
  },
};

export const LeaderboardResponseComponent = z
  .object({
    users: z.array(LeaderboardRowComponent),
    total: z.number(),
    pages: z.number(),
    current_page: z.number(),
  })
  .openapi("LeaderboardResponse");

export const GetLeaderboardSchema = {
  tags: ["Leaderboard"],
  summary: "Gets the current season's leaderboard",
  parameters: {
    size: Query(z.coerce.number().optional()),
    page: Query(z.coerce.number().optional()),
    seasonId: Query(z.coerce.number().optional()),
  },
  responses: {
    "200": {
      schema: LeaderboardResponseComponent,
      description:
        "Returns a array of rows compromising the full leaderboard for the given season",
    },
  },
};

export const GetPointDistributionSchema = {
  tags: ["Leaderboard"],
  summary: "Tool to show distribution of points from various given parameters",
  parameters: {
    totalPoints: Query(z.coerce.number()),
    numPlayers: Query(z.coerce.number()),
    percentReceivingPoints: Query(z.coerce.number()),
    targetTopPercentage: Query(z.coerce.number().optional()),
    targetPointPercentageForTop: Query(z.coerce.number().optional()),
  },
  responses: {
    "200": {
      schema: GetPointDistributionResponseComponent,
      description:
        "Returns a array of numbers representing the point distribution of the simulated tournament",
    },
  },
};

export const RerankSchema = {
  tags: ["Admin"],
  summary: "Triggers a re-rank on all User rows. Limited to admin users",
  security: [{ bearerAuth: [] }],
  responses: {
    "200": {
      schema: z.object({
        numberUsersUpdate: z.number(),
      }),
      description: "Summary of what was changed during the re-ranking",
    },
  },
};

export const UpdateTournamentSeasonSchema = {
  tags: ["Admin"],
  summary: "Triggers a Season start & end date update across all tournaments.",
  security: [{ bearerAuth: [] }],
  responses: {
    "200": {
      schema: z.object({
        tournamentsUpdated: z.number(),
      }),
      description: "How many tournaments were updated",
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

export const UpdateCardsSchema = {
  tags: ["Admin"],
  summary: "Fetches and updates the KV that stores the NRDB cards",
  security: [{ bearerAuth: [] }],
  responses: {
    "200": {
      schema: z.object({}),
      description: "Empty object indicates success on updating nrdb cards.",
    },
  },
};

export const UserResultsResponseComponent = z
  .object({
    user_name: z.string(),
    user_id: z.number(),
    results: z.array(ResultComponent),
  })
  .openapi("UserResultsResponse");

export const GetUserResultsSchema = {
  tags: ["Results"],
  summary: "Gets the results for the given user",
  parameters: { user: Path(Str, { description: "Name or ID of the user" }) },
  responses: {
    "200": {
      schema: UserResultsResponseComponent,
      description:
        "Gets a list of all results for the given user and supplied filters",
    },
  },
};

export const GetTournamentsSchema = {
  tags: ["Tournament"],
  summary: "Gets a list of all Tournaments",
  responses: {
    "200": {
      schema: z.array(TournamentComponent),
      description: "list of Tournaments",
    },
  },
};

export const GetTournamentSchema = {
  tags: ["Tournament"],
  summary: "Gets a single tournament",
  parameters: { tournamentId: Path(Number, { description: "Tournament ID" }) },
  responses: {
    "200": {
      schema: TournamentComponent,
      description: "Full Tournament object",
    },
  },
};

export const GetTournamentResultsSchema = {
  tags: ["Tournament"],
  summary: "Gets a list of results from the given tournament",
  parameters: { tournamentId: Path(Number, { description: "Tournament ID" }) },
  responses: {
    "200": {
      schema: z.array(ResultComponent),
      description: "List of Results from the supplied tournament",
    },
  },
};
