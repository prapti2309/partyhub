"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.presenceService = void 0;
const presence_repository_1 = require("@/repositories/presence.repository");
const socket_server_1 = require("@/sockets/socket.server");
const socket_constants_1 = require("@/sockets/socket.constants");
const user_repository_1 = require("@/repositories/user.repository");
exports.presenceService = {
    async handleUserJoin(roomId, userId, socketId) {
        await presence_repository_1.presenceRepository.addParticipant(roomId, userId);
        // Fetch user details for broadcast
        const user = await user_repository_1.userRepository.findById(userId);
        const io = (0, socket_server_1.getSocketIO)();
        io.to(roomId).emit(socket_constants_1.SOCKET_EVENTS.PARTICIPANT_JOINED, {
            userId,
            username: user?.username || "Unknown",
            avatar: user?.avatar,
            joinedAt: new Date().toISOString()
        });
    },
    async handleUserLeave(roomId, userId) {
        await presence_repository_1.presenceRepository.removeParticipant(roomId, userId);
        const io = (0, socket_server_1.getSocketIO)();
        io.to(roomId).emit(socket_constants_1.SOCKET_EVENTS.PARTICIPANT_LEFT, {
            userId,
            leftAt: new Date().toISOString()
        });
    },
    async getRoomParticipants(roomId) {
        const participantIds = await presence_repository_1.presenceRepository.getParticipants(roomId);
        if (!participantIds.length)
            return [];
        // You could fetch more details from postgres here if needed
        return participantIds;
    }
};
