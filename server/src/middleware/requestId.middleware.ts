// server/src/middleware/requestId.middleware.ts
import { Request, Response, NextFunction } from 'express';
import { crypto } from 'crypto';
import { requestContext } from '../logging/request-id';

export function requestIdMiddleware(req: Request, res: Response, next: NextFunction) {
  const requestId = (req.headers['x-request-id'] as string) || crypto.randomUUID();
  res.setHeader('X-Request-ID', requestId);

  requestContext.run({ requestId }, () => {
    next();
  });
}
