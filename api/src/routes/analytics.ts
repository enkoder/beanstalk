import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import type { ExecutionContext } from "@cloudflare/workers-types/experimental";
import { json } from "itty-router";
import { sql } from "kysely";
import { g } from "../g.js";
import {
  GetIdentityTrendsSchema,
  GetTournamentTypeTrendsSchema,
  type IdentityTrendComponentType,
  type TournamentTypeTrendComponentType,
} from "../openapi.js";
import type { Env, RequestWithDB } from "../types.d.js";

export class GetIdentityTrends extends OpenAPIRoute {
  static schema = GetIdentityTrendsSchema;

  async handle(req: RequestWithDB, env: Env, ctx: ExecutionContext) {
    const side = req.query.side;
    const faction = req.query.faction;
    const seasonId = Number(req.query.seasonId || 2);
    const topN = Number(req.query.topN || 5);

    if (seasonId === 0) {
      // TODO: Get current season
    }

    // Define base fields based on side
    const baseFields =
      side === "corp"
        ? {
            name: "corp_deck_identity_name",
            id: "corp_deck_identity_id",
            faction: "corp_deck_faction",
          }
        : {
            name: "runner_deck_identity_name",
            id: "runner_deck_identity_id",
            faction: "runner_deck_faction",
          };

    // Build the query
    const query = g()
      .db.with("monthly_totals", (qb) => {
        return qb
          .selectFrom("results")
          .innerJoin("tournaments", "tournaments.id", "results.tournament_id")
          .select((eb) => [
            sql<string>`strftime('%Y-%m', tournaments.date)`.as("month"),
            eb.fn.sum("points_earned").as("total_points"),
          ])
          .where("tournaments.season_id", "=", seasonId)
          .groupBy(sql`strftime('%Y-%m', tournaments.date)`);
      })
      .with("monthly_identity_stats", (qb) => {
        let baseQuery = qb
          .selectFrom("results")
          .innerJoin("tournaments", "tournaments.id", "results.tournament_id")
          .innerJoin(
            qb.selectFrom("monthly_totals").selectAll().as("mt"),
            (join) =>
              join.onRef(
                sql`strftime('%Y-%m', tournaments.date)`,
                "=",
                "mt.month",
              ),
          )
          .select((eb) => [
            sql<string>`strftime('%Y-%m', tournaments.date)`.as("month"),
            sql.ref(baseFields.name).as("identity_name"),
            sql.ref(baseFields.id).as("identity_id"),
            eb.fn.sum("points_earned").as("total_points"),
            sql<number>`CAST(SUM(points_earned) AS FLOAT) * 100.0 / mt.total_points`.as(
              "percentage",
            ),
          ])
          .where("tournaments.season_id", "=", seasonId);

        // Add faction filter if provided
        if (faction) {
          baseQuery = baseQuery.where(
            sql.ref(baseFields.faction),
            "=",
            faction,
          );
        }

        return baseQuery.groupBy([
          sql`strftime('%Y-%m', tournaments.date)`,
          sql.ref(baseFields.name),
          sql.ref(baseFields.id),
        ]);
      })
      .with("ranked_monthly_identities", (qb) => {
        return qb
          .selectFrom("monthly_identity_stats")
          .selectAll()
          .select((eb) => [
            sql<number>`ROW_NUMBER() OVER (PARTITION BY month ORDER BY total_points DESC)`.as(
              "rank",
            ),
          ]);
      });

    // Execute the final query
    const results = await query
      .selectFrom("ranked_monthly_identities")
      .select([
        "month",
        "identity_id",
        "identity_name",
        "total_points",
        "percentage",
      ])
      .where("rank", "<=", topN)
      .orderBy(["month", sql`total_points desc`])
      .execute();

    return json(results as IdentityTrendComponentType[]);
  }
}

export class GetTournamentTypeTrends extends OpenAPIRoute {
  static schema = GetTournamentTypeTrendsSchema;

  async handle(req: RequestWithDB, env: Env, ctx: ExecutionContext) {
    const seasonId = Number(req.query.seasonId || 1);

    if (seasonId === 0) {
      // TODO: Get current season
    }

    // Build the query
    const query = g()
      .db.with("monthly_totals", (qb) => {
        return qb
          .selectFrom("results")
          .innerJoin("tournaments", "tournaments.id", "results.tournament_id")
          .select((eb) => [
            sql<string>`strftime('%Y-%m', tournaments.date)`.as("month"),
            eb.fn.sum("points_earned").as("total_points"),
          ])
          .where("tournaments.season_id", "=", seasonId)
          .groupBy(sql`strftime('%Y-%m', tournaments.date)`);
      })
      .with("tournament_type_stats", (qb) => {
        return qb
          .selectFrom("results")
          .innerJoin("tournaments", "tournaments.id", "results.tournament_id")
          .innerJoin(
            qb.selectFrom("monthly_totals").selectAll().as("mt"),
            (join) =>
              join.onRef(
                sql`strftime('%Y-%m', tournaments.date)`,
                "=",
                "mt.month",
              ),
          )
          .select((eb) => [
            sql<string>`strftime('%Y-%m', tournaments.date)`.as("month"),
            "tournaments.type as tournament_type",
            eb.fn.sum("points_earned").as("total_points"),
            eb.fn.count("tournaments.id").distinct().as("tournament_count"),
          ])
          .where("tournaments.season_id", "=", seasonId)
          .groupBy([
            sql`strftime('%Y-%m', tournaments.date)`,
            "tournaments.type",
          ]);
      });

    // Execute the final query
    const results = await query
      .selectFrom("tournament_type_stats")
      .selectAll()
      .orderBy(["month", sql`total_points desc`])
      .execute();

    return json(results as TournamentTypeTrendComponentType[]);
  }
}
