import { redisRepository } from "./redis.repository";

const PLAYBACK_PREFIX = "room:playback:";

export interface PlaybackState {
  roomId: string;
  videoId?: string;
  playing: boolean;
  position: number;
  playbackRate: number;
  serverTimestamp: number;
  updatedBy: string;
  version: number;
}

export const playbackRepository = {
  async getPlaybackState(roomId: string): Promise<PlaybackState | null> {
    const data = await redisRepository.hGetAll(`${PLAYBACK_PREFIX}${roomId}`);
    if (!data || Object.keys(data).length === 0) {
      return null;
    }

    return {
      roomId: data.roomId,
      videoId: data.videoId,
      playing: data.playing === "true",
      position: parseFloat(data.position || "0"),
      playbackRate: parseFloat(data.playbackRate || "1"),
      serverTimestamp: parseInt(data.serverTimestamp || "0", 10),
      updatedBy: data.updatedBy,
      version: parseInt(data.version || "0", 10),
    };
  },

  async savePlaybackState(state: PlaybackState): Promise<void> {
    const key = `${PLAYBACK_PREFIX}${state.roomId}`;
    await redisRepository.hSet(key, "roomId", state.roomId);
    if (state.videoId) await redisRepository.hSet(key, "videoId", state.videoId);
    await redisRepository.hSet(key, "playing", state.playing ? "true" : "false");
    await redisRepository.hSet(key, "position", state.position.toString());
    await redisRepository.hSet(key, "playbackRate", state.playbackRate.toString());
    await redisRepository.hSet(key, "serverTimestamp", state.serverTimestamp.toString());
    await redisRepository.hSet(key, "updatedBy", state.updatedBy);
    await redisRepository.hSet(key, "version", state.version.toString());
    
    // Auto-expire playback state if room is inactive for a long time (e.g. 12 hours)
    await redisRepository.expire(key, 60 * 60 * 12);
  },

  async removePlaybackState(roomId: string): Promise<void> {
    await redisRepository.del(`${PLAYBACK_PREFIX}${roomId}`);
  }
};
