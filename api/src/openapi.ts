import { Int, Path, Query, Str } from "@cloudflare/itty-router-openapi";
import { z } from "zod";
import { ABRTournamentTypeFilter } from "./lib/abr.js";
import { Formats } from "./models/tournament.js";
import { TournamentType } from "./schema.js";

export const FormatComponent = z.enum(Formats).openapi("Format");
export const TournamentTypeComponent = z
  .nativeEnum(TournamentType)
  .openapi("TournamentType");

export const GetUserResponseComponent = z
  .object({
    id: z.number({ description: "User ID" }),
    name: z.string({ description: "User name" }).nullable(),
  })
  .openapi("GetUsersResponse");
export type GetUserResponseComponentType = z.infer<
  typeof GetUserResponseComponent
>;

export const UserComponent = z
  .object({
    id: z.number({ description: "User ID" }),
    name: z.string({ description: "User name" }).nullable(),
    email: z.string({ description: "User email" }).nullable(),
    disabled: z.coerce.boolean({
      description: "Flag indicating if the user has opted-out",
    }),
    is_admin: z.coerce.boolean({
      description: "Flag indicating that the user is an Admin user",
    }),
    oldest_blog_post_date: z
      .string({ description: "Date of oldest viewed blog post page" })
      .date()
      .nullable(),
  })
  .openapi("User");
export type UserComponentType = z.infer<typeof UserComponent>;

export const UpdateUserComponent = z
  .object({
    email: z.string({ description: "User email" }).optional(),
    disabled: z.coerce
      .boolean({
        description: "Flag indicating if the user has opted-out",
      })
      .optional(),
  })
  .openapi("UpdateUser");
export type UpdateUserComponentType = z.infer<typeof UpdateUserComponent>;

export const ResultComponent = z
  .object({
    rank_swiss: z.number(),
    rank_cut: z.number().nullable().optional(),
    season_id: z.number().nullable().optional(),
    points_earned: z.number(),
    tournament_id: z.number(),
    tournament_name: z.string(),
    tournament_type: TournamentTypeComponent,
    players_count: z.number(),
    corp_deck_identity_id: z.number(),
    corp_deck_identity_name: z.string().nullable().optional(),
    corp_deck_faction: z.string().nullable().optional(),
    corp_deck_url: z.string().nullable().optional(),
    runner_deck_identity_id: z.number(),
    runner_deck_identity_name: z.string().nullable().optional(),
    runner_deck_faction: z.string().optional().nullable(),
    runner_deck_url: z.string().nullable().optional(),
    user_id: z.number(),
    user_name: z.string().nullable(),
    format: FormatComponent,
    count_for_tournament_type: z.number().default(0),
    is_valid: z.boolean(),
  })
  .openapi("Result");
export type ResultComponentType = z.infer<typeof ResultComponent>;

export const SeasonComponent = z
  .object({
    id: z.number(),
    name: z.string(),
    started_at: z.string().datetime(),
    ended_at: z.coerce.date().optional().nullable(),
  })
  .openapi("Season");
export type SeasonComponentType = z.infer<typeof SeasonComponent>;

export const TournamentComponent = z
  .object({
    id: z.number(),
    name: z.string().nullable(),
    date: z.string().datetime().nullable(),
    players_count: z.number(),
    location: z.string(),
    concluded: z.coerce.boolean(),
    format: z.string(),
    type: z.string(),
    season_id: z.number().nullable(),
    season_name: z.string().nullable().optional(),
    season_tier: z.string().nullable().optional(),
  })
  .openapi("Tournament");
export type TournamentComponentType = z.infer<typeof TournamentComponent>;

export const TournamentConfigComponent = z
  .object({
    code: TournamentTypeComponent,
    name: z.string(),
    tournament_limit: z.number(),
    min_players_to_be_legal: z.number(),
    baseline_points: z.number(),
    points_per_player: z.number(),
    additional_top_cut_percentage: z.number(),
  })
  .openapi("TournamentConfig");
export type TournamentConfigType = z.infer<typeof TournamentConfigComponent>;

export const RankingConfigComponent = z
  .object({
    bottom_threshold: z.number(),
    tournament_configs: z.record(
      TournamentTypeComponent,
      TournamentConfigComponent,
    ),
  })
  .openapi("RankingConfig");
