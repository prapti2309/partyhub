import { presenceRepository } from "@/repositories/presence.repository";
import { getSocketIO } from "@/sockets/socket.server";
import { SOCKET_EVENTS } from "@/sockets/socket.constants";
import { userRepository } from "@/repositories/user.repository";

export const presenceService = {
  async handleUserJoin(roomId: string, userId: string, socketId: string) {
    await presenceRepository.addParticipant(roomId, userId);
    
    // Fetch user details for broadcast
    const user = await userRepository.findById(userId);
    
    const io = getSocketIO();
    io.to(roomId).emit(SOCKET_EVENTS.PARTICIPANT_JOINED, {
      userId,
      username: user?.username || "Unknown",
      avatar: user?.avatar,
      joinedAt: new Date().toISOString()
    });
  },

  async handleUserLeave(roomId: string, userId: string) {
    await presenceRepository.removeParticipant(roomId, userId);
    
    const io = getSocketIO();
    io.to(roomId).emit(SOCKET_EVENTS.PARTICIPANT_LEFT, {
      userId,
      leftAt: new Date().toISOString()
    });
  },

  async getRoomParticipants(roomId: string) {
    const participantIds = await presenceRepository.getParticipants(roomId);
    if (!participantIds.length) return [];
    
    // You could fetch more details from postgres here if needed
    return participantIds;
  }
};
