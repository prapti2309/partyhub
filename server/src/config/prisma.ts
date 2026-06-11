import { PrismaClient } from "@prisma/client";
import { logger } from "@/utils/logger";

export const prisma = new PrismaClient({
  log: [
    { emit: "event", level: "query" },
    { emit: "stdout", level: "info" },
    { emit: "stdout", level: "warn" },
    { emit: "stdout", level: "error" },
  ],
});

prisma.$on("query", (e) => {
  logger.debug(`[Prisma DB Query] duration: ${e.duration}ms | query: ${e.query}`);
});
