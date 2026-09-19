"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = void 0;
const prisma_1 = require("../config/prisma");
const socket_constants_1 = require("../sockets/socket.constants");
const socket_server_1 = require("../sockets/socket.server");
const socket_constants_2 = require("../sockets/socket.constants");
const chat_repository_1 = require("../repositories/chat.repository");
const presence_repository_1 = require("../repositories/presence.repository");
/**
 * Validates that a room exists via Prisma (DB source of truth).
 */
async function ensureRoomExists(roomId) {
    const room = await prisma_1.prisma.room.findUnique({ where: { id: roomId } });
    if (!room) {
        throw { code: socket_constants_1.ERROR_CODES.ROOM_NOT_FOUND, message: 'Room not found' };
    }
    return room;
}
exports.chatService = {
    async handleSendMessage(roomId, userId, content) {
        await ensureRoomExists(roomId);
        let message;
        try {
            message = await prisma_1.prisma.message.create({
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
        }
        catch (err) {
            // Fallback for real-time broadcast even if DB write fails
            message = {
                id: crypto.randomUUID(),
                content,
                roomId,
                userId,
                createdAt: new Date(),
            };
        }
        const io = (0, socket_server_1.getSocketIO)();
        io.to(roomId).emit(socket_constants_2.SOCKET_EVENTS.CHAT_MESSAGE, message);
        return message;
    },
    async handleEditMessage(roomId, userId, messageId, newContent) {
        await ensureRoomExists(roomId);
        const edited = await chat_repository_1.chatRepository.editMessage(messageId, userId, newContent);
        const io = (0, socket_server_1.getSocketIO)();
        io.to(roomId).emit(socket_constants_2.SOCKET_EVENTS.CHAT_EDIT, edited);
        return edited;
    },
    async handleDeleteMessage(roomId, userId, messageId) {
        await ensureRoomExists(roomId);
        await chat_repository_1.chatRepository.deleteMessage(messageId, userId);
        const io = (0, socket_server_1.getSocketIO)();
        io.to(roomId).emit(socket_constants_2.SOCKET_EVENTS.CHAT_DELETE, { messageId, userId });
    },
    async handleAddReaction(roomId, userId, messageId, emoji) {
        await ensureRoomExists(roomId);
        const reaction = await chat_repository_1.chatRepository.addReaction(messageId, userId, emoji);
        const io = (0, socket_server_1.getSocketIO)();
        io.to(roomId).emit(socket_constants_2.SOCKET_EVENTS.CHAT_REACTION_ADD, reaction);
        return reaction;
    },
    async handleRemoveReaction(roomId, userId, messageId, emoji) {
        await ensureRoomExists(roomId);
        await chat_repository_1.chatRepository.removeReaction(messageId, userId, emoji);
        const io = (0, socket_server_1.getSocketIO)();
        io.to(roomId).emit(socket_constants_2.SOCKET_EVENTS.CHAT_REACTION_REMOVE, { messageId, userId, emoji });
    },
    async handleReadReceipt(roomId, userId, lastReadMessageId) {
        await ensureRoomExists(roomId);
        await presence_repository_1.presenceRepository.resetUnread(roomId, userId);
        const io = (0, socket_server_1.getSocketIO)();
        io.to(roomId).emit(socket_constants_2.SOCKET_EVENTS.CHAT_READ_RECEIPT, { userId, lastReadMessageId });
    },
    async handleTyping(roomId, userId, isTyping) {
        // No room validation needed for transient typing indicators
        const io = (0, socket_server_1.getSocketIO)();
        const event = isTyping ? socket_constants_2.SOCKET_EVENTS.CHAT_TYPING_START : socket_constants_2.SOCKET_EVENTS.CHAT_TYPING_STOP;
        io.to(roomId).emit(event, { userId });
    },
};
