"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPlayerHandlers = void 0;
const socket_constants_1 = require("../socket.constants");
const socket_middleware_1 = require("../socket.middleware");
const player_validator_1 = require("@/validators/player.validator");
const player_service_1 = require("@/services/player.service");
const socket_utils_1 = require("../socket.utils");
const registerPlayerHandlers = (io, socket) => {
    const userId = socket.data.user.id;
    const roomId = socket.data.roomId; // Assuming roomId stored in socket data
    socket.on(socket_constants_1.SOCKET_EVENTS.PLAYER_PLAY, async (payload, ack) => {
        await (0, socket_middleware_1.withErrorHandling)(async (socket, data, ackFn) => {
            const validated = (0, socket_middleware_1.validatePayload)(player_validator_1.PlaySchema)(data, ackFn);
            if (!validated.success)
                return;
            const { roomId, timestamp } = validated.data;
            const state = await player_service_1.playerService.handlePlay(roomId, userId, timestamp);
            io.to(roomId).emit(socket_constants_1.SOCKET_EVENTS.PLAYBACK_BROADCAST, state);
            if (typeof ackFn === "function") {
                ackFn((0, socket_utils_1.createSuccessResponse)(state));
            }
        })(socket, payload, ack);
    });
    socket.on(socket_constants_1.SOCKET_EVENTS.PLAYER_PAUSE, async (payload, ack) => {
        await (0, socket_middleware_1.withErrorHandling)(async (socket, data, ackFn) => {
            const validated = (0, socket_middleware_1.validatePayload)(player_validator_1.PauseSchema)(data, ackFn);
            if (!validated.success)
                return;
            const { roomId, timestamp } = validated.data;
            const state = await player_service_1.playerService.handlePause(roomId, userId, timestamp);
            io.to(roomId).emit(socket_constants_1.SOCKET_EVENTS.PLAYBACK_BROADCAST, state);
            if (typeof ackFn === "function") {
                ackFn((0, socket_utils_1.createSuccessResponse)(state));
            }
        })(socket, payload, ack);
    });
    socket.on(socket_constants_1.SOCKET_EVENTS.PLAYER_SEEK, async (payload, ack) => {
        await (0, socket_middleware_1.withErrorHandling)(async (socket, data, ackFn) => {
            const validated = (0, socket_middleware_1.validatePayload)(player_validator_1.SeekSchema)(data, ackFn);
            if (!validated.success)
                return;
            const { roomId, timestamp } = validated.data;
            const state = await player_service_1.playerService.handleSeek(roomId, userId, timestamp);
            io.to(roomId).emit(socket_constants_1.SOCKET_EVENTS.PLAYBACK_BROADCAST, state);
            if (typeof ackFn === "function") {
                ackFn((0, socket_utils_1.createSuccessResponse)(state));
            }
        })(socket, payload, ack);
    });
    socket.on(socket_constants_1.SOCKET_EVENTS.PLAYBACK_SYNC, async (payload, ack) => {
        await (0, socket_middleware_1.withErrorHandling)(async (socket, data, ackFn) => {
            const validated = (0, socket_middleware_1.validatePayload)(player_validator_1.SyncSchema)(data, ackFn);
            if (!validated.success)
                return;
            const { roomId } = validated.data;
            const state = await player_service_1.playerService.handleSync(roomId, userId);
            if (typeof ackFn === "function") {
                ackFn((0, socket_utils_1.createSuccessResponse)(state));
            }
        })(socket, payload, ack);
    });
};
exports.registerPlayerHandlers = registerPlayerHandlers;
