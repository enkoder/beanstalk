import { SpanStatusCode, trace as _trace } from "@opentelemetry/api";

export function trace<T>(name: string, fn: () => T | Promise<T>): Promise<T> {
  const tracer = _trace.getTracer("beanstalk");
  return tracer.startActiveSpan(name, async (span) => {
    try {
      return await fn();
    } catch (e) {
      span.setStatus({
        code: SpanStatusCode.ERROR,
        message: e?.message,
      });

      throw e;
    } finally {
      span.setStatus({
        code: SpanStatusCode.OK,
      });
      span.end();
    }
  });
}

export function traceDeco(
  // biome-ignore lint/suspicious/noExplicitAny: target is a class, no clue the type
  target: any,
  propertyKey: string,
  descriptor: PropertyDescriptor,
) {
  const name = `${target.constructor.name}.${propertyKey}`;
  const originalMethod = descriptor.value;

  // biome-ignore lint/suspicious/noExplicitAny: can be anything
  descriptor.value = function (...args: any[]) {
    const tracer = _trace.getTracer("beanstalk");
    return tracer.startActiveSpan(name, async (span) => {
      try {
        return await originalMethod.apply(this, args);
      } finally {
        span.end();
      }
    });
  };

  return descriptor;
}
