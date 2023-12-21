import type { ExecutionContext } from "@cloudflare/workers-types/experimental/index";
import { error } from "itty-router";
import { inflate } from "pako";
import { Toucan } from "toucan-js";
import { z } from "zod";

export type Env = {
  LOKI_URL: string;
  LOKI_CREDENTIALS: string;
  SHARED_TOKEN: string;
  SENTRY_DSN: string;
  SENTRY_RELEASE: string;
};

// https://grafana.com/docs/loki/latest/reference/api/#push-log-entries-to-loki
const Value = z.tuple([z.string(), z.string()]);
type ValueType = z.infer<typeof Value>;
const Stream = z.object({
  stream: z.record(z.string(), z.string().or(z.number())),
  values: z.array(Value),
});
const LokiFormat = z.object({
  streams: z.array(Stream),
});
type StreamType = z.infer<typeof Stream>;
type LokiFormatType = z.infer<typeof LokiFormat>;

const QueueEvent = z.object({
  QueueName: z.string(),
  BatchSize: z.number(),
});
type QueueType = z.infer<typeof QueueEvent>;

const FetchEvent = z.object({
  RayID: z.string(),
  Request: z.object({
    URL: z.string(),
    Method: z.string(),
  }),
  Response: z.object({
    Status: z.number(),
  }),
});
type FetchEventType = z.infer<typeof FetchEvent>;

const Log = z.object({
  Level: z.enum(["log", "warn", "debug", "error", "warning"]),
  Message: z.array(z.string()),
  TimestampMs: z.number(),
});

const LogPushEvent = z.object({
  DispatchNamespace: z.string(),
  Event: z.union([QueueEvent, FetchEvent]),
  EventTimestampMs: z.number(),
  EventType: z.enum(["fetch", "queue"]),
  // TODO: Figure out this type
  Exceptions: z.array(z.any()),
  Logs: z.array(Log),
  // TODO: Figure out the type for this "ok" was a value, let's use an enum here
  Outcome: z.string(),
  // i.e. beanstalk-api
  ScriptName: z.string(),
  ScriptTags: z.array(z.string()),
});
type LogPushEventType = z.infer<typeof LogPushEvent>;

function logpushToLokiStreams(logPushEvent: LogPushEventType): StreamType[] {
  const streams: StreamType[] = [];

  const labels: Record<string, string | number> = {};
  labels.event_type = logPushEvent.EventType;
  labels.outcome = logPushEvent.Outcome;
  labels.script_name = logPushEvent.ScriptName;

  let defaultMsg = "";

  if (logPushEvent.EventType === "fetch") {
    const event = logPushEvent.Event as FetchEventType;
    // Capture the fetch specific labels
    labels.method = event.Request.Method;
    labels.status = String(event.Response.Status);

    // just using the ray id as the message for fetch for now. Should format this to be something prettier
    defaultMsg = `${event.Request.URL} ${event.RayID}`;
  } else if (logPushEvent.EventType === "queue") {
    const event = logPushEvent.Event as QueueType;

    // capture the queue specific labels
    labels.queue_name = event.QueueName;
  }

  // Cloudflare batches up log messages, flatten them here
  for (const log of logPushEvent.Logs) {
    const values: ValueType[] = [];
    for (let i = 0; i < log.Message.length; i++) {
      values.push([String(log.TimestampMs * 1000000), log.Message[i]]);
    }
    streams.push(
      Stream.parse({
        values: values,
        stream: labels,
      }),
    );
  }

  // Handle the cases where logs is empty like during the fetch event
  if (logPushEvent.Logs.length === 0) {
    streams.push(
      Stream.parse({
        stream: labels,
        values: [[String(logPushEvent.EventTimestampMs * 1000000), defaultMsg]],
      }),
    );
  }

  return streams;
}

async function handleRequest(
  request: Request,
  env: Env,
  ctx: ExecutionContext,
) {
  const authHeader = request.headers.get("authorization");
  const contentEncoding = request.headers.get("content-encoding");
  const contentType = request.headers.get("content-type");

  if (request.method !== "POST") {
    return error(400, "Invalid request method");
  }

  if (!authHeader || authHeader !== env.SHARED_TOKEN) {
    return error(400, "Invalid auth");
  }

  if (contentEncoding !== "gzip") {
    return error(400, "Unknown content encoding");
  }

  const sentry = new Toucan({
    dsn: env.SENTRY_DSN,
    release: env.SENTRY_RELEASE,
    context: ctx,
    request: request,
  });

  // unzip/inflate the gzipped payload
  const payload = await request.arrayBuffer();
  const data = inflate(payload);
  const logData = new Uint16Array(data).reduce(
    (data, byte) => data + String.fromCharCode(byte),
    "",
  );

  const streams: StreamType[] = [];
  for (const str of logData.split("\n")) {
    if (!str.trim()) continue;

    const data = JSON.parse(str.trim());

    // check if we are just creating a new logpush
    if (data?.content === "test") {
      return new Response(JSON.stringify({ success: true }), {
        headers: { "content-type": "application/json" },
      });
    }

    try {
      const logPushEvent = LogPushEvent.parse(data);

      for (const stream of logpushToLokiStreams(logPushEvent)) {
        streams.push(stream);
      }
    } catch (e) {
      sentry.captureException(e);
      return error(500, e);
    }
  }

  console.log(`Pushing ${streams.length} streams to Loki Grafana`);

  const response = await fetch(`${env.LOKI_URL}/loki/api/v1/push`, {
    body: JSON.stringify(LokiFormat.parse({ streams: streams })),
    method: "POST",
    headers: {
      Authorization: `Basic ${env.LOKI_CREDENTIALS}`,
      "Content-Type": "application/json",
    },
  });

  const text = await response.text();
  if (!response.ok) {
    console.log(text);
    sentry.captureException(text);
    return error(400, text);
  }

  return new Response(
    JSON.stringify({ success: true, count: streams.length }),
    {
      headers: { "content-type": "application/json" },
    },
  );
}

export default {
  fetch: handleRequest,
};
