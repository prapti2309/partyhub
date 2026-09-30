// server/src/middleware/metrics.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { apiMonitor } from '../monitoring/api.monitor';

export function metricsMiddleware(req: Request, res: Response, next: NextFunction) {
  const start = process.hrtime.bigint();

  res.on('finish', () => {
    const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
    const path = req.route ? req.route.path : req.path;
    apiMonitor.recordRequest(req.method, path, res.statusCode, durationMs);
  });

  next();
}
