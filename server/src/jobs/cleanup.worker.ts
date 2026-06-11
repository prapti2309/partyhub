import { logger } from "@/utils/logger";

export function startCleanupWorker() {
  logger.info("🧹 Mock Cleanup Worker initialized and waiting for jobs");
}

export async function scheduleCleanupJobs() {
  logger.info("🧹 Scheduled database cleaner cron cycles");
}
