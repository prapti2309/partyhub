"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatRepository = void 0;
// src/repositories/chat.repository.ts
const prisma_1 = require("../config/prisma");
exports.chatRepository = {
    async createMessage(dto) {
        const message = await prisma_1.prisma.message.create({
            data: {
                roomId: dto.roomId,
                userId: dto.senderId,
                content: dto.content,
            },
        });
        return message;
    },
    async editMessage(messageId, _editorId, newContent) {
        const message = await prisma_1.prisma.message.update({
            where: { id: messageId },
            data: { content: newContent },
        });
        return message;
    },
    async deleteMessage(messageId, _requesterId) {
        await prisma_1.prisma.message.update({
            where: { id: messageId },
            data: { deletedAt: new Date() },
        });
    },
    async addReaction(messageId, userId, emoji) {
        const reaction = await prisma_1.prisma.messageReaction.create({
            data: {
                messageId,
                userId,
                emoji,
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
        const messages = await prisma_1.prisma.message.findMany({
            where: { roomId, deletedAt: null },
            orderBy: { createdAt: 'desc' },
            take: limit,
            cursor: cursor ? { id: cursor } : undefined,
        });
        return messages;
    },
};
