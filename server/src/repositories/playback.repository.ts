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

  /**
   * Save a new playback state (initial creation).
   */
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
    await redisRepository.expire(key, 60 * 60 * 12);
  },

  /**
   * Update an existing playback state with optimistic concurrency control.
   * Throws if the stored version does not match `expectedVersion`.
   */
  async updatePlaybackState(state: PlaybackState, expectedVersion: number): Promise<void> {
    const key = `${PLAYBACK_PREFIX}${state.roomId}`;
    const currentVersionStr = await redisRepository.hGet(key, "version");
    const currentVersion = currentVersionStr ? parseInt(currentVersionStr, 10) : 0;
    if (currentVersion !== expectedVersion) {
      throw { code: ERROR_CODES.PLAYBACK_CONFLICT, message: "Playback version conflict" };
    }
    // Increment version
    state.version = expectedVersion + 1;
    state.serverTimestamp = Date.now();
    await this.savePlaybackState(state);
  },

  async removePlaybackState(roomId: string): Promise<void> {
    await redisRepository.del(`${PLAYBACK_PREFIX}${roomId}`);
  }
};
