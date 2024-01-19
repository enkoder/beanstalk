import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import { ExecutionContext } from "@cloudflare/workers-types/experimental";
import { error, json } from "itty-router";
import { traceDeco } from "../lib/tracer.js";
import { Tags } from "../models/tags.js";
import { Users } from "../models/user.js";
import {
  DeleteTagTournamentsSchema,
  DeleteTagsSchema,
  GetTagTournamentsSchema,
  GetTagsResponseComponent,
  GetTagsSchema,
  InsertTagBodyType,
  InsertTagSchema,
  InsertTagTournamentBodyType,
  InsertTagTournamentSchema,
  TagComponent,
  TagTournamentComponent,
  UpdateTagBodyType,
  UpdateTagsSchema,
} from "../openapi.js";
import { InsertTag, TournamentTag } from "../schema.js";
import { RequestWithDB } from "../types.js";

export class InsertTagTournament extends OpenAPIRoute {
  static schema = InsertTagTournamentSchema;

  @traceDeco("InsertTagTournament")
  async handle(req: RequestWithDB, env: Env, _: ExecutionContext, data) {
    const body = data.body as InsertTagTournamentBodyType;
    const tag_id = Number(req.params?.tag_id);

    const tournament_tag = {
      tag_id: tag_id,
      tournament_id: body.tournament_id,
    } as TournamentTag;

    const tt = await Tags.insertTagTournament(tournament_tag);

    if (!tt) {
      return error(400, "TagTournament already exists");
    }

    return json(TagTournamentComponent.parse(tt));
  }
}

export class GetTags extends OpenAPIRoute {
  static schema = GetTagsSchema;

  @traceDeco("GetTags")
  async handle(req: RequestWithDB) {
    const owner_id = req.query.owner_id
      ? Number(req.query.owner_id)
      : undefined;

    const results = await Tags.getAllExpanded(owner_id);
    return json(
      results.map((result) => GetTagsResponseComponent.parse(result)),
    );
  }
}

export class InsertTags extends OpenAPIRoute {
  static schema = InsertTagSchema;

  @traceDeco("InsertTag")
  async handle(req: RequestWithDB, env: Env, _: ExecutionContext, data) {
    const body = data.body as InsertTagBodyType;
    const user = await Users.getById(req.user_id);

    if (!user) {
      throw new Error("User is invalid in an authed endpoint");
    }

    const tournament_tag = {
      name: body.name,
      normalized: Tags.normalizeName(body.name),
      owner_id: user.id,
    } as InsertTag;

    const tag = await Tags.insert(tournament_tag);
    if (!tag) {
      return error(400, "Tag already exists");
    }

    return json(TagComponent.parse(tag), { status: 201 });
  }
}

export class DeleteTag extends OpenAPIRoute {
  static schema = DeleteTagsSchema;

  @traceDeco("DeleteTag")
  async handle(req: RequestWithDB) {
    const tag_id = Number(req.params.tag_id);

    try {
      await Tags.delete(tag_id);
    } catch (e) {
      error(400, `Could not delete tag ${tag_id}`);
    }

    return json({});
  }
}

export class UpdateTag extends OpenAPIRoute {
  static schema = UpdateTagsSchema;

  @traceDeco("UpdateTag")
  async handle(req: RequestWithDB, env: Env, _: ExecutionContext, data) {
    const tag_id = Number(req.params?.tag_id);
    const body = data.body as UpdateTagBodyType;

    const tag = await Tags.get(tag_id);
    if (!tag) {
      return error(400, `Tag ID ${tag_id} does not exist`);
    }
    tag.use_tournament_limits = body.use_tournament_limits ? 1 : 0;

    try {
      const updatedTag = await Tags.update(tag);
      return json(TagComponent.parse(updatedTag));
    } catch (e) {
      error(400, `Could not update tag ${tag_id}`);
    }
  }
}

export class GetTagTournaments extends OpenAPIRoute {
  static schema = GetTagTournamentsSchema;

  @traceDeco("GetTags")
  async handle(req: RequestWithDB) {
    const tag_id = Number(req.params.tag_id);
    const results = await Tags.getTagTournaments(tag_id);
    return json(results.map((result) => TagTournamentComponent.parse(result)));
  }
}

export class DeleteTagTournament extends OpenAPIRoute {
  static schema = DeleteTagTournamentsSchema;

  @traceDeco("GetTags")
  async handle(req: RequestWithDB) {
    const tag_id = Number(req.params.tag_id);
    const tag_tournament_id = Number(req.params.tag_tournament_id);
    const results = await Tags.deleteTagTournament(tag_id, tag_tournament_id);
    return json({});
  }
}
