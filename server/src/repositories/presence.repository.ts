// src/repositories/presence.repository.ts
import { redisClient } from '@/config/redis';

const USER_STATUS_PREFIX = 'presence:user:';
const TYPING_PREFIX = 'typing:room:'; // set of userIds typing in room
const UNREAD_PREFIX = 'unread:room:'; // hash per user

export const presenceRepository = {
  // Participant management (already exists in original file, re‑exported here for completeness)
  async addParticipant(roomId: string, userId: string): Promise<void> {
    const client = redisClient;
    if (!client) return;
    await client.sAdd(`room:participants:${roomId}`, userId);
  },
  async removeParticipant(roomId: string, userId: string): Promise<void> {
    const client = redisClient;
    if (!client) return;
    await client.sRem(`room:participants:${roomId}`, userId);
  },
  async getParticipants(roomId: string): Promise<string[]> {
    const client = redisClient;
    if (!client) return [];
    return await client.sMembers(`room:participants:${roomId}`);
  },

  // ---------- Presence status ----------
  async setUserStatus(userId: string, status: string, device?: string, ttlSeconds = 30): Promise<void> {
    const client = redisClient;
    if (!client) return;
    const payload = JSON.stringify({ status, device, ts: Date.now() });
    await client.set(`${USER_STATUS_PREFIX}${userId}`, payload, { EX: ttlSeconds });
  },
  async getUserStatus(userId: string): Promise<{ status: string; device?: string; ts: number } | null> {
    const client = redisClient;
    if (!client) return null;
    const raw = await client.get(`${USER_STATUS_PREFIX}${userId}`);
    if (!raw) return null;
    try {
      return JSON.parse(raw);
    } catch {
      return null;
    }
  },

  // ---------- Typing ----------
  async addTypingUser(roomId: string, userId: string, ttl = 5): Promise<void> {
    const client = redisClient;
    if (!client) return;
    const key = `${TYPING_PREFIX}${roomId}`;
    await client.hSet(key, { [userId]: Date.now().toString() });
    await client.expire(key, ttl);
  },
  async removeTypingUser(roomId: string, userId: string): Promise<void> {
    const client = redisClient;
    if (!client) return;
    await client.hDel(`${TYPING_PREFIX}${roomId}`, userId);
  },
  async getTypingUsers(roomId: string): Promise<string[]> {
    const client = redisClient;
    if (!client) return [];
    return await client.hKeys(`${TYPING_PREFIX}${roomId}`);
  },

  // ---------- Unread counters ----------
  async incUnread(roomId: string, userId: string): Promise<void> {
    const client = redisClient;
    if (!client) return;
    const key = `${UNREAD_PREFIX}${roomId}:user:${userId}`;
    await client.incr(key);
    // keep for long term (30 days)
    await client.expire(key, 60 * 60 * 24 * 30);
  },
  async resetUnread(roomId: string, userId: string): Promise<void> {
    const client = redisClient;
    if (!client) return;
    await client.set(`${UNREAD_PREFIX}${roomId}:user:${userId}`, '0');
  },
  async getUnread(roomId: string, userId: string): Promise<number> {
    const client = redisClient;
    if (!client) return 0;
    const val = await client.get(`${UNREAD_PREFIX}${roomId}:user:${userId}`);
    return val ? parseInt(val, 10) : 0;
  },
};
