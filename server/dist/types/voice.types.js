"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.VoiceStateSchema = exports.VoiceMuteSchema = exports.VoiceIceCandidateSchema = exports.VoiceAnswerSchema = exports.VoiceOfferSchema = exports.VoiceJoinSchema = void 0;
// src/types/voice.types.ts
const zod_1 = require("zod");
// Zod schemas for server-side validation (used by validators)
exports.VoiceJoinSchema = zod_1.z.object({
    roomId: zod_1.z.string().min(1),
    deviceLabel: zod_1.z.string().optional(),
});
exports.VoiceOfferSchema = zod_1.z.object({
    roomId: zod_1.z.string().min(1),
    sdp: zod_1.z.string().min(1),
});
exports.VoiceAnswerSchema = zod_1.z.object({
    roomId: zod_1.z.string().min(1),
    sdp: zod_1.z.string().min(1),
});
exports.VoiceIceCandidateSchema = zod_1.z.object({
    roomId: zod_1.z.string().min(1),
    candidate: zod_1.z.string().min(1),
});
exports.VoiceMuteSchema = zod_1.z.object({
    roomId: zod_1.z.string().min(1),
    muted: zod_1.z.boolean(),
});
exports.VoiceStateSchema = zod_1.z.object({
    roomId: zod_1.z.string().min(1),
    state: zod_1.z.string().min(1),
});
