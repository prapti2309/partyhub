import { Request, Response, NextFunction } from "express";
import { logger } from "@/utils/logger";
import { env } from "@/config/env";

export const errorHandler = (
  err: Error & { statusCode?: number; isOperational?: boolean },
  req: Request,
  res: Response,
  _next: NextFunction
) => {
  const statusCode = err.statusCode || 500;
  const message = err.message || "Internal Server Error";

  logger.error(`[Error Trace ID: ${req.id || "system"}] | ${message}`, {
    stack: err.stack,
    isOperational: err.isOperational,
    path: req.originalUrl,
  });

  if (env.NODE_ENV === "development") {
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
