import { redisClient } from "@/config/redis";
import { roomRepository } from "@/repositories/room.repository";
import { roomService } from "@/services/room.service";
import { logger } from "@/utils/logger";
import { getSocketIO } from "@/sockets";

export function startHeartbeatWorker() {
  logger.info("💓 Heartbeat Worker initialized and running...");

  // Run heartbeat checks every 15 seconds
  setInterval(async () => {
    try {
      await checkHeartbeats();
    } catch (err) {
      logger.error("Error running heartbeat checks", { err });
    }
  }, 15000);
}

async function checkHeartbeats() {
  // 1. Get all active rooms
  const roomIds = await redisClient.sMembers("active_rooms");
  if (!roomIds || roomIds.length === 0) return;

  const now = Date.now();
  const HEARTBEAT_TIMEOUT_MS = 60000; // 60 seconds

  for (const roomId of roomIds) {
    const participants = await roomRepository.listParticipants(roomId);
    if (participants.length === 0) {
      // Clean up empty rooms from the active set
      await redisClient.sRem("active_rooms", roomId);
      continue;
    }

    for (const participant of participants) {
      if (!participant.online) continue; // already marked offline

      // Check heartbeat
      const heartbeatTimeStr = await roomRepository.getHeartbeat(participant.userId);
      let isStale = false;

      if (!heartbeatTimeStr) {
        isStale = true;
      } else {
        const heartbeatTime = parseInt(heartbeatTimeStr, 10);
        if (now - heartbeatTime > HEARTBEAT_TIMEOUT_MS) {
          isStale = true;
        }
      }

      if (isStale) {
        logger.info(`Detected stale user ${participant.userId} in room ${roomId}. Marking offline.`);

        // Clean dead socket mappings
        const oldSockets = [...participant.socketIds];
        participant.socketIds = [];
        participant.online = false;

        // Save updated participant state
        await roomRepository.saveParticipant(roomId, participant);
        await roomRepository.setUserPresence(participant.userId, "offline");
        await roomRepository.removeHeartbeat(participant.userId);

        for (const socketId of oldSockets) {
          await roomRepository.removeSocketPresence(socketId);
          // Force disconnect socket on the server if it still exists
          const io = getSocketIO();
          if (io) {
            const socket = io.sockets.sockets.get(socketId);
            if (socket) {
              socket.disconnect(true);
            }
          }
        }

        // Broadcast presence updates
        const io = getSocketIO();
        if (io) {
          io.to(roomId).emit("PARTICIPANT_OFFLINE", { userId: participant.userId });
        }

        // Trigger ownership transfer if they were owner
        const roomState = await roomRepository.getRoomState(roomId);
        if (roomState?.ownerId === participant.userId) {
          // Trigger ownership transfer using service
          // To prevent circular dependency, we call roomService.handleSocketDisconnect or a custom method
          // Let's call the public method to handle automatic transfer
          try {
            // We use a dynamic import or call service function
            await roomService.handleSocketDisconnect(oldSockets[0] || "dummy_socket");
          } catch (e) {
            logger.error("Error triggering ownership transfer during heartbeat stale cleanup", { e });
          }
        }
      }
    }
  }
}
