import { AsyncLocalStorage } from "node:async_hooks";
import { OpenAPIRouter } from "@cloudflare/itty-router-openapi";
import type { ExecutionContext } from "@cloudflare/workers-types/experimental";
import {
  ResolveConfigFn,
  Trigger,
  instrument,
} from "@microlabs/otel-cf-workers";
import { trace as _trace } from "@opentelemetry/api";
import { createCors, error } from "itty-router";
import { Kysely } from "kysely";
import { D1Dialect } from "kysely-d1";
import { RewriteFrames, Toucan } from "toucan-js";
import { processQueueBatch, processScheduledEvent } from "./background.js";
import { ALS } from "./g.js";
import { ABREntryType, ABRTournamentType } from "./lib/abr.js";
import { adminOnly, authenticatedUser } from "./lib/auth.js";
import { errorResponse } from "./lib/errors.js";
import { trace } from "./lib/tracer.js";
import {
  ExportDB,
  IngestTournament,
  IngestTournaments,
  Rerank,
  UpdateCards,
  UpdateTournamentSeasons,
  UpdateUsers,
} from "./routes/admin.js";
import { GetLoginUrl, GetTokenFromCode, RefreshToken } from "./routes/auth.js";
import {
  GetFactions,
  GetFormats,
  GetLeaderboard,
  GetPointDistribution,
  GetRankingConfig,
} from "./routes/leaderboard.js";
import { GetSeasonTournaments, GetSeasons } from "./routes/seasons.js";
import {
  DeleteTag,
  GetTags,
  GetTournamentTags,
  InsertTags,
  InsertTournamentTags,
} from "./routes/tags.js";
import {
  GetTournament,
  GetTournamentResults,
  GetTournaments,
} from "./routes/tournament.js";
import {
  GetUser,
  GetUserResults,
  GetUsers,
  Me,
  PatchMe,
} from "./routes/users.js";
import { Database } from "./schema.js";
import { Env } from "./types.js";

const router = OpenAPIRouter({
  base: "/api",
  docs_url: "/docs",
  redoc_url: "/redoc",
  openapi_url: "/spec.json",
  openapiVersion: "3.1",
});

router.registry.registerComponent("securitySchemes", "bearerAuth", {
  type: "http",
  scheme: "bearer",
  bearerFormat: "JWT",
});

const { preflight, corsify } = createCors({
  origins: ["*"],
  methods: ["GET", "POST", "PATCH", "DELETE", "PUT"],
  headers: { "Access-Control-Allow-Credentials": true },
});

router
  // un-authed endpoints
  .all("*", preflight)

  .get("/auth/login_url", GetLoginUrl)
  .get("/auth/token", GetTokenFromCode)
  .get("/auth/refresh_token", RefreshToken)

  .get("/users/@me", authenticatedUser, Me)
  .patch("/users/@me", authenticatedUser, PatchMe)
  .get("/users", GetUsers)
  .get("/users/:userID", GetUser)
  .get("/users/:user/results", GetUserResults)

  .get("/leaderboard", GetLeaderboard)
  .get("/point-distribution", GetPointDistribution)
  .get("/factions", GetFactions)
  .get("/formats", GetFormats)

  .get("/seasons", GetSeasons)
  .get("/seasons/:seasonId/tournaments", GetSeasonTournaments)

  .get("/tournaments", GetTournaments)
  .get("/tournaments/config", GetRankingConfig)
  .get("/tournaments/tags", GetTournamentTags)
  .put("/tournaments/tags", authenticatedUser, InsertTournamentTags)
  .get("/tournaments/:tournamentId", GetTournament)
  .get("/tournaments/:tournamentId/results", GetTournamentResults)

  .get("/tags", GetTags)
  .put("/tags", authenticatedUser, InsertTags)
  .delete("/tags", authenticatedUser, DeleteTag)

  // Admin endpoints
  .all("/admin/*", authenticatedUser, adminOnly)
  .get("/admin/updateNRDBNames", UpdateUsers)
  .get("/admin/rerank", Rerank)
  .get("/admin/exportDB", ExportDB)
  .post("/admin/ingestTournament", IngestTournament)
  .post("/admin/ingestTournaments", IngestTournaments)
  .post("/admin/updateCards", UpdateCards)
  .post("/admin/updateTournamentsSeason", UpdateTournamentSeasons)

  // fallthrough
  .all("*", () => errorResponse(404, "url route invalid"));

