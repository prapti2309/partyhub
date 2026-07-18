// server/src/middleware/tracing.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { logger } from '../logging/logger';

export function tracingMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();
  const ip = req.ip || req.socket.remoteAddress;

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const payloadSize = req.headers['content-length'] ? parseInt(req.headers['content-length'], 10) : 0;

    logger.info(`HTTP request handled`, {
      method: req.method,
      path: req.originalUrl || req.url,
      statusCode: res.statusCode,
      durationMs,
      payloadSize,
      ip,
      service: 'HttpServer',
    });

    if (durationMs > 500) {
      logger.warn(`Slow HTTP Request detected`, {
        method: req.method,
        path: req.originalUrl || req.url,
        durationMs,
      });
    }
  });

  next();
}
