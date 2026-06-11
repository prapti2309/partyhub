"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = void 0;
const logger_1 = require("../utils/logger");
const env_1 = require("../config/env");
const errorHandler = (err, req, res, _next) => {
    const statusCode = err.statusCode || 500;
    const message = err.message || "Internal Server Error";
    logger_1.logger.error(`[Error Trace ID: ${req.id || "system"}] | ${message}`, {
        stack: err.stack,
        isOperational: err.isOperational,
        path: req.originalUrl,
    });
    if (env_1.env.NODE_ENV === "development") {
        res.status(statusCode).json({
            status: "error",
            message,
            stack: err.stack,
            error: err,
        });
        return;
    }
    if (err.isOperational) {
        res.status(statusCode).json({
            status: "fail",
            message,
        });
        return;
    }
    res.status(500).json({
        status: "error",
        message: "Critical internal issue occurred.",
    });
};
exports.errorHandler = errorHandler;
