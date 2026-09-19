"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
// server/src/logging/logger.ts
const pino_1 = __importDefault(require("pino"));
const request_id_1 = require("./request-id");
const isDev = process.env.NODE_ENV === 'development';
const pinoLogger = (0, pino_1.default)({
    level: process.env.LOG_LEVEL || (isDev ? 'debug' : 'info'),
    formatters: {
        level: (label) => {
            return { level: label };
        },
    },
    timestamp: pino_1.default.stdTimeFunctions.isoTime,
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
exports.logger = {
    info: (msg, meta) => log('info', msg, meta),
    warn: (msg, meta) => log('warn', msg, meta),
    error: (msg, meta) => log('error', msg, meta),
    debug: (msg, meta) => log('debug', msg, meta),
    trace: (msg, meta) => log('trace', msg, meta),
};
function log(level, msg, meta) {
    const store = (0, request_id_1.getContextStore)();
    const combinedMeta = {
        ...store,
        ...meta,
        service: meta?.service || 'WatchPartyBackend',
    };
    pinoLogger[level](combinedMeta, msg);
}
