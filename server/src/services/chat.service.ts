import { prisma } from '@/config/prisma';
import { ERROR_CODES } from '@/sockets/socket.constants';
import { getSocketIO } from '@/sockets/socket.server';
import { SOCKET_EVENTS } from '@/sockets/socket.constants';
import { chatRepository } from '@/repositories/chat.repository';
import { presenceRepository } from '@/repositories/presence.repository';

/**
 * Validates that a room exists via Prisma (DB source of truth).
 */
async function ensureRoomExists(roomId: string) {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) {
    throw { code: ERROR_CODES.ROOM_NOT_FOUND, message: 'Room not found' };
  }
  return room;
}

export const chatService = {
  async handleSendMessage(roomId: string, userId: string, content: string) {
    await ensureRoomExists(roomId);

    let message;
    try {
      message = await prisma.message.create({
        data: {
          content,
          roomId,
          userId,
        },
        include: {
          user: {
            select: { id: true, profile: { select: { displayName: true, avatarUrl: true } } },
          },
        },
      });
    } catch (err) {
      // Fallback for real-time broadcast even if DB write fails
      message = {
        id: crypto.randomUUID(),
        content,
        roomId,
        userId,
        createdAt: new Date(),
      };
    }

    const io = getSocketIO();
    io.to(roomId).emit(SOCKET_EVENTS.CHAT_MESSAGE, message);

    return message;
  },

  async handleEditMessage(roomId: string, userId: string, messageId: string, newContent: string) {
    await ensureRoomExists(roomId);
    const edited = await chatRepository.editMessage(messageId, userId, newContent);
    const io = getSocketIO();
    io.to(roomId).emit(SOCKET_EVENTS.CHAT_EDIT, edited);
    return edited;
  },

  async handleDeleteMessage(roomId: string, userId: string, messageId: string) {
    await ensureRoomExists(roomId);
    await chatRepository.deleteMessage(messageId, userId);
    const io = getSocketIO();
    io.to(roomId).emit(SOCKET_EVENTS.CHAT_DELETE, { messageId, userId });
  },

  async handleAddReaction(roomId: string, userId: string, messageId: string, emoji: string) {
    await ensureRoomExists(roomId);
    const reaction = await chatRepository.addReaction(messageId, userId, emoji);
    const io = getSocketIO();
    io.to(roomId).emit(SOCKET_EVENTS.CHAT_REACTION_ADD, reaction);
    return reaction;
  },

  async handleRemoveReaction(roomId: string, userId: string, messageId: string, emoji: string) {
    await ensureRoomExists(roomId);
    await chatRepository.removeReaction(messageId, userId, emoji);
    const io = getSocketIO();
    io.to(roomId).emit(SOCKET_EVENTS.CHAT_REACTION_REMOVE, { messageId, userId, emoji });
  },

  async handleReadReceipt(roomId: string, userId: string, lastReadMessageId: string) {
    await ensureRoomExists(roomId);
    await presenceRepository.resetUnread(roomId, userId);
    const io = getSocketIO();
    io.to(roomId).emit(SOCKET_EVENTS.CHAT_READ_RECEIPT, { userId, lastReadMessageId });
  },

  async handleTyping(roomId: string, userId: string, isTyping: boolean) {
    // No room validation needed for transient typing indicators
    const io = getSocketIO();
    const event = isTyping ? SOCKET_EVENTS.CHAT_TYPING_START : SOCKET_EVENTS.CHAT_TYPING_STOP;
    io.to(roomId).emit(event, { userId });
  },
};
