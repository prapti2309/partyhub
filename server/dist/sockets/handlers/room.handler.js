"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerRoomHandlers = void 0;
const socket_constants_1 = require("../socket.constants");
const socket_middleware_1 = require("../socket.middleware");
const room_validator_1 = require("@/validators/room.validator");
const room_service_1 = require("@/services/room.service");
const presence_service_1 = require("@/services/presence.service");
const socket_utils_1 = require("../socket.utils");
const socket_registry_1 = require("../socket.registry");
const registerRoomHandlers = (io, socket) => {
    const userId = socket.data.user.id;
    socket.on(socket_constants_1.SOCKET_EVENTS.ROOM_JOIN, async (payload, ack) => {
        await (0, socket_middleware_1.withErrorHandling)(async (socket, data, ackFn) => {
            const validated = (0, socket_middleware_1.validatePayload)(room_validator_1.JoinRoomSchema)(data, ackFn);
            if (!validated.success)
                return;
            const { roomId, username } = validated.data;
            const resolvedUsername = username || socket.data.user.email || "Guest";
            const { room, participant } = await room_service_1.roomService.joinRoom(userId, roomId, socket.id, resolvedUsername);
            socket.join(room.id);
            socket.data.roomId = room.id;
            await socket_registry_1.socketRegistry.registerSocket(socket.id, userId);
            await socket_registry_1.socketRegistry.updateRoom(socket.id, room.id);
            await presence_service_1.presenceService.handleUserJoin(room.id, userId, socket.id);
            if (typeof ackFn === "function") {
                ackFn((0, socket_utils_1.createSuccessResponse)({ room, participant }));
            }
        })(socket, payload, ack);
    });
    socket.on(socket_constants_1.SOCKET_EVENTS.ROOM_LEAVE, async (payload, ack) => {
        await (0, socket_middleware_1.withErrorHandling)(async (socket, data, ackFn) => {
            const validated = (0, socket_middleware_1.validatePayload)(room_validator_1.LeaveRoomSchema)(data, ackFn);
            if (!validated.success)
                return;
            const { roomId } = validated.data;
            await room_service_1.roomService.leaveRoom(userId, roomId, socket.id);
            socket.leave(roomId);
            socket.data.roomId = undefined;
            await socket_registry_1.socketRegistry.updateRoom(socket.id, null);
            await presence_service_1.presenceService.handleUserLeave(roomId, userId);
            if (typeof ackFn === "function") {
                ackFn((0, socket_utils_1.createSuccessResponse)({ success: true }));
            }
        })(socket, payload, ack);
    });
    socket.on(socket_constants_1.SOCKET_EVENTS.ROOM_TRANSFER, async (payload, ack) => {
        await (0, socket_middleware_1.withErrorHandling)(async (socket, data, ackFn) => {
            const validated = (0, socket_middleware_1.validatePayload)(room_validator_1.TransferOwnerSchema)(data, ackFn);
            if (!validated.success)
                return;
            const { roomId, newOwnerId } = validated.data;
            await room_service_1.roomService.transferOwnershipManually(roomId, userId, newOwnerId);
            io.to(roomId).emit(socket_constants_1.SOCKET_EVENTS.ROOM_OWNERSHIP_TRANSFERRED, { newOwnerId });
            if (typeof ackFn === "function") {
                ackFn((0, socket_utils_1.createSuccessResponse)({ success: true }));
            }
        })(socket, payload, ack);
    });
};
exports.registerRoomHandlers = registerRoomHandlers;
