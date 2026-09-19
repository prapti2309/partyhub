"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.traceOperation = traceOperation;
// server/src/logging/tracing.ts
const logger_1 = require("./logger");
async function traceOperation(name, operation, meta) {
    const start = process.hrtime.bigint();
    try {
        const result = await operation();
        const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
        logger_1.logger.info(`Operation ${name} completed successfully`, {
            ...meta,
            operation: name,
            durationMs,
        });
        return result;
    }
    catch (error) {
        const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
        logger_1.logger.error(`Operation ${name} failed`, {
            ...meta,
            operation: name,
            durationMs,
            error: error.message || error,
            stack: error.stack,
        });
        throw error;
    }
}