export type RankingConfigType = z.infer<typeof RankingConfigComponent>;

export const FactionComponent = z
  .object({
    code: z.string(),
    color: z.string(),
    is_mini: z.boolean(),
    name: z.string(),
    side_code: z.string(),
  })
  .openapi("Faction");
export type FactionComponentType = z.infer<typeof FactionComponent>;

export const LeaderboardRowComponent = z
  .object({
    points: z.number(),
    rank: z.number(),
    user_id: z.number(),
    user_name: z.string().nullable(),
    disabled: z.coerce.boolean(),
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
    totalPoints: z.number(),
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

export const TagTournamentComponent = z
  .object({
    tournament_id: z.number(),
    tag_id: z.number(),
  })
  .openapi("TagTournament");
export type TournamentTagComponentType = z.infer<typeof TagTournamentComponent>;

export const GetTagsResponseComponent = z
  .object({
    id: z.number(),
    name: z.string(),
    normalized: z.string(),
    owner_id: z.number(),
    owner_name: z.string(),
    count: z.number(),
    use_tournament_limits: z.coerce.boolean(),
  })
  .openapi("GetTagsResponse");
export type GetTagsResponseComponentType = z.infer<
  typeof GetTagsResponseComponent
>;

export const TagComponent = z
  .object({
    id: z.number(),
    name: z.string(),
    normalized: z.string(),
    owner_id: z.number(),
    use_tournament_limits: z.coerce.boolean(),
  })
  .openapi("Tag");
export type TagComponentType = z.infer<typeof TagComponent>;

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
      schema: GetUserResponseComponent,
    },
  },
};

