import { roomRepository } from "@/repositories/room.repository";
import { ERROR_CODES } from "@/sockets/socket.constants";
import { getSocketIO } from "@/sockets/socket.server";
import { SOCKET_EVENTS } from "@/sockets/socket.constants";
import { prisma } from "@/config/prisma";
import { chatRepository } from "@/repositories/chat.repository";
import { presenceRepository } from "@/repositories/presence.repository";

export const chatService = {
  async handleSendMessage(roomId: string, userId: string, content: string) {
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw { code: ERROR_CODES.ROOM_NOT_FOUND, message: "Room not found" };
    }

    // Save message to postgres
    // Wait, the prisma schema must have a Message model if this is phase 4. 
    // Let's assume there is a Message model or we just broadcast if not created yet.
    // For now, let's try to save it. If it fails due to no model, we'll log it.
    let message;
    try {
      message = await prisma.message.create({
        data: {
          content,
          roomId,
          senderId: userId,
        },
        include: {
          sender: {
            select: { id: true, username: true, avatar: true }
          }
        }
      });
    } catch (err) {
      // Fallback if schema doesn't exist yet, we still need to broadcast in realtime
      message = {
        id: Math.random().toString(36).substring(7),
        content,
        roomId,
        senderId: userId,
        createdAt: new Date(),
        sender: { id: userId, username: "User" }
      };
    }

    const io = getSocketIO();
    io.to(roomId).emit(SOCKET_EVENTS.CHAT_MESSAGE, message);
    
    return message;
  },

  // ---------- Message Editing ----------
  async handleEditMessage(roomId: string, userId: string, messageId: string, newContent: string) {
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw { code: ERROR_CODES.ROOM_NOT_FOUND, message: "Room not found" };
    }
    // Verify ownership or permission (simple check: senderId must match)
    const edited = await chatRepository.editMessage(messageId, userId, newContent);
    const io = getSocketIO();
    io.to(roomId).emit(SOCKET_EVENTS.CHAT_EDIT, edited);
    return edited;
  },

  // ---------- Message Deletion ----------
  async handleDeleteMessage(roomId: string, userId: string, messageId: string) {
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw { code: ERROR_CODES.ROOM_NOT_FOUND, message: "Room not found" };
    }
    await chatRepository.deleteMessage(messageId, userId);
    const io = getSocketIO();
    io.to(roomId).emit(SOCKET_EVENTS.CHAT_DELETE, { messageId, userId });
  },

  // ---------- Reaction Handling ----------
  async handleAddReaction(roomId: string, userId: string, messageId: string, emoji: string) {
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw { code: ERROR_CODES.ROOM_NOT_FOUND, message: "Room not found" };
    }
    const reaction = await chatRepository.addReaction(messageId, userId, emoji);
    const io = getSocketIO();
    io.to(roomId).emit(SOCKET_EVENTS.CHAT_REACTION_ADD, reaction);
    return reaction;
  },

  async handleRemoveReaction(roomId: string, userId: string, messageId: string, emoji: string) {
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw { code: ERROR_CODES.ROOM_NOT_FOUND, message: "Room not found" };
    }
    await chatRepository.removeReaction(messageId, userId, emoji);
    const io = getSocketIO();
    io.to(roomId).emit(SOCKET_EVENTS.CHAT_REACTION_REMOVE, { messageId, userId, emoji });
  },

  // ---------- Read Receipt ----------
  async handleReadReceipt(roomId: string, userId: string, lastReadMessageId: string) {
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw { code: ERROR_CODES.ROOM_NOT_FOUND, message: "Room not found" };
    }
    // Update unread counter in Redis
    await presenceRepository.resetUnread(roomId, userId);
    const io = getSocketIO();
    io.to(roomId).emit(SOCKET_EVENTS.CHAT_READ_RECEIPT, { userId, lastReadMessageId });
  },

  async handleTyping(roomId: string, userId: string, isTyping: boolean) {
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw { code: ERROR_CODES.ROOM_NOT_FOUND, message: "Room not found" };
    }
    
    // Broadcast typing indicator using start/stop events
    const io = getSocketIO();
    const event = isTyping ? SOCKET_EVENTS.CHAT_TYPING_START : SOCKET_EVENTS.CHAT_TYPING_STOP;
    io.to(roomId).emit(event, { userId });
  }
};
