// server/src/logging/request-id.ts
import { AsyncLocalStorage } from 'async_hooks';

export interface RequestStore {
  requestId: string;
  userId?: string;
  socketId?: string;
  roomId?: string;
}

export const requestContext = new AsyncLocalStorage<RequestStore>();

export function getRequestId(): string | undefined {
  return requestContext.getStore()?.requestId;
}

export function getContextStore(): RequestStore | undefined {
  return requestContext.getStore();
}
