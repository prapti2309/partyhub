"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.playerService = void 0;
const playback_repository_1 = require("@/repositories/playback.repository");
const room_repository_1 = require("@/repositories/room.repository");
const socket_constants_1 = require("@/sockets/socket.constants");
const socket_server_1 = require("@/sockets/socket.server");
const socket_constants_2 = require("@/sockets/socket.constants");
exports.playerService = {
    async ensureRoomAccess(roomId, userId) {
        const room = await room_repository_1.roomRepository.findById(roomId);
        if (!room) {
            throw { code: socket_constants_1.ERROR_CODES.ROOM_NOT_FOUND, message: "Room not found" };
        }
        // Check if user is in room (could also check redis presence)
        const isOwner = room.ownerId === userId;
        return { room, isOwner };
    },
    async handlePlay(roomId, userId, position) {
        const { isOwner } = await exports.playerService.ensureRoomAccess(roomId, userId);
        // For now, only owner can control playback, or check room settings
        if (!isOwner) {
            throw { code: socket_constants_1.ERROR_CODES.OWNER_REQUIRED, message: "Only the owner can play the video" };
        }
        let state = await playback_repository_1.playbackRepository.getPlaybackState(roomId);
        if (!state) {
            state = {
                roomId,
                playing: true,
                position,
                playbackRate: 1,
                serverTimestamp: Date.now(),
                updatedBy: userId,
                version: 0,
            };
            await playback_repository_1.playbackRepository.savePlaybackState(state);
        }
        else {
            // Update fields
            state.playing = true;
            state.position = position;
            state.updatedBy = userId;
            // Use optimistic concurrency
            await playback_repository_1.playbackRepository.updatePlaybackState(state, state.version);
        }
        const io = (0, socket_server_1.getSocketIO)();
        io.to(roomId).emit(socket_constants_2.SOCKET_EVENTS.PLAYER_PLAY, state);
        return state;
    },
    async handlePause(roomId, userId, position) {
        const { isOwner } = await exports.playerService.ensureRoomAccess(roomId, userId);
        if (!isOwner) {
            throw { code: socket_constants_1.ERROR_CODES.OWNER_REQUIRED, message: "Only the owner can pause the video" };
        }
        let state = await playback_repository_1.playbackRepository.getPlaybackState(roomId);
        if (!state) {
            state = {
                roomId,
                playing: false,
                position,
                playbackRate: 1,
                serverTimestamp: Date.now(),
                updatedBy: userId,
                version: 0,
            };
            await playback_repository_1.playbackRepository.savePlaybackState(state);
        }
        else {
            state.playing = false;
            state.position = position;
            state.updatedBy = userId;
            await playback_repository_1.playbackRepository.updatePlaybackState(state, state.version);
        }
        const io = (0, socket_server_1.getSocketIO)();
        io.to(roomId).emit(socket_constants_2.SOCKET_EVENTS.PLAYER_PAUSE, state);
        return state;
    },
    async handleSeek(roomId, userId, position) {
        const { isOwner } = await exports.playerService.ensureRoomAccess(roomId, userId);
        if (!isOwner) {
            throw { code: socket_constants_1.ERROR_CODES.OWNER_REQUIRED, message: "Only the owner can seek the video" };
        }
        let state = await playback_repository_1.playbackRepository.getPlaybackState(roomId);
        if (!state) {
            state = {
                roomId,
                playing: false,
                position,
                playbackRate: 1,
                serverTimestamp: Date.now(),
                updatedBy: userId,
                version: 0,
            };
            await playback_repository_1.playbackRepository.savePlaybackState(state);
        }
        else {
            state.position = position;
            state.updatedBy = userId;
            await playback_repository_1.playbackRepository.updatePlaybackState(state, state.version);
        }
        const io = (0, socket_server_1.getSocketIO)();
        io.to(roomId).emit(socket_constants_2.SOCKET_EVENTS.PLAYER_SEEK, state);
        return state;
    },
    async handleSync(roomId, userId) {
        await exports.playerService.ensureRoomAccess(roomId, userId);
        const state = await playback_repository_1.playbackRepository.getPlaybackState(roomId);
        if (state) {
            // Send the current canonical state to the requesting user only, handled in the handler via ack
            return state;
        }
        return null;
    }
};
