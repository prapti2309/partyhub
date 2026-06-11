"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.createApp = createApp;
const express_1 = __importDefault(require("express"));
const cors_1 = __importDefault(require("cors"));
const helmet_1 = __importDefault(require("helmet"));
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const requestId_middleware_1 = require("./middleware/requestId.middleware");
const error_middleware_1 = require("./middleware/error.middleware");
const prisma_1 = require("./config/prisma");
const redis_1 = require("./config/redis");
function createApp() {
    const app = (0, express_1.default)();
    // Basic API Rate Limiting protection
    const limiter = (0, express_rate_limit_1.default)({
        windowMs: 15 * 60 * 1000, // 15 minutes
        max: 100, // Limit each IP to 100 requests per window
        message: "Too many requests from this client IP. Rate-limiting enforced.",
    });
    app.use((0, helmet_1.default)());
    app.use((0, cors_1.default)({ origin: "*", credentials: true }));
    app.use(express_1.default.json());
    app.use(express_1.default.urlencoded({ extended: true }));
    app.use(requestId_middleware_1.requestIdMiddleware);
    app.use("/api/", limiter);
    // Health Route Version 1
    app.get("/api/v1/health", async (_req, res) => {
        let pgStatus = "disconnected";
        let redisStatus = "disconnected";
        try {
            await prisma_1.prisma.$executeRaw `SELECT 1`;
            pgStatus = "connected";
        }
        catch (e) { }
        try {
            if (redis_1.redisClient.isReady) {
                redisStatus = "connected";
            }
        }
        catch (e) { }
        const status = pgStatus === "connected" && redisStatus === "connected" ? "ok" : "degraded";
        res.status(status === "ok" ? 200 : 503).json({
            status,
            postgres: pgStatus,
            redis: redisStatus,
            uptime: process.uptime(),
            timestamp: new Date().toISOString(),
        });
    });
    app.use(error_middleware_1.errorHandler);
    return app;
}
