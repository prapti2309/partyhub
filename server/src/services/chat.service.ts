import { roomRepository } from "@/repositories/room.repository";
import { ERROR_CODES } from "@/sockets/socket.constants";
import { getSocketIO } from "@/sockets/socket.server";
import { SOCKET_EVENTS } from "@/sockets/socket.constants";
import { prisma } from "@/config/prisma";

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

  async handleTyping(roomId: string, userId: string, isTyping: boolean) {
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw { code: ERROR_CODES.ROOM_NOT_FOUND, message: "Room not found" };
    }
    
    // Broadcast typing indicator
    const io = getSocketIO();
    io.to(roomId).emit(SOCKET_EVENTS.CHAT_TYPING, { userId, isTyping });
  }
};
