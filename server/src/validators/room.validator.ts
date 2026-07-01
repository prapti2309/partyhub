import { z } from "zod";

export const JoinRoomSchema = z.object({
  roomId: z.string().uuid("Invalid room ID"),
  username: z.string().min(1, "Username is required").optional(),
});

export const LeaveRoomSchema = z.object({
  roomId: z.string().uuid("Invalid room ID"),
});

export const TransferOwnerSchema = z.object({
  roomId: z.string().uuid("Invalid room ID"),
  newOwnerId: z.string().uuid("Invalid user ID"),
});

export type JoinRoomDTO = z.infer<typeof JoinRoomSchema>;
export type LeaveRoomDTO = z.infer<typeof LeaveRoomSchema>;
export type TransferOwnerDTO = z.infer<typeof TransferOwnerSchema>;
