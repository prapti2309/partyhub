// server/src/middleware/requestId.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { randomUUID } from 'crypto';
import { requestContext } from '../logging/request-id';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = (req.headers['x-request-id'] as string) || randomUUID();
  req.id = requestId;
  res.setHeader('X-Request-ID', requestId);

  requestContext.run({ requestId }, () => {
    next();
  });
}
