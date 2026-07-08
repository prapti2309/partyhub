"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerPresenceHandlers = void 0;
const socket_constants_1 = require("../socket.constants");
const socket_utils_1 = require("../socket.utils");
const socket_registry_1 = require("../socket.registry");
const room_service_1 = require("@/services/room.service");
const registerPresenceHandlers = (io, socket) => {
    const userId = socket.data.user.id;
    socket.on(socket_constants_1.SOCKET_EVENTS.PING, async (payload, ack) => {
        try {
            await socket_registry_1.socketRegistry.updateHeartbeat(socket.id);
            // We could also run room heartbeat logic here if needed
            if (socket.data.roomId) {
                // e.g. roomService.updateHeartbeat(socket.data.roomId, userId)
            }
            if (typeof ack === "function") {
                ack((0, socket_utils_1.createSuccessResponse)({ timestamp: Date.now() }));
            }
            else {
                socket.emit(socket_constants_1.SOCKET_EVENTS.PONG, { timestamp: Date.now() });
            }
        }
        catch (err) {
            // Ignore heartbeat errors
        }
    });
    socket.on("disconnect", async () => {
        try {
            const socketInfo = await socket_registry_1.socketRegistry.getSocket(socket.id);
            if (socketInfo && socketInfo.roomId) {
                await room_service_1.roomService.leaveRoom(userId, socketInfo.roomId, socket.id);
            }
            await socket_registry_1.socketRegistry.removeSocket(socket.id);
        }
        catch (err) {
            console.error("Error during disconnect presence handling", err);
        }
    });
};
exports.registerPresenceHandlers = registerPresenceHandlers;