async function handleFetch(request: Request, env: Env, ctx: ExecutionContext) {
  const sentry = new Toucan({
    dsn: env.SENTRY_DSN,
    release: env.SENTRY_RELEASE,
    context: ctx,
    request: request,
    integrations: [new RewriteFrames({ root: "/" })],
  });

  const db = new Kysely<Database>({
    // @ts-ignore
    dialect: new D1Dialect({ database: env.DB }),
    //log(event) {
    //  if (event.level === "query") {
    //    console.log(event.query.sql);
    //    console.log(event.query.parameters);
    //  }
    //},
  });

  const tracer = _trace.getTracer("beanstalk");

  const handle = ALS.run({ sentry: sentry, db: db, tracer: tracer }, () =>
    AsyncLocalStorage.bind(router.handle),
  );

  try {
    const resp = await trace(
      "handleFetch",
      async () => await handle(request, env, ctx),
    );
    return corsify(resp);
  } catch (e) {
    sentry.captureException(e);

    console.log(e);
    return error(e);
  }
}

async function handleScheduled(
  event: ScheduledEvent,
  env: Env,
  ctx: ExecutionContext,
) {
  const sentry = new Toucan({
    dsn: env.SENTRY_DSN,
    release: env.SENTRY_RELEASE,
    context: ctx,
  });

  const db = new Kysely<Database>({
    // @ts-ignore
    dialect: new D1Dialect({ database: env.DB }),
  });

  const tracer = _trace.getTracer("beanstalk");

  // run while also setting the global context
  return ALS.run({ sentry: sentry, db: db, tracer: tracer }, async () => {
    try {
      await trace(
        "processScheduledEvent",
        async () => await processScheduledEvent(event, env),
      );
    } catch (e) {
      sentry.captureException(e);
    }
  });
}

async function handleQueue(
  batch: MessageBatch<ABRTournamentType | ABREntryType>,
  env: Env,
  ctx: ExecutionContext,
): Promise<void> {
  const sentry = new Toucan({
    dsn: env.SENTRY_DSN,
    release: env.SENTRY_RELEASE,
    context: ctx,
  });

  const db = new Kysely<Database>({
    // @ts-ignore
    dialect: new D1Dialect({ database: env.DB }),
  });

  const tracer = _trace.getTracer("beanstalk");

  // run while also setting the global context
  return ALS.run({ sentry: sentry, db: db, tracer: tracer }, async () => {
    try {
      await trace(
        "processQueueBatch",
        async () => await processQueueBatch(batch, env),
      );
    } catch (e) {
      sentry.captureException(e);
    }
  });
}

const config: ResolveConfigFn = (env: Env, _: Trigger) => {
  const shouldSample = env.ENVIRONMENT === "production";

  return {
    exporter: {
      url: "https://api.honeycomb.io/v1/traces",
      headers: { "x-honeycomb-team": env.HONEYCOMB_API_KEY },
    },
    service: {
      namespace: "beanstalk",
      name: "beanstalk",
      version: env.SENTRY_RELEASE,
    },
    sampling: {
      // by setting the ratio to 0, we effectively stop traces from being sent in development
      headSampler: { acceptRemote: true, ratio: shouldSample ? 1 : 0 },
    },
  };
};

export default instrument(
  {
    queue: handleQueue,
    scheduled: handleScheduled,
    fetch: handleFetch,
  },
  config,
);
