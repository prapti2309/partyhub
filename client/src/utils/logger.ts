// src/utils/logger.ts

/**
 * Lightweight logger utility for the client.
 * Wraps console methods with optional prefixes for easier filtering.
 */
function createLogger(prefix: string) {
  return {
    info: (...args: unknown[]) => console.log(`[${prefix}]`, ...args),
    warn: (...args: unknown[]) => console.warn(`[${prefix}]`, ...args),
    error: (...args: unknown[]) => console.error(`[${prefix}]`, ...args),
    debug: (...args: unknown[]) => {
      if (process.env.NODE_ENV === "development") {
        console.debug(`[${prefix}]`, ...args);
      }
    },
  };
}

export const logger = createLogger("WatchParty");
