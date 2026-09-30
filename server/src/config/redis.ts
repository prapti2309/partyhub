import { createClient, RedisClientType } from "redis";
import { env } from "./env";
import { logger } from "@/utils/logger";

export let redisClient: RedisClientType;

export async function connectRedis() {
  redisClient = createClient({
    url: env.REDIS_URL,
  });

  redisClient.on("error", (err) => logger.error("❌ Redis client connection failure", { err }));
  redisClient.on("connect", () => logger.info("🔌 Redis client connecting..."));
  redisClient.on("ready", () => logger.info("✅ Redis client connection successful"));

  redisClient.connect().catch((err) => {
    logger.error("❌ Initial Redis connection failure", { err });
  });
}

export async function disconnectRedis() {
  if (redisClient) {
    await redisClient.quit();
  }
}
