import { z } from "zod";

export const ChatSchema = z.object({
  roomId: z.string().uuid("Invalid room ID"),
  content: z.string().min(1).max(500, "Message is too long").trim(),
});

export const TypingSchema = z.object({
  roomId: z.string().uuid("Invalid room ID"),
  isTyping: z.boolean(),
});

export type ChatDTO = z.infer<typeof ChatSchema>;
export type TypingDTO = z.infer<typeof TypingSchema>;
