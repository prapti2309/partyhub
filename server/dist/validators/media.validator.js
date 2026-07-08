"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.QualitySchema = exports.SpeakingSchema = exports.PermissionsSchema = exports.DeviceUpdateSchema = exports.ScreenStopSchema = exports.ScreenStartSchema = exports.CameraOffSchema = exports.CameraOnSchema = void 0;
const zod_1 = require("zod");
const baseMediaSchema = zod_1.z.object({
    roomId: zod_1.z.string().uuid("Invalid room ID"),
});
exports.CameraOnSchema = baseMediaSchema;
exports.CameraOffSchema = baseMediaSchema;
exports.ScreenStartSchema = baseMediaSchema;
exports.ScreenStopSchema = baseMediaSchema;
exports.DeviceUpdateSchema = baseMediaSchema.extend({
    hasAudio: zod_1.z.boolean(),
    hasVideo: zod_1.z.boolean(),
});
exports.PermissionsSchema = baseMediaSchema.extend({
    audio: zod_1.z.boolean(),
    video: zod_1.z.boolean(),
    screen: zod_1.z.boolean(),
});
exports.SpeakingSchema = baseMediaSchema.extend({
    isSpeaking: zod_1.z.boolean(),
});
exports.QualitySchema = baseMediaSchema.extend({
    quality: zod_1.z.enum(["high", "medium", "low", "poor"]),
});
