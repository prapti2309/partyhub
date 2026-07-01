// src/repositories/chat.repository.ts
import { prisma } from '@/config/prisma';
import { ChatMessage, MessageReaction } from '@/types/chat.types';

export const chatRepository = {
  async createMessage(dto: { roomId: string; senderId: string; senderName: string; content: string; replyTo?: string; }): Promise<ChatMessage> {
    const message = await prisma.chatMessage.create({
      data: {
        id: crypto.randomUUID(),
        roomId: dto.roomId,
        senderId: dto.senderId,
        senderName: dto.senderName,
        content: dto.content,
        createdAt: Date.now(),
        edited: false,
        deleted: false,
        replyTo: dto.replyTo,
      },
    });
    return message as unknown as ChatMessage;
  },

  async editMessage(messageId: string, editorId: string, newContent: string): Promise<ChatMessage> {
    const message = await prisma.chatMessage.update({
      where: { id: messageId, senderId: editorId },
      data: { content: newContent, edited: true, updatedAt: Date.now() },
    });
    return message as unknown as ChatMessage;
  },

  async deleteMessage(messageId: string, requesterId: string): Promise<void> {
    await prisma.chatMessage.update({
      where: { id: messageId, senderId: requesterId },
      data: { deleted: true, updatedAt: Date.now() },
    });
  },

  async addReaction(messageId: string, userId: string, emoji: string): Promise<MessageReaction> {
    const reaction = await prisma.messageReaction.create({
      data: {
        id: crypto.randomUUID(),
        messageId,
        userId,
        emoji,
        reactedAt: Date.now(),
      },
    });
    return reaction as unknown as MessageReaction;
  },

  async removeReaction(messageId: string, userId: string, emoji: string): Promise<void> {
    await prisma.messageReaction.deleteMany({
      where: { messageId, userId, emoji },
    });
  },

  async getMessageHistory(roomId: string, limit: number, cursor?: string): Promise<ChatMessage[]> {
    const messages = await prisma.chatMessage.findMany({
      where: { roomId },
      orderBy: { createdAt: 'desc' },
      take: limit,
      cursor: cursor ? { id: cursor } : undefined,
    });
    return messages as unknown as ChatMessage[];
  },
};
