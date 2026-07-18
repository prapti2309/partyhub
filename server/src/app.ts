import express from "express";
import cors from "cors";
import helmet from "helmet";
import rateLimit from "express-rate-limit";
import cookieParser from "cookie-parser";
import { requestIdMiddleware } from "./middleware/requestId.middleware";
import { tracingMiddleware } from "./middleware/tracing.middleware";
import { metricsMiddleware } from "./middleware/metrics.middleware";
import { errorHandler } from "./middleware/error.middleware";
import authRouter from "./routes/auth.routes";
import roomRouter from "./routes/room.routes";
import healthRouter from "./health/health.controller";
import monitoringRouter from "./dashboard/monitoring.routes";

export function createApp() {
  const app = express();

  // Basic API Rate Limiting protection
  const limiter = rateLimit({
    windowMs: 15 * 60 * 1000, // 15 minutes
    max: 100, // Limit each IP to 100 requests per window
    message: "Too many requests from this client IP. Rate-limiting enforced.",
  });

  app.use(helmet());
  app.use(cors({ origin: "*", credentials: true }));
  app.use(express.json());
  app.use(express.urlencoded({ extended: true }));
  app.use(cookieParser());

  app.use(requestIdMiddleware);
  app.use(tracingMiddleware);
  app.use(metricsMiddleware);
  app.use("/api/", limiter);

  // Mount Auth Router
  app.use("/api/v1/auth", authRouter);
  app.use("/api/v1/rooms", roomRouter);
  app.use("/api/v1/monitoring", monitoringRouter);
  app.use("/", healthRouter);

  // Health Route Version 1
  app.get("/api/v1/health", async (_req, res) => {
    let pgStatus = "disconnected";
    let redisStatus = "disconnected";

    try {
      await prisma.$executeRaw`SELECT 1`;
      pgStatus = "connected";
    } catch (e) {}

    try {
      if (redisClient.isReady) {
        redisStatus = "connected";
      }
    } catch (e) {}

    const status = pgStatus === "connected" && redisStatus === "connected" ? "ok" : "degraded";

    res.status(status === "ok" ? 200 : 503).json({
      status,
      postgres: pgStatus,
      redis: redisStatus,
      uptime: process.uptime(),
      timestamp: new Date().toISOString(),
    });
  });

  app.use(errorHandler);

  return app;
}
