"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.startHeartbeatWorker = startHeartbeatWorker;
const redis_1 = require("@/config/redis");
const room_repository_1 = require("@/repositories/room.repository");
const room_service_1 = require("@/services/room.service");
const logger_1 = require("@/utils/logger");
const sockets_1 = require("@/sockets");
function startHeartbeatWorker() {
    logger_1.logger.info("💓 Heartbeat Worker initialized and running...");
    // Run heartbeat checks every 15 seconds
    setInterval(async () => {
        try {
            await checkHeartbeats();
        }
        catch (err) {
            logger_1.logger.error("Error running heartbeat checks", { err });
        }
    }, 15000);
}
async function checkHeartbeats() {
    // 1. Get all active rooms
    const roomIds = await redis_1.redisClient.sMembers("active_rooms");
    if (!roomIds || roomIds.length === 0)
        return;
    const now = Date.now();
    const HEARTBEAT_TIMEOUT_MS = 60000; // 60 seconds
    for (const roomId of roomIds) {
        const participants = await room_repository_1.roomRepository.listParticipants(roomId);
        if (participants.length === 0) {
            // Clean up empty rooms from the active set
            await redis_1.redisClient.sRem("active_rooms", roomId);
            continue;
        }
        for (const participant of participants) {
            if (!participant.online)
                continue; // already marked offline
            // Check heartbeat
            const heartbeatTimeStr = await room_repository_1.roomRepository.getHeartbeat(participant.userId);
            let isStale = false;
            if (!heartbeatTimeStr) {
                isStale = true;
            }
            else {
                const heartbeatTime = parseInt(heartbeatTimeStr, 10);
                if (now - heartbeatTime > HEARTBEAT_TIMEOUT_MS) {
                    isStale = true;
                }
            }
            if (isStale) {
                logger_1.logger.info(`Detected stale user ${participant.userId} in room ${roomId}. Marking offline.`);
                // Clean dead socket mappings
                const oldSockets = [...participant.socketIds];
                participant.socketIds = [];
                participant.online = false;
                // Save updated participant state
                await room_repository_1.roomRepository.saveParticipant(roomId, participant);
                await room_repository_1.roomRepository.setUserPresence(participant.userId, "offline");
                await room_repository_1.roomRepository.removeHeartbeat(participant.userId);
                for (const socketId of oldSockets) {
                    await room_repository_1.roomRepository.removeSocketPresence(socketId);
                    // Force disconnect socket on the server if it still exists
                    const io = (0, sockets_1.getSocketIO)();
                    if (io) {
                        const socket = io.sockets.sockets.get(socketId);
                        if (socket) {
                            socket.disconnect(true);
                        }
                    }
                }
                // Broadcast presence updates
                const io = (0, sockets_1.getSocketIO)();
                if (io) {
                    io.to(roomId).emit("PARTICIPANT_OFFLINE", { userId: participant.userId });
                }
                // Trigger ownership transfer if they were owner
                const roomState = await room_repository_1.roomRepository.getRoomState(roomId);
                if (roomState?.ownerId === participant.userId) {
                    // Trigger ownership transfer using service
                    // To prevent circular dependency, we call roomService.handleSocketDisconnect or a custom method
                    // Let's call the public method to handle automatic transfer
                    try {
                        // We use a dynamic import or call service function
                        await room_service_1.roomService.handleSocketDisconnect(oldSockets[0] || "dummy_socket");
                    }
                    catch (e) {
                        logger_1.logger.error("Error triggering ownership transfer during heartbeat stale cleanup", { e });
                    }
                }
            }
        }
    }
}
