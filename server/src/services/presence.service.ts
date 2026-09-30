import { presenceRepository } from '@/repositories/presence.repository';
import { getSocketIO } from '@/sockets/socket.server';
import { SOCKET_EVENTS } from '@/sockets/socket.constants';
import { userRepository } from '@/repositories/user.repository';

export const presenceService = {
  async handleUserJoin(roomId: string, userId: string, _socketId: string) {
    await presenceRepository.addParticipant(roomId, userId);

    const user = await userRepository.findById(userId);

    const io = getSocketIO();
    io.to(roomId).emit(SOCKET_EVENTS.PARTICIPANT_JOINED, {
      userId,
      username: user?.profile?.displayName || 'Unknown',
      avatar: user?.profile?.avatarUrl ?? null,
      joinedAt: new Date().toISOString(),
    });
  },

  async handleUserLeave(roomId: string, userId: string) {
    await presenceRepository.removeParticipant(roomId, userId);

    const io = getSocketIO();
    io.to(roomId).emit(SOCKET_EVENTS.PARTICIPANT_LEFT, {
      userId,
      leftAt: new Date().toISOString(),
    });
  },

  async getRoomParticipants(roomId: string) {
    const participantIds = await presenceRepository.getParticipants(roomId);
    if (!participantIds.length) return [];
    return participantIds;
  },
};
