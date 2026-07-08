import { redisClient } from "@/config/redis";

export const redisRepository = {
  async setWithTTL(key: string, value: string, ttlSeconds: number): Promise<void> {
    const client = redisClient;
    if (!client) return;
    await client.setEx(key, ttlSeconds, value);
  },

  async get(key: string): Promise<string | null> {
    const client = redisClient;
    if (!client) return null;
    return await client.get(key);
  },

  async del(key: string): Promise<void> {
    const client = redisClient;
    if (!client) return;
    await client.del(key);
  },

  async hSet(key: string, field: string, value: string): Promise<void> {
    const client = redisClient;
    if (!client) return;
    await client.hSet(key, field, value);
  },

  async hGet(key: string, field: string): Promise<string | undefined> {
    const client = redisClient;
    if (!client) return undefined;
    return await client.hGet(key, field);
  },

  async hGetAll(key: string): Promise<Record<string, string>> {
    const client = redisClient;
    if (!client) return {};
    return await client.hGetAll(key);
  },
  
  async hDel(key: string, field: string): Promise<void> {
    const client = redisClient;
    if (!client) return;
    await client.hDel(key, field);
  },

  async expire(key: string, ttlSeconds: number): Promise<void> {
    const client = redisClient;
    if (!client) return;
    await client.expire(key, ttlSeconds);
  }
};
