import { getRedisClient } from "@/config/redis";
import { logger } from "@/utils/logger";

const SOCKET_PREFIX = "socket:";

export interface SocketRegistryInfo {
  userId: string;
  roomId?: string;
  joinTime: number;
  lastHeartbeat: number;
}

export const socketRegistry = {
  async registerSocket(socketId: string, userId: string): Promise<void> {
    const client = getRedisClient();
    if (!client) return;

    const data: SocketRegistryInfo = {
      userId,
      joinTime: Date.now(),
      lastHeartbeat: Date.now(),
    };

    await client.hSet(`${SOCKET_PREFIX}${socketId}`, Object.entries(data).flat());
    await client.expire(`${SOCKET_PREFIX}${socketId}`, 60 * 60 * 24); // 24 hours TTL
  },

  async updateRoom(socketId: string, roomId: string | null): Promise<void> {
    const client = getRedisClient();
    if (!client) return;

    if (roomId) {
      await client.hSet(`${SOCKET_PREFIX}${socketId}`, "roomId", roomId);
    } else {
      await client.hDel(`${SOCKET_PREFIX}${socketId}`, "roomId");
    }
  },

  async getSocket(socketId: string): Promise<SocketRegistryInfo | null> {
    const client = getRedisClient();
    if (!client) return null;

    const data = await client.hGetAll(`${SOCKET_PREFIX}${socketId}`);
    if (!data || Object.keys(data).length === 0) return null;

    return {
      userId: data.userId,
      roomId: data.roomId,
      joinTime: parseInt(data.joinTime, 10),
      lastHeartbeat: parseInt(data.lastHeartbeat, 10),
    };
  },

  async removeSocket(socketId: string): Promise<void> {
    const client = getRedisClient();
    if (!client) return;
    await client.del(`${SOCKET_PREFIX}${socketId}`);
  },

  async updateHeartbeat(socketId: string): Promise<void> {
    const client = getRedisClient();
    if (!client) return;
    await client.hSet(`${SOCKET_PREFIX}${socketId}`, "lastHeartbeat", Date.now().toString());
  }
};
