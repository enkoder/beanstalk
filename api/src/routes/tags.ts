import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import { ExecutionContext } from "@cloudflare/workers-types/experimental";
import { error, json } from "itty-router";
import { traceDeco } from "../lib/tracer.js";
import { Tags, TournamentTags } from "../models/tags.js";
import { Users } from "../models/user.js";
import {
  GetTagsResponseComponent,
  GetTagsSchema,
  GetTournamentTagsSchema,
  InsertTagBodyType,
  InsertTagsSchema,
  InsertTournamentTagBodyType,
  InsertTournamentTagsSchema,
  TagComponent,
  TournamentTagComponent,
  TournamentTagExpandedComponent,
} from "../openapi.js";
import { InsertTag, TournamentTag } from "../schema.js";
import { RequestWithDB } from "../types.js";

export class GetTournamentTags extends OpenAPIRoute {
  static schema = GetTournamentTagsSchema;

  @traceDeco("GetTournamentTags")
  async handle(req: RequestWithDB, _env: Env, _ctx: ExecutionContext) {
    const owner_id = req.query.owner_id
      ? Number(req.query.owner_id)
      : undefined;

    console.log(JSON.stringify(owner_id));
    const results = await TournamentTags.getAllWithCount(owner_id);
    return json(
      results.map((result) => TournamentTagExpandedComponent.parse(result)),
    );
  }
}

export class InsertTournamentTags extends OpenAPIRoute {
  static schema = InsertTournamentTagsSchema;

  @traceDeco("InsertTournamentTags")
  async handle(req: RequestWithDB, env: Env, _: ExecutionContext, data) {
    const body = data.body as InsertTournamentTagBodyType;

    const tournament_tag = {
      tag_id: body.tag_id,
      tournament_id: body.tournament_id,
    } as TournamentTag;
    const tt = await TournamentTags.insert(tournament_tag);

    if (!tt) {
      return error(400, "TournamentTag already exists");
    }

    return json(TournamentTagComponent.parse(tournament_tag));
  }
}

export class GetTags extends OpenAPIRoute {
  static schema = GetTagsSchema;

  @traceDeco("GetTags")
  async handle(req: RequestWithDB) {
    const results = await Tags.getAllExpanded();
    return json(
      results.map((result) => GetTagsResponseComponent.parse(result)),
    );
  }
}

export class InsertTags extends OpenAPIRoute {
  static schema = InsertTagsSchema;

  @traceDeco("InsertTags")
  async handle(req: RequestWithDB, env: Env, _: ExecutionContext, data) {
    const body = data.body as InsertTagBodyType;
    const user = await Users.getById(req.user_id);

    if (!user) {
      throw new Error("User is invalid in an authed endpoint");
    }

    const tournament_tag = {
      name: body.tag_name,
      normalized: Tags.normalizeName(body.tag_name),
      owner_id: user.id,
    } as InsertTag;

    const tag = await Tags.insert(tournament_tag);
    if (!tag) {
      return error(400, "Tag already exists");
    }

    return json(TagComponent.parse(tag));
  }
}
