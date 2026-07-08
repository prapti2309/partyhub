"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playbackRepository = void 0;
const redis_repository_1 = require("./redis.repository");
const socket_constants_1 = require("../sockets/socket.constants");
const PLAYBACK_PREFIX = "room:playback:";
exports.playbackRepository = {
    async getPlaybackState(roomId) {
        const data = await redis_repository_1.redisRepository.hGetAll(`${PLAYBACK_PREFIX}${roomId}`);
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
    async savePlaybackState(state) {
        const key = `${PLAYBACK_PREFIX}${state.roomId}`;
        await redis_repository_1.redisRepository.hSet(key, "roomId", state.roomId);
        if (state.videoId)
            await redis_repository_1.redisRepository.hSet(key, "videoId", state.videoId);
        await redis_repository_1.redisRepository.hSet(key, "playing", state.playing ? "true" : "false");
        await redis_repository_1.redisRepository.hSet(key, "position", state.position.toString());
        await redis_repository_1.redisRepository.hSet(key, "playbackRate", state.playbackRate.toString());
        await redis_repository_1.redisRepository.hSet(key, "serverTimestamp", state.serverTimestamp.toString());
        await redis_repository_1.redisRepository.hSet(key, "updatedBy", state.updatedBy);
        await redis_repository_1.redisRepository.hSet(key, "version", state.version.toString());
        await redis_repository_1.redisRepository.expire(key, 60 * 60 * 12);
    },
    /**
     * Update an existing playback state with optimistic concurrency control.
     * Throws if the stored version does not match `expectedVersion`.
     */
    async updatePlaybackState(state, expectedVersion) {
        const key = `${PLAYBACK_PREFIX}${state.roomId}`;
        const currentVersionStr = await redis_repository_1.redisRepository.hGet(key, "version");
        const currentVersion = currentVersionStr ? parseInt(currentVersionStr, 10) : 0;
        if (currentVersion !== expectedVersion) {
            throw { code: socket_constants_1.ERROR_CODES.PLAYBACK_CONFLICT, message: "Playback version conflict" };
        }
        // Increment version
        state.version = expectedVersion + 1;
        state.serverTimestamp = Date.now();
        await this.savePlaybackState(state);
    },
    async removePlaybackState(roomId) {
        await redis_repository_1.redisRepository.del(`${PLAYBACK_PREFIX}${roomId}`);
    }
};
