"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.TransferOwnerSchema = exports.LeaveRoomSchema = exports.JoinRoomSchema = void 0;
const zod_1 = require("zod");
exports.JoinRoomSchema = zod_1.z.object({
    roomId: zod_1.z.string().uuid("Invalid room ID"),
    username: zod_1.z.string().min(1, "Username is required").optional(),
});
exports.LeaveRoomSchema = zod_1.z.object({
    roomId: zod_1.z.string().uuid("Invalid room ID"),
});
exports.TransferOwnerSchema = zod_1.z.object({
    roomId: zod_1.z.string().uuid("Invalid room ID"),
    newOwnerId: zod_1.z.string().uuid("Invalid user ID"),
});
