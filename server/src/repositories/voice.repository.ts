// src/repositories/voice.repository.ts
import { redisClient } from '@/config/redis';

/**
 * Redis‑backed storage for voice session state.
 * We keep a per‑room set of participant socket IDs and a map of
 * peer connection identifiers. This mirrors the pattern used for
 * presence and chat.
 */
export const voiceRepository = {
  /** Add a participant socket to a voice room */
  async addParticipant(roomId: string, socketId: string): Promise<void> {
    const client = redisClient;
    if (!client) return;
    const key = `voice:room:${roomId}:participants`;
    await client.sAdd(key, socketId);
    // Keep participants set alive while the voice call is active
    await client.expire(key, 60 * 60); // 1 hour TTL
  },

  /** Remove a participant socket from a voice room */
  async removeParticipant(roomId: string, socketId: string): Promise<void> {
    const client = redisClient;
    if (!client) return;
    const key = `voice:room:${roomId}:participants`;
    await client.sRem(key, socketId);
  },

  /** Get all participant socket IDs for a voice room */
  async getParticipants(roomId: string): Promise<string[]> {
    const client = redisClient;
    if (!client) return [];
    const key = `voice:room:${roomId}:participants`;
    return await client.sMembers(key);
  },

  /** Store the last SDP offer/answer for a socket – useful for ICE restarts */
  async setLastSdp(roomId: string, socketId: string, sdp: string): Promise<void> {
    const client = redisClient;
    if (!client) return;
    const key = `voice:room:${roomId}:sdp:${socketId}`;
    await client.set(key, sdp, { EX: 60 * 5 }); // 5 min TTL
  },

  async getLastSdp(roomId: string, socketId: string): Promise<string | null> {
    const client = redisClient;
    if (!client) return null;
    const key = `voice:room:${roomId}:sdp:${socketId}`;
    return await client.get(key);
  },
};
