// src/repositories/chat.repository.ts
import { prisma } from '@/config/prisma';
import { ChatMessage, MessageReaction } from '@/types/chat.types';

export const chatRepository = {
  async createMessage(dto: { roomId: string; senderId: string; senderName: string; content: string; replyTo?: string; }): Promise<ChatMessage> {
    const message = await prisma.message.create({
      data: {
        roomId: dto.roomId,
        userId: dto.senderId,
        content: dto.content,
      },
    });
    return message as unknown as ChatMessage;
  },

  async editMessage(messageId: string, _editorId: string, newContent: string): Promise<ChatMessage> {
    const message = await prisma.message.update({
      where: { id: messageId },
      data: { content: newContent },
    });
    return message as unknown as ChatMessage;
  },

  async deleteMessage(messageId: string, _requesterId: string): Promise<void> {
    await prisma.message.update({
      where: { id: messageId },
      data: { deletedAt: new Date() },
    });
  },

  async addReaction(messageId: string, userId: string, emoji: string): Promise<MessageReaction> {
    const reaction = await prisma.messageReaction.create({
      data: {
        messageId,
        userId,
        emoji,
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
    const messages = await prisma.message.findMany({
      where: { roomId, deletedAt: null },
      orderBy: { createdAt: 'desc' },
      take: limit,
      cursor: cursor ? { id: cursor } : undefined,
    });
    return messages as unknown as ChatMessage[];
  },
};
