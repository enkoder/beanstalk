import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import {
  GetSeasonsResponse,
  GetSeasonsResponseType,
  GetSeasonsSchema,
  GetTournamentsResponse,
  GetTournamentsResponseType,
  GetTournamentsSchema,
} from "../openapi";
import { Env, RequestWithDB } from "../types";
import { json } from "itty-router";

class GetSeasons extends OpenAPIRoute {
  static schema = GetSeasonsSchema;

  async handle(
    req: RequestWithDB,
    env: Env,
    contet: ExecutionContext,
    data: Record<string, any>,
  ) {
    const result = await req.db.selectFrom("seasons").selectAll().execute();
    const retArr: GetSeasonsResponseType[] = [];
    result.forEach((row) => retArr.push(GetSeasonsResponse.parse(row)));
    return json(retArr);
  }
}

class GetTournaments extends OpenAPIRoute {
  static schema = GetTournamentsSchema;

  async handle(
    req: RequestWithDB,
    env: Env,
    contet: ExecutionContext,
    data: Record<string, any>,
  ) {
    const results = await req.db
      .selectFrom("tournaments")
      .leftJoin("seasons", "tournaments.id", "seasons.id")
      .select([
        "tournaments.id",
        "tournaments.name",
        "tournaments.date",
        "tournaments.is_done",
        "tournaments.season_id",
        "seasons.name as season_name",
        "seasons.tier as season_tier",
      ])
      .execute();

    const retArr: GetTournamentsResponseType[] = [];
    results.forEach((row) => {
      console.log(row);

      // @ts-ignore
      retArr.push(GetTournamentsResponse.parse(row));
    });
    return json(retArr);
  }
}

export { GetSeasons, GetTournaments };
