"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.unbanUserSchema = exports.banUserSchema = exports.kickUserSchema = exports.transferOwnerSchema = exports.joinRoomSchema = exports.createRoomSchema = void 0;
const zod_1 = require("zod");
exports.createRoomSchema = {
    body: zod_1.z.object({
        name: zod_1.z.string().min(3, "Room name must be at least 3 characters").max(100, "Room name must not exceed 100 characters"),
        isPrivate: zod_1.z.boolean().optional(),
        password: zod_1.z.string().min(4, "Password must be at least 4 characters").max(50, "Password must not exceed 50 characters").optional(),
    }),
};
exports.joinRoomSchema = {
    body: zod_1.z.object({
        socketId: zod_1.z.string().optional(),
        username: zod_1.z.string().min(2, "Username must be at least 2 characters").max(50, "Username must not exceed 50 characters").optional(),
        password: zod_1.z.string().optional(),
    }),
};
exports.transferOwnerSchema = {
    body: zod_1.z.object({
        newOwnerId: zod_1.z.string().min(1, "New owner ID is required"),
    }),
};
exports.kickUserSchema = {
    body: zod_1.z.object({
        targetUserId: zod_1.z.string().min(1, "Target user ID is required"),
        reason: zod_1.z.string().max(200, "Reason must not exceed 200 characters").optional(),
    }),
};
exports.banUserSchema = {
    body: zod_1.z.object({
        targetUserId: zod_1.z.string().min(1, "Target user ID is required"),
        reason: zod_1.z.string().max(200, "Reason must not exceed 200 characters").optional(),
        expiresAt: zod_1.z.string().datetime("Invalid ISO datetime string").optional(),
    }),
};
exports.unbanUserSchema = {
    body: zod_1.z.object({
        targetUserId: zod_1.z.string().min(1, "Target user ID is required"),
    }),
};
