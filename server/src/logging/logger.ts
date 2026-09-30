// server/src/logging/logger.ts
import pino from 'pino';
import { getContextStore } from './request-id';

const isDev = process.env.NODE_ENV === 'development';

const pinoLogger = pino({
  level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
  formatters: {
    level: (label) => {
      return { level: label };
    },
  },
  timestamp: pino.stdTimeFunctions.isoTime,
  transport: isDev
    ? {
        target: 'pino-pretty',
        options: {
          colorize: true,
          translateTime: 'SYS:standard',
          ignore: 'pid,hostname',
        },
      }
    : undefined,
});

export const logger = {
  info: (msg: string, meta?: any) => log('info', msg, meta),
  warn: (msg: string, meta?: any) => log('warn', msg, meta),
  error: (msg: string, meta?: any) => log('error', msg, meta),
  debug: (msg: string, meta?: any) => log('debug', msg, meta),
  trace: (msg: string, meta?: any) => log('trace', msg, meta),
};

function log(level: 'info' | 'warn' | 'error' | 'debug' | 'trace', msg: string, meta?: any) {
  const store = getContextStore();
  const combinedMeta = {
    ...store,
    ...meta,
    service: meta?.service || 'WatchPartyBackend',
  };
  pinoLogger[level](combinedMeta, msg);
}
