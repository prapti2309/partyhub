// src/validators/chat.validator.ts
import { z } from 'zod';

// Basic chat message payload (used for typing as well)
export const SendMessageSchema = z.object({
  roomId: z.string().uuid('Invalid room ID'),
  content: z.string().min(1, 'Message cannot be empty').max(2000, 'Message too long'),
  replyTo: z.string().uuid().optional(),
});

export const EditMessageSchema = z.object({
  messageId: z.string().uuid('Invalid message ID'),
  content: z.string().min(1).max(2000),
});

export const DeleteMessageSchema = z.object({
  messageId: z.string().uuid(),
});

export const ReactionSchema = z.object({
  messageId: z.string().uuid(),
  emoji: z.string().min(1).max(4), // Unicode emoji, max 4 chars
});

export const TypingStartSchema = z.object({
  roomId: z.string().uuid(),
});

export const TypingStopSchema = z.object({
  roomId: z.string().uuid(),
});

export const PresenceUpdateSchema = z.object({
  status: z.enum(['online', 'offline', 'away', 'idle', 'busy', 'invisible']),
  device: z.string().optional(),
});

export const ReadReceiptSchema = z.object({
  roomId: z.string().uuid(),
  lastReadMessageId: z.string().uuid(),
});

export type SendMessageDTO = z.infer<typeof SendMessageSchema>;
export type EditMessageDTO = z.infer<typeof EditMessageSchema>;
export type DeleteMessageDTO = z.infer<typeof DeleteMessageSchema>;
export type ReactionDTO = z.infer<typeof ReactionSchema>;
export type TypingDTO = z.infer<typeof TypingStartSchema>;
export type PresenceDTO = z.infer<typeof PresenceUpdateSchema>;
export type ReadReceiptDTO = z.infer<typeof ReadReceiptSchema>;