export const GetUsersSchema = {
  tags: ["User"],
  summary: "Gets a list of all users.",
  responses: {
    "200": {
      description: "List of all users",
      schema: z.array(GetUserResponseComponent),
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

export const PatchMeSchema = {
  tags: ["User"],
  summary: "Updates your profile",
  security: [{ bearerAuth: [] }],
  requestBody: UpdateUserComponent,
  responses: {
    "200": {
      description: "Your updated user profile",
      schema: UserComponent,
    },
  },
};

export const ViewBlogPostBody = z.object({
  blogDate: z.string(),
});
export type ViewBlogPostBodyType = z.infer<typeof ViewBlogPostBody>;

export const ViewBlogPostSchema = {
  tags: ["Blog"],
  summary: "Views a blog post",
  security: [{ bearerAuth: [] }],
  requestBody: ViewBlogPostBody,
  responses: {
    "200": {
      schema: z.object({}),
      description: "Empty object indicates success on viewing blog post",
    },
  },
};

export const GetOAuthLoginURLSchema = {
  tags: ["Auth"],
  summary: "Fetches the NRDB login url",
  responses: {
    "200": {
      description: "Object containing the auth_url",
      schema: z.string(),
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

export const GetSeasonsComponent = z
  .object({
    current_season: SeasonComponent,
    seasons: z.array(SeasonComponent),
  })
  .openapi("GetSeasonsResponse");
export type GetSeasonsComponentType = z.infer<typeof GetSeasonsComponent>;

export const GetSeasonsSchema = {
  tags: ["Seasons"],
  summary: "Gets a list of all existing and past Seasons.",
  responses: {
    "200": {
      schema: GetSeasonsComponent,
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

export const GetLeaderboardSchema = {
  tags: ["Leaderboard"],
  summary: "Gets the current season's leaderboard",
  parameters: {
    seasonId: Query(z.coerce.number().optional()),
    factionCode: Query(z.string().optional()),
    format: Query(FormatComponent.optional()),
    tags: Query(z.string().or(z.array(z.string())).optional()),
  },
  responses: {
    "200": {
      schema: z.array(LeaderboardRowComponent),
      description:
        "Returns a array of rows compromising the full leaderboard for the given season",
    },
  },
};

export const InsertTournamentTagBody = z.object({
  tournament_id: z.number(),
});
export type InsertTagTournamentBodyType = z.infer<
  typeof InsertTournamentTagBody
>;

export const InsertTagTournamentSchema = {
  tags: ["Tags"],
  summary: "Inserts a tournament tag",
  requestBody: InsertTournamentTagBody,
  parameters: {
    tag_id: Path(Number, {
      description: "Tag ID you are using to tag the given tournament",
    }),
  },
  responses: {
    "200": {
      schema: TagTournamentComponent,
      description:
        "Returns a array of rows showing all tags, the owners, and the count of tournaments associated with each tag",
    },
  },
};

export const GetTagsSchema = {
  tags: ["Tags"],
  summary:
    "Gets the list of tags with a count of tournaments associated with that tag",
  parameters: {
    owner_id: Query(z.coerce.number().optional()),
  },
  responses: {
    "200": {
      schema: z.array(GetTagsResponseComponent),
      description:
        "Returns a array of rows showing all tags, the owners, and the count of tournaments associated with each tag",
    },
  },
};

export const InsertTagBody = z.object({
  name: z.string(),
});
export type InsertTagBodyType = z.infer<typeof InsertTagBody>;

export const InsertTagSchema = {
  tags: ["Tags"],
  summary: "Inserts a tag",
  requestBody: InsertTagBody,
  responses: {
    "201": {
      schema: TagComponent,
      description: "Returns the inserted tag",
    },
  },
};

export const UpdateTagBody = z.object({
  use_tournament_limits: z.boolean(),
});

export type UpdateTagBodyType = z.infer<typeof UpdateTagBody>;
export const UpdateTagsSchema = {
  tags: ["Tags"],
  summary: "Updates a tag",
  parameters: {
    tag_id: Path(Number, {
      description: "Tag ID",
    }),
  },
  requestBody: UpdateTagBody,
  responses: {
    "200": {
      schema: z.object({}),
      description: "Empty object indicates deleted tag",
    },
  },
};

export const DeleteTagsSchema = {
  tags: ["Tags"],
  summary: "Deletes a tag",
  parameters: {
    tag_id: Path(Number, {
      description: "Tag ID",
    }),
  },
  responses: {
    "200": {
      schema: z.object({}),
      description: "Empty object indicates deleted tag",
    },
  },
};

export const GetTagTournamentsSchema = {
  tags: ["Tags"],
  summary: "Gets a list of tag tournaments",
  parameters: {
    tag_id: Path(Number, {
      description: "Tag ID",
    }),
  },
  responses: {
    "200": {
      schema: z.array(TagTournamentComponent),
      description: "List of tag tournaments",
    },
  },
};

export const DeleteTagTournamentsSchema = {
  tags: ["Tags"],
  summary: "Deletes the given tag tournament",
  parameters: {
    tag_id: Path(Number, {
      description: "Tag ID",
    }),
    tag_tournament_id: Path(Number, {
      description: "Tag Tournament ID",
    }),
  },
  responses: {
    "200": {
      schema: {},
      description: "Empty object indicating tag tournament was deleted",
    },
  },
};

export const GetRankingConfigSchema = {
  tags: ["Leaderboard"],
  summary:
    "Returns configuration data for determining the leaderboard for a given season",
  parameters: {
    seasonId: Query(z.coerce.number().optional()),
  },
  responses: {
    "200": {
      schema: RankingConfigComponent,
      description: "Returns a RankingConfig object for the specified season",
    },
  },
};

export const GetFactionsSchema = {
  tags: ["Leaderboard"],
  summary: "Returns a list of Netrunner Factions",
  responses: {
    "200": {
      schema: z.array(FactionComponent),
      description: "Returns an array Factions",
    },
  },
};

export const GetFormatSchema = {
  tags: ["Leaderboard"],
  summary: "Returns a list of supported Netrunner Formats",
  responses: {
    "200": {
      schema: z.array(FormatComponent),
      description: "Returns an array supported Formats",
    },
  },
};

export const GetPointDistributionSchema = {
  tags: ["Leaderboard"],
  summary: "Tool to show distribution of points from various given parameters",
  parameters: {
    numPlayers: Query(z.coerce.number()),
    type: Query(TournamentTypeComponent.optional()),
    seasonId: Query(z.coerce.number().optional()),
  },
  responses: {
    "200": {
      schema: GetPointDistributionResponseComponent,
      description:
        "Returns a array of numbers representing the point distribution of the simulated tournament",
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

export const ExportDBSchema = {
  tags: ["Admin"],
  summary: "Exports the production DB",
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

export const IngestTournamentBody = z.object({
  userId: z.number().optional(),
  tournamentType: z.nativeEnum(ABRTournamentTypeFilter).optional(),
});
export type IngestTournamentBodyType = z.infer<typeof IngestTournamentBody>;

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

export const IngestTournamentsSchema = {
  tags: ["Admin"],
  summary: "Triggers a background job to ingest all tournament data from ABR.",
  security: [{ bearerAuth: [] }],
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

export const RecalculateLeaderboardSchema = {
  tags: ["Admin"],
  summary: "Triggers a recalculation of the leaderboard table",
  security: [{ bearerAuth: [] }],
  parameters: {
    season: Query(z.coerce.number()),
  },
  responses: {
    "200": {
      schema: z.object({}),
      description:
        "Empty object indicates success on triggering recalculation.",
    },
  },
};

export const UserResultsResponseComponent = z
  .object({
    userName: z.string(),
    userId: z.number(),
    rank: z.number(),
    seasonId: z.number().optional().nullable(),
    seasonName: z.string().optional().nullable(),
    format: FormatComponent.optional().nullable(),
    factionCode: z.string().optional().nullable(),
    results: z.array(ResultComponent),
  })
  .openapi("UserResultsResponse");

export const GetUserResultsSchema = {
  tags: ["Results"],
  summary: "Gets the results for the given user",
  parameters: {
    user: Path(Str, { description: "Name or ID of the user" }),
    season: Query(z.coerce.number().optional()),
    factionCode: Query(z.string().optional()),
    format: Query(FormatComponent.optional()),
    tags: Query(z.string().or(z.array(z.string())).optional()),
  },
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

export const GetIdImgSchema = {
  tags: ["Assets"],
  summary: "Gets a cached ID image",
  parameters: { id: Path(Number, { description: "Identity card ID" }) },
  responses: {
    "200": {
      description: "Identity image PNG",
    },
  },
};

//const side = req.query.side;
//const faction = req.query.faction;
//const startDate = req.query.startDate || "2024-01-01"; // Default to start of 2024
//const endDate = req.query.endDate || new Date().toISOString().split("T")[0];
//const groupBy = req.query.groupBy || "month";

export const IdentityTrendComponent = z
  .object({
    month: z.string({ description: "Month in YYYY-MM format" }),
    identity_name: z.string({ description: "Name of the identity" }),
    identity_id: z.number({ description: "ID of the identity" }),
    faction: z.string({ description: "Faction of the identity" }),
    side: z.enum(["runner", "corp"]),
    count: z.number({ description: "Number of times the identity was played" }),
    percentage: z.number({
      description: "Percentage of total decks for that month",
    }),
  })
  .openapi("IdentityTrend");
export type IdentityTrendComponentType = z.infer<typeof IdentityTrendComponent>;

export const GetIdentityTrendsSchema = {
  tags: ["Analytics"],
  summary: "Get monthly identity popularity trends",
  parameters: {
    side: Query(z.enum(["runner", "corp"]).describe("Filter by side")),
    faction: Query(z.string().optional().describe("Filter by faction")),
    seasonId: Query(z.string().optional().describe("Season ID")),
    topN: Query(z.string().optional().describe("Top N identities to show")),
  },
  responses: {
    "200": {
      description: "Returns monthly identity trends",
      schema: z.array(IdentityTrendComponent),
    },
  },
};

export const TournamentTypeTrendComponent = z
  .object({
    month: z.string({ description: "Month in YYYY-MM format" }),
    tournament_type: TournamentTypeComponent,
    total_points: z.number({
      description: "Total points awarded for this tournament type",
    }),
    tournament_count: z.number({
      description: "Number of tournaments of this type",
    }),
  })
  .openapi("TournamentTypeTrend");
export type TournamentTypeTrendComponentType = z.infer<
  typeof TournamentTypeTrendComponent
>;

export const GetTournamentTypeTrendsSchema = {
  tags: ["Analytics"],
  summary: "Get monthly tournament type points distribution trends",
  parameters: {
    seasonId: Query(z.string().optional().describe("Season ID")),
  },
  responses: {
    "200": {
      description: "Returns monthly tournament type trends",
      schema: z.array(TournamentTypeTrendComponent),
    },
  },
};
