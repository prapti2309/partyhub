import pino from "pino";
import { env } from "@/config/env";

const pinoLogger = pino({
  level: env.NODE_ENV === "development" ? "debug" : "info",
  transport: env.NODE_ENV === "development" ? {
    target: "pino-pretty",
    options: {
      colorize: true,
      translateTime: "yyyy-mm-dd HH:MM:ss Z",
      ignore: "pid,hostname",
    },
  } : undefined,
});

export const logger = {
  info: (msg: string, meta?: object) => pinoLogger.info(meta || {}, msg),
  debug: (msg: string, meta?: object) => pinoLogger.debug(meta || {}, msg),
  warn: (msg: string, meta?: object) => pinoLogger.warn(meta || {}, msg),
  error: (msg: string, meta?: object) => pinoLogger.error(meta || {}, msg),
};
export type Logger = typeof logger;
