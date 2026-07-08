"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ChangeVideoSchema = exports.SyncSchema = exports.SeekSchema = exports.PauseSchema = exports.PlaySchema = void 0;
const zod_1 = require("zod");
exports.PlaySchema = zod_1.z.object({
    roomId: zod_1.z.string().uuid("Invalid room ID"),
    timestamp: zod_1.z.number().nonnegative(),
});
exports.PauseSchema = zod_1.z.object({
    roomId: zod_1.z.string().uuid("Invalid room ID"),
    timestamp: zod_1.z.number().nonnegative(),
});
exports.SeekSchema = zod_1.z.object({
    roomId: zod_1.z.string().uuid("Invalid room ID"),
    timestamp: zod_1.z.number().nonnegative(),
});
exports.SyncSchema = zod_1.z.object({
    roomId: zod_1.z.string().uuid("Invalid room ID"),
});
exports.ChangeVideoSchema = zod_1.z.object({
    roomId: zod_1.z.string().uuid("Invalid room ID"),
    videoId: zod_1.z.string().min(1, "Video ID is required"),
});
