// server/src/logging/tracing.ts
import { logger } from './logger';
import { requestContext } from './request-id';

export async function traceOperation<T>(
  name: string,
  operation: () => Promise<T>,
  meta?: any
): Promise<T> {
  const start = process.hrtime.bigint();
  try {
    const result = await operation();
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    logger.info(`Operation ${name} completed successfully`, {
      ...meta,
      operation: name,
      durationMs,
    });
    return result;
  } catch (error: any) {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    logger.error(`Operation ${name} failed`, {
      ...meta,
      operation: name,
      durationMs,
      error: error.message || error,
      stack: error.stack,
    });
    throw error;
  }
}
