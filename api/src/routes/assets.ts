import { OpenAPIRoute } from "@cloudflare/itty-router-openapi";
import { GetIdImgSchema } from "../openapi.js";
import { Env, RequestWithDB } from "../types.js";

export class GetIdImg extends OpenAPIRoute {
  static schema = GetIdImgSchema;

  async handle(req: RequestWithDB, env: Env) {
    const id = Number(req.params.id);

    const abrUrl = new URL(`https://alwaysberunning.net/img/ids/${id}.png`);
    const cache = caches.default;

    // Check whether this request has been cached yet
    let response = await cache.match(abrUrl.toString());

    if (!response) {
      const abrResponse = await fetch(abrUrl, req);

      // @ts-ignore
      response = new Response(abrResponse.body, abrResponse);

      // Set cache control headers to cache on browser for 25 minutes
      response.headers.set("Cache-Control", "max-age=1500");

      await cache.put(abrUrl.toString(), response.clone());
    }

    return response;
  }
}
