import { z } from "zod";

export const createRoomSchema = {
  body: z.object({
    name: z.string().min(3, "Room name must be at least 3 characters").max(100, "Room name must not exceed 100 characters"),
    isPrivate: z.boolean().optional(),
    password: z.string().min(4, "Password must be at least 4 characters").max(50, "Password must not exceed 50 characters").optional(),
  }),
};

export const joinRoomSchema = {
  body: z.object({
    socketId: z.string().optional(),
    username: z.string().min(2, "Username must be at least 2 characters").max(50, "Username must not exceed 50 characters").optional(),
    password: z.string().optional(),
  }),
};

export const transferOwnerSchema = {
  body: z.object({
    newOwnerId: z.string().min(1, "New owner ID is required"),
  }),
};

export const kickUserSchema = {
  body: z.object({
    targetUserId: z.string().min(1, "Target user ID is required"),
    reason: z.string().max(200, "Reason must not exceed 200 characters").optional(),
  }),
};

export const banUserSchema = {
  body: z.object({
    targetUserId: z.string().min(1, "Target user ID is required"),
    reason: z.string().max(200, "Reason must not exceed 200 characters").optional(),
    expiresAt: z.string().datetime("Invalid ISO datetime string").optional(),
  }),
};

export const unbanUserSchema = {
  body: z.object({
    targetUserId: z.string().min(1, "Target user ID is required"),
  }),
};
