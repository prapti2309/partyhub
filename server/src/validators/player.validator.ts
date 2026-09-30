import { z } from "zod";

export const PlaySchema = z.object({
  roomId: z.string().uuid("Invalid room ID"),
  timestamp: z.number().nonnegative(),
});

export const PauseSchema = z.object({
  roomId: z.string().uuid("Invalid room ID"),
  timestamp: z.number().nonnegative(),
});

export const SeekSchema = z.object({
  roomId: z.string().uuid("Invalid room ID"),
  timestamp: z.number().nonnegative(),
});

export const SyncSchema = z.object({
  roomId: z.string().uuid("Invalid room ID"),
});

export const ChangeVideoSchema = z.object({
  roomId: z.string().uuid("Invalid room ID"),
  videoId: z.string().min(1, "Video ID is required"),
});

export type PlayDTO = z.infer<typeof PlaySchema>;
export type PauseDTO = z.infer<typeof PauseSchema>;
export type SeekDTO = z.infer<typeof SeekSchema>;
export type SyncDTO = z.infer<typeof SyncSchema>;
export type ChangeVideoDTO = z.infer<typeof ChangeVideoSchema>;
