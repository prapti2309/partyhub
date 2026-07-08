"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const http_1 = __importDefault(require("http"));
const app_1 = require("./app");
const sockets_1 = require("./sockets");
const redis_1 = require("./config/redis");
const prisma_1 = require("./config/prisma");
const env_1 = require("./config/env");
const logger_1 = require("./utils/logger");
const email_worker_1 = require("./jobs/email.worker");
const cleanup_worker_1 = require("./jobs/cleanup.worker");
const notification_worker_1 = require("./jobs/notification.worker");
const heartbeat_worker_1 = require("./jobs/heartbeat.worker");
async function bootstrap() {
    logger_1.logger.info(`WatchParty backend initialization. Environment: ${env_1.env.NODE_ENV}`);
    // 1. Connect storage infrastructures
    await (0, redis_1.connectRedis)();
    try {
        await prisma_1.prisma.$connect();
        logger_1.logger.info("Database connection mappings loaded successfully");
    }
    catch (err) {
        logger_1.logger.warn("⚠️ Database connection failed on boot. Prisma will retry on query execution.", { err });
    }
    // 2. Build Express API Routing
    const app = (0, app_1.createApp)();
    const httpServer = http_1.default.createServer(app);
    // 3. Attach Socket Cluster Layer
    (0, sockets_1.initSocketServer)(httpServer);
    // 4. Trigger Workers
    (0, email_worker_1.startEmailWorker)();
    (0, cleanup_worker_1.startCleanupWorker)();
    (0, notification_worker_1.startNotificationWorker)();
    (0, heartbeat_worker_1.startHeartbeatWorker)();
    await (0, cleanup_worker_1.scheduleCleanupJobs)();
    // 5. Port Listening
    httpServer.listen(env_1.env.PORT, () => {
        logger_1.logger.info(`🚀 Server running on port ${env_1.env.PORT} - Address: http://localhost:${env_1.env.PORT}`);
    });
    // 6. Graceful Shutdown Lifecycle
    const handleShutdown = async (signal) => {
        logger_1.logger.info(`⚠️ Received ${signal}. Initializing graceful shutdown cycle...`);
        httpServer.close(async () => {
            logger_1.logger.info("💤 HTTP and WebSockets connections disconnected");
            try {
                await prisma_1.prisma.$disconnect();
                logger_1.logger.info("🔌 Postgres connection released");
            }
            catch (err) {
                logger_1.logger.error("Error disconnecting Postgres", { err });
            }
            try {
                await (0, redis_1.disconnectRedis)();
                logger_1.logger.info("🔌 Redis connection released");
            }
            catch (err) {
                logger_1.logger.error("Error disconnecting Redis", { err });
            }
            logger_1.logger.info("👋 Graceful shutdown procedure complete. Exit code 0");
            process.exit(0);
        });
        // Force terminate if sockets/DB connection releases hang
        setTimeout(() => {
            logger_1.logger.error("🚨 Graceful shutdown timeout limit reached. Forced termination.");
            process.exit(1);
        }, 10000);
    };
    process.on("SIGINT", () => handleShutdown("SIGINT"));
    process.on("SIGTERM", () => handleShutdown("SIGTERM"));
    process.on("uncaughtException", (err) => {
        logger_1.logger.error("🔥 Uncaught Exception caught at boot execution", { message: err.message, stack: err.stack });
        process.exit(1);
    });
    process.on("unhandledRejection", (reason) => {
        logger_1.logger.error("🔥 Unhandled Promise Rejection caught at boot execution", { reason: String(reason) });
        process.exit(1);
    });
}
bootstrap().catch((err) => {
    logger_1.logger.error("❌ Server bootstrap failure", { err });
    process.exit(1);
});
