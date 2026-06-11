// src/index.ts
import http from "http";
import { createApp } from "./app";
import { initSocketServer } from "./sockets";
import { connectRedis, disconnectRedis } from "./config/redis";
import prisma from "./config/database";
import { startEmailWorker } from "./jobs/email.worker";
import { startCleanupWorker, scheduleCleanupJobs } from "./jobs/cleanup.worker";
import { startNotificationWorker } from "./jobs/notification.worker";
import { env } from "./config/env";
import { logger } from "./utils/logger";

async function bootstrap() {
  logger.info("WatchParty backend starting...", { env: env.NODE_ENV });

  // ─── 1. Connect infrastructure ────────────────────────────────────────────
  await connectRedis();
  logger.info("Redis connected");

  await prisma.$connect();
  logger.info("PostgreSQL connected");

  // ─── 2. Create Express app ────────────────────────────────────────────────
  const app = createApp();
  const httpServer = http.createServer(app);

  // ─── 3. Attach Socket.IO ─────────────────────────────────────────────────
  initSocketServer(httpServer);
  logger.info("Socket.IO attached");

  // ─── 4. Start background workers ─────────────────────────────────────────
  startEmailWorker();
  startCleanupWorker();
  startNotificationWorker();
  await scheduleCleanupJobs();
  logger.info("Background workers started");

  // ─── 5. Start HTTP server ─────────────────────────────────────────────────
  httpServer.listen(env.PORT, () => {
    logger.info(`🚀 Server listening on port ${env.PORT}`, {
      port: env.PORT,
      nodeEnv: env.NODE_ENV,
    });
  });

  // ─── 6. Graceful shutdown ─────────────────────────────────────────────────
  const shutdown = async (signal: string) => {
    logger.info(`${signal} received — graceful shutdown started`);

    httpServer.close(async () => {
      logger.info("HTTP server closed");

      await prisma.$disconnect();
      logger.info("DB disconnected");

      await disconnectRedis();
      logger.info("Redis disconnected");

      logger.info("Shutdown complete");
      process.exit(0);
    });

    // Force kill after 15 seconds
    setTimeout(() => {
      logger.error("Forced shutdown after timeout");
      process.exit(1);
    }, 15_000);
  };

  process.on("SIGTERM", () => shutdown("SIGTERM"));
  process.on("SIGINT", () => shutdown("SIGINT"));

  process.on("uncaughtException", (err) => {
    logger.error("uncaughtException", { message: err.message, stack: err.stack });
    process.exit(1);
  });

  process.on("unhandledRejection", (reason) => {
    logger.error("unhandledRejection", { reason });
    process.exit(1);
  });
}

bootstrap().catch((err) => {
  console.error("Bootstrap failed:", err);
  process.exit(1);
});
