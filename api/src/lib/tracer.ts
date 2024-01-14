import {
  Attributes,
  SpanStatusCode,
  trace as _trace,
} from "@opentelemetry/api";
import { g } from "../g.js";

export async function trace<T>(
  name: string,
  fn: () => T | Promise<T>,
  attributes?: Attributes,
) {
  const t = g()?.tracer ? g().tracer : _trace.getTracer("beanstalk");
  return t.startActiveSpan(name, async (span) => {
    if (attributes) span.setAttributes(attributes);
    try {
      const retVal = await fn();

      span.setStatus({
        code: SpanStatusCode.OK,
      });

      return retVal;
    } catch (e) {
      console.log(e);
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: e?.message,
      });

      throw e;
    } finally {
      span.end();
    }
  });
}

export function traceDeco(prefix: string) {
  return (
    // biome-ignore lint/complexity/noBannedTypes: This is an object
    target: Object,
    propertyKey: string,
    descriptor: PropertyDescriptor,
  ) => {
    const name = `${prefix}.${propertyKey}`;
    const originalMethod = descriptor.value;

    // biome-ignore lint/suspicious/noExplicitAny: can be anything
    descriptor.value = async function (...args: any[]) {
      const t = g()?.tracer ? g().tracer : _trace.getTracer("beanstalk");
      return t.startActiveSpan(name, async (span) => {
        try {
          const retVal = await originalMethod.apply(this, args);

          span.setStatus({
            code: SpanStatusCode.OK,
          });

          return retVal;
        } catch (e) {
          span.setStatus({
            code: SpanStatusCode.ERROR,
            message: e?.message,
          });
          throw e;
        } finally {
          span.end();
        }
      });
    };

    return descriptor;
  };
}
