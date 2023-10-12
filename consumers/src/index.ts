export type Env = {
  DB: D1Database;
  QUEUE: Queue<any>;
};

export default {
  async fetch(
    request: Request,
    env: Env,
    _: ExecutionContext,
  ): Promise<Response> {
    const log = {
      url: request.url,
      method: request.method,
      headers: Object.fromEntries(request.headers),
    };
    await env.QUEUE.send(log);
    return new Response("Success!");
  },
  async queue(batch: MessageBatch<any>, _: Env): Promise<void> {
    const messages = JSON.stringify(batch.messages);
    console.log(`consumed from our queue: ${messages}`);
  },
};
