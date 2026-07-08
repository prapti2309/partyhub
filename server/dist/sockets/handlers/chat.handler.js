"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerChatHandlers = void 0;
const socket_constants_1 = require("../socket.constants");
const socket_middleware_1 = require("../socket.middleware");
const chat_validator_1 = require("@/validators/chat.validator");
const chat_service_1 = require("@/services/chat.service");
const socket_utils_1 = require("../socket.utils");
const registerChatHandlers = (io, socket) => {
    const userId = socket.data.user.id;
    socket.on(socket_constants_1.SOCKET_EVENTS.CHAT_SEND, async (payload, ack) => {
        await (0, socket_middleware_1.withErrorHandling)(async (socket, data, ackFn) => {
            const validated = (0, socket_middleware_1.validatePayload)(chat_validator_1.SendMessageSchema)(data, ackFn);
            if (!validated.success)
                return;
            const { roomId, content } = validated.data;
            const message = await chat_service_1.chatService.handleSendMessage(roomId, userId, content);
            if (typeof ackFn === "function") {
                ackFn((0, socket_utils_1.createSuccessResponse)(message));
            }
        })(socket, payload, ack);
    });
    // Typing start
    socket.on(socket_constants_1.SOCKET_EVENTS.CHAT_TYPING_START, async (payload, ack) => {
        await (0, socket_middleware_1.withErrorHandling)(async (socket, data, ackFn) => {
            const validated = (0, socket_middleware_1.validatePayload)(chat_validator_1.TypingStartSchema)(data, ackFn);
            if (!validated.success)
                return;
            const { roomId } = validated.data;
            await chat_service_1.chatService.handleTyping(roomId, userId, true);
            if (typeof ackFn === "function") {
                ackFn((0, socket_utils_1.createSuccessResponse)({ success: true }));
            }
        })(socket, payload, ack);
    });
    // Typing stop
    socket.on(socket_constants_1.SOCKET_EVENTS.CHAT_TYPING_STOP, async (payload, ack) => {
        await (0, socket_middleware_1.withErrorHandling)(async (socket, data, ackFn) => {
            const validated = (0, socket_middleware_1.validatePayload)(chat_validator_1.TypingStopSchema)(data, ackFn);
            if (!validated.success)
                return;
            const { roomId } = validated.data;
            await chat_service_1.chatService.handleTyping(roomId, userId, false);
            if (typeof ackFn === "function") {
                ackFn((0, socket_utils_1.createSuccessResponse)({ success: true }));
            }
        })(socket, payload, ack);
    });
    // Edit message
    socket.on(socket_constants_1.SOCKET_EVENTS.CHAT_EDIT, async (payload, ack) => {
        await (0, socket_middleware_1.withErrorHandling)(async (socket, data, ackFn) => {
            const validated = (0, socket_middleware_1.validatePayload)(chat_validator_1.EditMessageSchema)(data, ackFn);
            if (!validated.success)
                return;
            const { messageId, content } = validated.data;
            const roomId = socket.data.roomId;
            const message = await chat_service_1.chatService.handleEditMessage(roomId, userId, messageId, content);
            if (typeof ackFn === "function") {
                ackFn((0, socket_utils_1.createSuccessResponse)(message));
            }
        })(socket, payload, ack);
    });
    // Delete message
    socket.on(socket_constants_1.SOCKET_EVENTS.CHAT_DELETE, async (payload, ack) => {
        await (0, socket_middleware_1.withErrorHandling)(async (socket, data, ackFn) => {
            const validated = (0, socket_middleware_1.validatePayload)(chat_validator_1.DeleteMessageSchema)(data, ackFn);
            if (!validated.success)
                return;
            const { messageId } = validated.data;
            const roomId = socket.data.roomId;
            await chat_service_1.chatService.handleDeleteMessage(roomId, userId, messageId);
            if (typeof ackFn === "function") {
                ackFn((0, socket_utils_1.createSuccessResponse)({ success: true }));
            }
        })(socket, payload, ack);
    });
    // Reaction add
    socket.on(socket_constants_1.SOCKET_EVENTS.CHAT_REACTION_ADD, async (payload, ack) => {
        await (0, socket_middleware_1.withErrorHandling)(async (socket, data, ackFn) => {
            const validated = (0, socket_middleware_1.validatePayload)(chat_validator_1.ReactionSchema)(data, ackFn);
            if (!validated.success)
                return;
            const { messageId, emoji } = validated.data;
            const roomId = socket.data.roomId;
            const reaction = await chat_service_1.chatService.handleAddReaction(roomId, userId, messageId, emoji);
            if (typeof ackFn === "function") {
                ackFn((0, socket_utils_1.createSuccessResponse)(reaction));
            }
        })(socket, payload, ack);
    });
    // Reaction remove
    socket.on(socket_constants_1.SOCKET_EVENTS.CHAT_REACTION_REMOVE, async (payload, ack) => {
        await (0, socket_middleware_1.withErrorHandling)(async (socket, data, ackFn) => {
            const validated = (0, socket_middleware_1.validatePayload)(chat_validator_1.ReactionSchema)(data, ackFn);
            if (!validated.success)
                return;
            const { messageId, emoji } = validated.data;
            const roomId = socket.data.roomId;
            await chat_service_1.chatService.handleRemoveReaction(roomId, userId, messageId, emoji);
            if (typeof ackFn === "function") {
                ackFn((0, socket_utils_1.createSuccessResponse)({ success: true }));
            }
        })(socket, payload, ack);
    });
    // Read receipt
    socket.on(socket_constants_1.SOCKET_EVENTS.CHAT_READ_RECEIPT, async (payload, ack) => {
        await (0, socket_middleware_1.withErrorHandling)(async (socket, data, ackFn) => {
            const validated = (0, socket_middleware_1.validatePayload)(chat_validator_1.ReadReceiptSchema)(data, ackFn);
            if (!validated.success)
                return;
            const { roomId, lastReadMessageId } = validated.data;
            await chat_service_1.chatService.handleReadReceipt(roomId, userId, lastReadMessageId);
            if (typeof ackFn === "function") {
                ackFn((0, socket_utils_1.createSuccessResponse)({ success: true }));
            }
        })(socket, payload, ack);
    });
};
exports.registerChatHandlers = registerChatHandlers;
