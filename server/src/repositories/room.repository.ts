import { redisClient } from "@/config/redis";
import { logger } from "@/utils/logger";

export interface Participant {
  userId: string;
  username: string;
  role: "OWNER" | "MODERATOR" | "PARTICIPANT";
  joinedAt: string;
  online: boolean;
  socketIds: string[];
}

export interface SocketPresence {
  userId: string;
  roomId: string;
  connectedAt: string;
}

export class RoomRepository {
  /**
   * Initialize room state in Redis.
   */
  async createRoomState(roomId: string, data: { ownerId: string; code: string; name: string }): Promise<void> {
    await redisClient.hSet(`room:${roomId}`, {
      ownerId: data.ownerId,
      code: data.code,
      name: data.name,
      createdAt: new Date().toISOString(),
    });
  }

  /**
   * Get room metadata from Redis.
   */
  async getRoomState(roomId: string): Promise<Record<string, string> | null> {
    const data = await redisClient.hGetAll(`room:${roomId}`);
    if (!data || Object.keys(data).length === 0) return null;
    return data;
  }

  /**
   * Update room metadata in Redis (e.g. ownerId).
   */
  async updateRoomState(roomId: string, data: Partial<{ ownerId: string; name: string }>): Promise<void> {
    const updates: Record<string, string> = {};
    if (data.ownerId) updates.ownerId = data.ownerId;
    if (data.name) updates.name = data.name;
    
    if (Object.keys(updates).length > 0) {
      await redisClient.hSet(`room:${roomId}`, updates);
    }
  }

  /**
   * Delete room state from Redis.
   */
  async deleteRoomState(roomId: string): Promise<void> {
    await redisClient.del(`room:${roomId}`);
    await redisClient.del(`room:${roomId}:participants`);
  }

  /**
   * Add or update participant in room.
   */
  async saveParticipant(roomId: string, participant: Participant): Promise<void> {
    await redisClient.hSet(
      `room:${roomId}:participants`,
      participant.userId,
      JSON.stringify(participant)
    );
  }

  /**
   * Retrieve a single participant in a room.
   */
  async getParticipant(roomId: string, userId: string): Promise<Participant | null> {
    const data = await redisClient.hGet(`room:${roomId}:participants`, userId);
    if (!data) return null;
    try {
      return JSON.parse(data) as Participant;
    } catch (err) {
      logger.error("Failed to parse participant data", { err, data });
      return null;
    }
  }

  /**
   * Remove a participant from the room list.
   */
  async removeParticipant(roomId: string, userId: string): Promise<void> {
    await redisClient.hDel(`room:${roomId}:participants`, userId);
  }

  /**
   * List all participants in a room.
   */
  async listParticipants(roomId: string): Promise<Participant[]> {
    const all = await redisClient.hGetAll(`room:${roomId}:participants`);
    if (!all) return [];
    
    const participants: Participant[] = [];
    for (const val of Object.values(all)) {
      try {
        participants.push(JSON.parse(val));
      } catch (err) {
        logger.error("Failed to parse participant item", { err });
      }
    }
    return participants;
  }

  /**
   * Track presence status of user globally.
   */
  async setUserPresence(userId: string, status: "online" | "offline"): Promise<void> {
    await redisClient.set(`presence:${userId}`, status);
  }

  /**
   * Get presence status of user.
   */
  async getUserPresence(userId: string): Promise<string | null> {
    return await redisClient.get(`presence:${userId}`);
  }

  /**
   * Track socket ID mapping to user and room.
   */
  async setSocketPresence(socketId: string, presence: SocketPresence): Promise<void> {
    await redisClient.set(`socket:${socketId}`, JSON.stringify(presence), {
      EX: 24 * 60 * 60, // 24 hours expiry safety
    });
  }

  /**
   * Get socket presence details.
   */
  async getSocketPresence(socketId: string): Promise<SocketPresence | null> {
    const data = await redisClient.get(`socket:${socketId}`);
    if (!data) return null;
    try {
      return JSON.parse(data) as SocketPresence;
    } catch (err) {
      return null;
    }
  }

  /**
   * Remove socket presence mapping.
   */
  async removeSocketPresence(socketId: string): Promise<void> {
    await redisClient.del(`socket:${socketId}`);
  }

  /**
   * Update heartbeat timestamp for a user.
   */
  async updateHeartbeat(userId: string): Promise<void> {
    await redisClient.set(`heartbeat:${userId}`, Date.now().toString(), {
      EX: 60, // 60 seconds TTL
    });
  }

  /**
   * Retrieve heartbeat timestamp for a user.
   */
  async getHeartbeat(userId: string): Promise<string | null> {
    return await redisClient.get(`heartbeat:${userId}`);
  }

  /**
   * Delete heartbeat key for a user.
   */
  async removeHeartbeat(userId: string): Promise<void> {
    await redisClient.del(`heartbeat:${userId}`);
  }
}

export const roomRepository = new RoomRepository();
