import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import { RequestWithDB } from "../types";
import { json } from "itty-router";
import { Results } from "../models/results";
import { GetResultsResponse, GetResultsSchema } from "../openapi";
import { Users } from "../models/user";

export class GetResults extends OpenAPIRoute {
  static schema = GetResultsSchema;

  async handle(req: RequestWithDB) {
    const userIdOrName = req.params!["user"];
    const user = await Users.getByIdOrName(userIdOrName);
    const results = await Results.getManyByUserIdExpanded(user.id);

    const result = GetResultsResponse.parse({
      user_id: user.id,
      user_name: user.name,
      results: results,
    });

    return json(result);
  }
}
