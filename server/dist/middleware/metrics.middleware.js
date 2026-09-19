"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.metricsMiddleware = metricsMiddleware;
const api_monitor_1 = require("../monitoring/api.monitor");
function metricsMiddleware(req, res, next) {
    const start = process.hrtime.bigint();
    res.on('finish', () => {
        const durationMs = Number(process.hrtime.bigint() - start) / 1e6;
        const path = req.route ? req.route.path : req.path;
        api_monitor_1.apiMonitor.recordRequest(req.method, path, res.statusCode, durationMs);
    });
    next();
}
