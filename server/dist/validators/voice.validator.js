"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.validateVoiceState = exports.validateVoiceMute = exports.validateVoiceIceCandidate = exports.validateVoiceAnswer = exports.validateVoiceOffer = exports.validateVoiceJoin = void 0;
const voice_types_1 = require("../types/voice.types");
/**
 * Validation helpers for Voice signaling payloads.
 * Each function validates the incoming plain object and returns the typed DTO.
 * Throws a ZodError if validation fails.
 */
const validateVoiceJoin = (data) => {
    return voice_types_1.VoiceJoinSchema.parse(data);
};
exports.validateVoiceJoin = validateVoiceJoin;
const validateVoiceOffer = (data) => {
    return voice_types_1.VoiceOfferSchema.parse(data);
};
exports.validateVoiceOffer = validateVoiceOffer;
const validateVoiceAnswer = (data) => {
    return voice_types_1.VoiceAnswerSchema.parse(data);
};
exports.validateVoiceAnswer = validateVoiceAnswer;
const validateVoiceIceCandidate = (data) => {
    return voice_types_1.VoiceIceCandidateSchema.parse(data);
};
exports.validateVoiceIceCandidate = validateVoiceIceCandidate;
const validateVoiceMute = (data) => {
    return voice_types_1.VoiceMuteSchema.parse(data);
};
exports.validateVoiceMute = validateVoiceMute;
const validateVoiceState = (data) => {
    return voice_types_1.VoiceStateSchema.parse(data);
};
exports.validateVoiceState = validateVoiceState;
