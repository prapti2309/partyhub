import http from "http";
import { createApp } from "./app";
import { initSocketServer } from "./sockets";
import { connectRedis, disconnectRedis } from "./config/redis";
import { prisma } from "./config/prisma";
import { env } from "./config/env";
import { logger } from "./utils/logger";
import { startEmailWorker } from "./jobs/email.worker";
import { startCleanupWorker, scheduleCleanupJobs } from "./jobs/cleanup.worker";
import { startNotificationWorker } from "./jobs/notification.worker";
import { startHeartbeatWorker } from "./jobs/heartbeat.worker";

async function bootstrap() {
  logger.info(`WatchParty backend initialization. Environment: ${env.NODE_ENV}`);

  // 1. Connect storage infrastructures
  await connectRedis();
  try {
    await prisma.$connect();
    logger.info("Database connection mappings loaded successfully");
  } catch (err) {
    logger.warn("⚠️ Database connection failed on boot. Prisma will retry on query execution.", { err });
  }

  // 2. Build Express API Routing
  const app = createApp();
  const httpServer = http.createServer(app);

  // 3. Attach Socket Cluster Layer
  initSocketServer(httpServer);

  // 4. Trigger Workers
  startEmailWorker();
  startCleanupWorker();
  startNotificationWorker();
  startHeartbeatWorker();
  await scheduleCleanupJobs();

  // 5. Port Listening
  httpServer.listen(env.PORT, () => {
    logger.info(`🚀 Server running on port ${env.PORT} - Address: http://localhost:${env.PORT}`);
  });

  // 6. Graceful Shutdown Lifecycle
  const handleShutdown = async (signal: string) => {
    logger.info(`⚠️ Received ${signal}. Initializing graceful shutdown cycle...`);

    httpServer.close(async () => {
      logger.info("💤 HTTP and WebSockets connections disconnected");

      try {
        await prisma.$disconnect();
        logger.info("🔌 Postgres connection released");
      } catch (err) {
        logger.error("Error disconnecting Postgres", { err });
      }

      try {
        await disconnectRedis();
        logger.info("🔌 Redis connection released");
      } catch (err) {
        logger.error("Error disconnecting Redis", { err });
      }

      logger.info("👋 Graceful shutdown procedure complete. Exit code 0");
      process.exit(0);
    });

    // Force terminate if sockets/DB connection releases hang
    setTimeout(() => {
      logger.error("🚨 Graceful shutdown timeout limit reached. Forced termination.");
      process.exit(1);
    }, 10000);
  };

  process.on("SIGINT", () => handleShutdown("SIGINT"));
  process.on("SIGTERM", () => handleShutdown("SIGTERM"));

  process.on("uncaughtException", (err) => {
    logger.error("🔥 Uncaught Exception caught at boot execution", { message: err.message, stack: err.stack });
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    logger.error("🔥 Unhandled Promise Rejection caught at boot execution", { reason: String(reason) });
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  logger.error("❌ Server bootstrap failure", { err });
  process.exit(1);
});
