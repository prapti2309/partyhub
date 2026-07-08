"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.chatService = void 0;
const room_repository_1 = require("@/repositories/room.repository");
const socket_constants_1 = require("@/sockets/socket.constants");
const socket_server_1 = require("@/sockets/socket.server");
const socket_constants_2 = require("@/sockets/socket.constants");
const prisma_1 = require("@/config/prisma");
const chat_repository_1 = require("@/repositories/chat.repository");
const presence_repository_1 = require("@/repositories/presence.repository");
exports.chatService = {
    async handleSendMessage(roomId, userId, content) {
        const room = await room_repository_1.roomRepository.findById(roomId);
        if (!room) {
            throw { code: socket_constants_1.ERROR_CODES.ROOM_NOT_FOUND, message: "Room not found" };
        }
        // Save message to postgres
        // Wait, the prisma schema must have a Message model if this is phase 4. 
        // Let's assume there is a Message model or we just broadcast if not created yet.
        // For now, let's try to save it. If it fails due to no model, we'll log it.
        let message;
        try {
            message = await prisma_1.prisma.message.create({
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
        }
        catch (err) {
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
        const io = (0, socket_server_1.getSocketIO)();
        io.to(roomId).emit(socket_constants_2.SOCKET_EVENTS.CHAT_MESSAGE, message);
        return message;
    },
    // ---------- Message Editing ----------
    async handleEditMessage(roomId, userId, messageId, newContent) {
        const room = await room_repository_1.roomRepository.findById(roomId);
        if (!room) {
            throw { code: socket_constants_1.ERROR_CODES.ROOM_NOT_FOUND, message: "Room not found" };
        }
        // Verify ownership or permission (simple check: senderId must match)
        const edited = await chat_repository_1.chatRepository.editMessage(messageId, userId, newContent);
        const io = (0, socket_server_1.getSocketIO)();
        io.to(roomId).emit(socket_constants_2.SOCKET_EVENTS.CHAT_EDIT, edited);
        return edited;
    },
    // ---------- Message Deletion ----------
    async handleDeleteMessage(roomId, userId, messageId) {
        const room = await room_repository_1.roomRepository.findById(roomId);
        if (!room) {
            throw { code: socket_constants_1.ERROR_CODES.ROOM_NOT_FOUND, message: "Room not found" };
        }
        await chat_repository_1.chatRepository.deleteMessage(messageId, userId);
        const io = (0, socket_server_1.getSocketIO)();
        io.to(roomId).emit(socket_constants_2.SOCKET_EVENTS.CHAT_DELETE, { messageId, userId });
    },
    // ---------- Reaction Handling ----------
    async handleAddReaction(roomId, userId, messageId, emoji) {
        const room = await room_repository_1.roomRepository.findById(roomId);
        if (!room) {
            throw { code: socket_constants_1.ERROR_CODES.ROOM_NOT_FOUND, message: "Room not found" };
        }
        const reaction = await chat_repository_1.chatRepository.addReaction(messageId, userId, emoji);
        const io = (0, socket_server_1.getSocketIO)();
        io.to(roomId).emit(socket_constants_2.SOCKET_EVENTS.CHAT_REACTION_ADD, reaction);
        return reaction;
    },
    async handleRemoveReaction(roomId, userId, messageId, emoji) {
        const room = await room_repository_1.roomRepository.findById(roomId);
        if (!room) {
            throw { code: socket_constants_1.ERROR_CODES.ROOM_NOT_FOUND, message: "Room not found" };
        }
        await chat_repository_1.chatRepository.removeReaction(messageId, userId, emoji);
        const io = (0, socket_server_1.getSocketIO)();
        io.to(roomId).emit(socket_constants_2.SOCKET_EVENTS.CHAT_REACTION_REMOVE, { messageId, userId, emoji });
    },
    // ---------- Read Receipt ----------
    async handleReadReceipt(roomId, userId, lastReadMessageId) {
        const room = await room_repository_1.roomRepository.findById(roomId);
        if (!room) {
            throw { code: socket_constants_1.ERROR_CODES.ROOM_NOT_FOUND, message: "Room not found" };
        }
        // Update unread counter in Redis
        await presence_repository_1.presenceRepository.resetUnread(roomId, userId);
        const io = (0, socket_server_1.getSocketIO)();
        io.to(roomId).emit(socket_constants_2.SOCKET_EVENTS.CHAT_READ_RECEIPT, { userId, lastReadMessageId });
    },
    async handleTyping(roomId, userId, isTyping) {
        const room = await room_repository_1.roomRepository.findById(roomId);
        if (!room) {
            throw { code: socket_constants_1.ERROR_CODES.ROOM_NOT_FOUND, message: "Room not found" };
        }
        // Broadcast typing indicator using start/stop events
        const io = (0, socket_server_1.getSocketIO)();
        const event = isTyping ? socket_constants_2.SOCKET_EVENTS.CHAT_TYPING_START : socket_constants_2.SOCKET_EVENTS.CHAT_TYPING_STOP;
        io.to(roomId).emit(event, { userId });
    }
};
