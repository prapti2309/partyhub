"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ReadReceiptSchema = exports.PresenceUpdateSchema = exports.TypingStopSchema = exports.TypingStartSchema = exports.ReactionSchema = exports.DeleteMessageSchema = exports.EditMessageSchema = exports.SendMessageSchema = void 0;
// src/validators/chat.validator.ts
const zod_1 = require("zod");
// Basic chat message payload (used for typing as well)
exports.SendMessageSchema = zod_1.z.object({
    roomId: zod_1.z.string().uuid('Invalid room ID'),
    content: zod_1.z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
    replyTo: zod_1.z.string().uuid().optional(),
});
exports.EditMessageSchema = zod_1.z.object({
    messageId: zod_1.z.string().uuid('Invalid message ID'),
    content: zod_1.z.string().min(1).max(2000),
});
exports.DeleteMessageSchema = zod_1.z.object({
    messageId: zod_1.z.string().uuid(),
});
exports.ReactionSchema = zod_1.z.object({
    messageId: zod_1.z.string().uuid(),
    emoji: zod_1.z.string().min(1).max(4), // Unicode emoji, max 4 chars
});
exports.TypingStartSchema = zod_1.z.object({
    roomId: zod_1.z.string().uuid(),
});
exports.TypingStopSchema = zod_1.z.object({
    roomId: zod_1.z.string().uuid(),
});
exports.PresenceUpdateSchema = zod_1.z.object({
    status: zod_1.z.enum(['online', 'offline', 'away', 'idle', 'busy', 'invisible']),
    device: zod_1.z.string().optional(),
});
exports.ReadReceiptSchema = zod_1.z.object({
    roomId: zod_1.z.string().uuid(),
    lastReadMessageId: zod_1.z.string().uuid(),
});
