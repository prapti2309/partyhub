"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.logger = void 0;
const pino_1 = __importDefault(require("pino"));
const env_1 = require("../config/env");
const pinoLogger = (0, pino_1.default)({
    level: env_1.env.NODE_ENV === "development" ? "debug" : "info",
    transport: env_1.env.NODE_ENV === "development" ? {
        target: "pino-pretty",
        options: {
            colorize: true,
            translateTime: "yyyy-mm-dd HH:MM:ss Z",
            ignore: "pid,hostname",
        },
    } : undefined,
});
exports.logger = {
    info: (msg, meta) => pinoLogger.info(meta || {}, msg),
    debug: (msg, meta) => pinoLogger.debug(meta || {}, msg),
    warn: (msg, meta) => pinoLogger.warn(meta || {}, msg),
    error: (msg, meta) => pinoLogger.error(meta || {}, msg),
};
