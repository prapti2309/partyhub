import { getRedisClient } from "@/config/redis";

const ROOM_PARTICIPANTS_PREFIX = "room:participants:";

export const presenceRepository = {
  async addParticipant(roomId: string, userId: string): Promise<void> {
    const client = getRedisClient();
    if (!client) return;
    await client.sAdd(`${ROOM_PARTICIPANTS_PREFIX}${roomId}`, userId);
  },

  async removeParticipant(roomId: string, userId: string): Promise<void> {
    const client = getRedisClient();
    if (!client) return;
    await client.sRem(`${ROOM_PARTICIPANTS_PREFIX}${roomId}`, userId);
  },

  async getParticipants(roomId: string): Promise<string[]> {
    const client = getRedisClient();
    if (!client) return [];
    return await client.sMembers(`${ROOM_PARTICIPANTS_PREFIX}${roomId}`);
  },

  async clearRoomParticipants(roomId: string): Promise<void> {
    const client = getRedisClient();
    if (!client) return;
    await client.del(`${ROOM_PARTICIPANTS_PREFIX}${roomId}`);
  }
};
