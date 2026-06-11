import { redisClient } from "@/config/redis";
import { SessionMetadata } from "@/types/auth.types";
import { logger } from "@/utils/logger";

const SESSION_TTL = 7 * 24 * 60 * 60; // 7 days in seconds
const ROTATION_TTL = 24 * 60 * 60;   // 24 hours in seconds

export const sessionRepository = {
  async createSession(sessionId: string, metadata: SessionMetadata): Promise<void> {
    try {
      const sessionKey = `session:${sessionId}`;
      const userSessionsKey = `user:sessions:${metadata.userId}`;

      await redisClient.set(sessionKey, JSON.stringify(metadata), {
        EX: SESSION_TTL,
      });

      await redisClient.sAdd(userSessionsKey, sessionId);
      await redisClient.expire(userSessionsKey, SESSION_TTL);
    } catch (err) {
      logger.error("Redis createSession error", { err });
    }
  },

  async getSession(sessionId: string): Promise<SessionMetadata | null> {
    try {
      const data = await redisClient.get(`session:${sessionId}`);
      if (!data) return null;
      return JSON.parse(data) as SessionMetadata;
    } catch (err) {
      logger.error("Redis getSession error", { err });
      return null;
    }
  },

  async updateSessionLastSeen(sessionId: string): Promise<void> {
    try {
      const sessionKey = `session:${sessionId}`;
      const data = await redisClient.get(sessionKey);
      if (data) {
        const metadata = JSON.parse(data) as SessionMetadata;
        metadata.lastSeen = new Date().toISOString();
        await redisClient.set(sessionKey, JSON.stringify(metadata), {
          KEEPTTL: true,
        });
      }
    } catch (err) {
      logger.error("Redis updateSessionLastSeen error", { err });
    }
  },

  async deleteSession(userId: string, sessionId: string): Promise<void> {
    try {
      await redisClient.del(`session:${sessionId}`);
      await redisClient.sRem(`user:sessions:${userId}`, sessionId);
    } catch (err) {
      logger.error("Redis deleteSession error", { err });
    }
  },

  async deleteAllSessionsForUser(userId: string): Promise<void> {
    try {
      const userSessionsKey = `user:sessions:${userId}`;
      const sessionIds = await redisClient.sMembers(userSessionsKey);

      const keysToDelete = sessionIds.map((id) => `session:${id}`);
      if (keysToDelete.length > 0) {
        await redisClient.del(keysToDelete);
      }
      await redisClient.del(userSessionsKey);
    } catch (err) {
      logger.error("Redis deleteAllSessionsForUser error", { err });
    }
  },

  async logRotatedToken(oldJti: string, newJti: string): Promise<void> {
    try {
      await redisClient.set(`token:rotated:${oldJti}`, newJti, {
        EX: ROTATION_TTL,
      });
    } catch (err) {
      logger.error("Redis logRotatedToken error", { err });
    }
  },

  async getRotatedToken(oldJti: string): Promise<string | null> {
    try {
      return await redisClient.get(`token:rotated:${oldJti}`);
    } catch (err) {
      logger.error("Redis getRotatedToken error", { err });
      return null;
    }
  },

  async listActiveSessions(userId: string): Promise<SessionMetadata[]> {
    try {
      const userSessionsKey = `user:sessions:${userId}`;
      const sessionIds = await redisClient.sMembers(userSessionsKey);
      if (sessionIds.length === 0) return [];

      const sessionKeys = sessionIds.map((id) => `session:${id}`);
      const rawSessions = await redisClient.mGet(sessionKeys);

      const activeSessions: SessionMetadata[] = [];
      for (let i = 0; i < rawSessions.length; i++) {
        const data = rawSessions[i];
        if (data) {
          activeSessions.push(JSON.parse(data) as SessionMetadata);
        } else {
          // Stale session ID in set, remove it
          await redisClient.sRem(userSessionsKey, sessionIds[i]);
        }
      }
      return activeSessions;
    } catch (err) {
      logger.error("Redis listActiveSessions error", { err });
      return [];
    }
  },
};
