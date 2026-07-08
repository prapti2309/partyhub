"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.voiceService = void 0;
// src/services/voice.service.ts
const logger_1 = require("@/utils/logger");
const socket_server_1 = require("@/sockets/socket.server");
const voice_repository_1 = require("@/repositories/voice.repository");
/**
 * Core business logic for voice communication.
 * All methods are async and interact with Redis via voiceRepository and broadcast
 * events to other participants using the Socket.IO server instance.
 */
exports.voiceService = {
    /** User joins a voice room */
    async join(dto, socketId) {
        const { roomId } = dto;
        await voice_repository_1.voiceRepository.addParticipant(roomId, socketId);
        // Notify existing participants of new peer
        const participants = await voice_repository_1.voiceRepository.getParticipants(roomId);
        const io = (0, socket_server_1.getSocketIO)();
        participants.forEach((pid) => {
            if (pid !== socketId) {
                io.to(pid).emit('voice:peer-connected', { socketId, roomId });
            }
        });
        logger_1.logger.info(`Voice join: socket ${socketId} joined room ${roomId}`);
    },
    /** User leaves a voice room */
    async leave(roomId, socketId) {
        await voice_repository_1.voiceRepository.removeParticipant(roomId, socketId);
        const participants = await voice_repository_1.voiceRepository.getParticipants(roomId);
        const io = (0, socket_server_1.getSocketIO)();
        participants.forEach((pid) => {
            io.to(pid).emit('voice:peer-disconnected', { socketId, roomId });
        });
        logger_1.logger.info(`Voice leave: socket ${socketId} left room ${roomId}`);
    },
    /** Handle SDP offer from caller */
    async handleOffer(dto, socketId) {
        const { roomId, sdp } = dto;
        await voice_repository_1.voiceRepository.setLastSdp(roomId, socketId, sdp);
        // Forward offer to all other participants in the room
        const participants = await voice_repository_1.voiceRepository.getParticipants(roomId);
        const io = (0, socket_server_1.getSocketIO)();
        participants.forEach((pid) => {
            if (pid !== socketId) {
                io.to(pid).emit('voice:offer', { from: socketId, roomId, sdp });
            }
        });
    },
    /** Handle SDP answer from callee */
    async handleAnswer(dto, socketId) {
        const { roomId, sdp } = dto;
        await voice_repository_1.voiceRepository.setLastSdp(roomId, socketId, sdp);
        const participants = await voice_repository_1.voiceRepository.getParticipants(roomId);
        const io = (0, socket_server_1.getSocketIO)();
        participants.forEach((pid) => {
            if (pid !== socketId) {
                io.to(pid).emit('voice:answer', { from: socketId, roomId, sdp });
            }
        });
    },
    /** ICE candidate exchange */
    async handleIceCandidate(dto, socketId) {
        const { roomId, candidate } = dto;
        const participants = await voice_repository_1.voiceRepository.getParticipants(roomId);
        const io = (0, socket_server_1.getSocketIO)();
        participants.forEach((pid) => {
            if (pid !== socketId) {
                io.to(pid).emit('voice:ice-candidate', { from: socketId, roomId, candidate });
            }
        });
    },
    /** Mute / unmute */
    async setMute(dto, socketId) {
        const { roomId, muted } = dto;
        const io = (0, socket_server_1.getSocketIO)();
        const participants = await voice_repository_1.voiceRepository.getParticipants(roomId);
        participants.forEach((pid) => {
            if (pid !== socketId) {
                io.to(pid).emit('voice:mute', { socketId, roomId, muted });
            }
        });
        logger_1.logger.info(`Voice mute: socket ${socketId} muted=${muted} in room ${roomId}`);
    },
    /** Broadcast generic voice state */
    async broadcastState(dto) {
        const { roomId, state } = dto;
        const io = (0, socket_server_1.getSocketIO)();
        io.to(roomId).emit('voice:state', { roomId, state });
    },
};
