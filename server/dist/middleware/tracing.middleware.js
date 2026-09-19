"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.tracingMiddleware = tracingMiddleware;
const logger_1 = require("../logging/logger");
function tracingMiddleware(req, res, next) {
    const start = process.hrtime.bigint();
    const ip = req.ip || req.socket.remoteAddress;
    res.on('finish', () => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
        const payloadSize = req.headers['content-length'] ? parseInt(req.headers['content-length'], 10) : 0;
        logger_1.logger.info(`HTTP request handled`, {
            method: req.method,
            path: req.originalUrl || req.url,
            statusCode: res.statusCode,
            durationMs,
            payloadSize,
            ip,
            service: 'HttpServer',
        });
        if (durationMs > 500) {
            logger_1.logger.warn(`Slow HTTP Request detected`, {
                method: req.method,
                path: req.originalUrl || req.url,
                durationMs,
            });
        }
    });
    next();
}
