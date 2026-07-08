"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRepository = void 0;
// src/repositories/chat.repository.ts
const prisma_1 = require("@/config/prisma");
exports.chatRepository = {
    async createMessage(dto) {
        const message = await prisma_1.prisma.chatMessage.create({
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
        return message;
    },
    async editMessage(messageId, editorId, newContent) {
        const message = await prisma_1.prisma.chatMessage.update({
            where: { id: messageId, senderId: editorId },
            data: { content: newContent, edited: true, updatedAt: Date.now() },
        });
        return message;
    },
    async deleteMessage(messageId, requesterId) {
        await prisma_1.prisma.chatMessage.update({
            where: { id: messageId, senderId: requesterId },
            data: { deleted: true, updatedAt: Date.now() },
        });
    },
    async addReaction(messageId, userId, emoji) {
        const reaction = await prisma_1.prisma.messageReaction.create({
            data: {
                id: crypto.randomUUID(),
                messageId,
                userId,
                emoji,
                reactedAt: Date.now(),
            },
        });
        return reaction;
    },
    async removeReaction(messageId, userId, emoji) {
        await prisma_1.prisma.messageReaction.deleteMany({
            where: { messageId, userId, emoji },
        });
    },
    async getMessageHistory(roomId, limit, cursor) {
        const messages = await prisma_1.prisma.chatMessage.findMany({
            where: { roomId },
            orderBy: { createdAt: 'desc' },
            take: limit,
            cursor: cursor ? { id: cursor } : undefined,
        });
        return messages;
    },
};
