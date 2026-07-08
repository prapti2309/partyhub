"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerVoiceHandlers = registerVoiceHandlers;
const socket_constants_1 = require("../socket.constants");
const voice_validator_1 = require("@/validators/voice.validator");
const voice_service_1 = require("@/services/voice.service");
const logger_1 = require("@/utils/logger");
/**
 * Register all voice‑related Socket.IO events.
 * All events are namespaced under the constants defined in `socket.constants.ts`.
 * Validation is performed using the Zod schemas from `voice.validator.ts`.
 */
function registerVoiceHandlers(io, socket) {
    // JOIN ---------------------------------------------------------------
    socket.on(socket_constants_1.SOCKET_EVENTS.VOICE_JOIN, async (payload, ack) => {
        try {
            const dto = (0, voice_validator_1.validateVoiceJoin)(payload);
            await voice_service_1.voiceService.join(dto, socket.id);
            ack && ack({ success: true });
        }
        catch (err) {
            logger_1.logger.error('Voice join validation error', err);
            ack && ack({ success: false, error: err.message });
        }
    });
    // LEAVE --------------------------------------------------------------
    socket.on("voice:leave", async (payload, ack) => {
        try {
            // payload must contain roomId
            const { roomId } = payload;
            await voice_service_1.voiceService.leave(roomId, socket.id);
            ack && ack({ success: true });
        }
        catch (err) {
            logger_1.logger.error('Voice leave error', err);
            ack && ack({ success: false, error: err.message });
        }
    });
    // OFFER --------------------------------------------------------------
    socket.on(socket_constants_1.SOCKET_EVENTS.VOICE_OFFER, async (payload, ack) => {
        try {
            const dto = (0, voice_validator_1.validateVoiceOffer)(payload);
            await voice_service_1.voiceService.handleOffer(dto, socket.id);
            ack && ack({ success: true });
        }
        catch (err) {
            logger_1.logger.error('Voice offer error', err);
            ack && ack({ success: false, error: err.message });
        }
    });
    // ANSWER -------------------------------------------------------------
    socket.on(socket_constants_1.SOCKET_EVENTS.VOICE_ANSWER, async (payload, ack) => {
        try {
            const dto = (0, voice_validator_1.validateVoiceAnswer)(payload);
            await voice_service_1.voiceService.handleAnswer(dto, socket.id);
            ack && ack({ success: true });
        }
        catch (err) {
            logger_1.logger.error('Voice answer error', err);
            ack && ack({ success: false, error: err.message });
        }
    });
    // ICE CANDIDATE ------------------------------------------------------
    socket.on(socket_constants_1.SOCKET_EVENTS.VOICE_ICE_CANDIDATE, async (payload, ack) => {
        try {
            const dto = (0, voice_validator_1.validateVoiceIceCandidate)(payload);
            await voice_service_1.voiceService.handleIceCandidate(dto, socket.id);
            ack && ack({ success: true });
        }
        catch (err) {
            logger_1.logger.error('Voice ICE candidate error', err);
            ack && ack({ success: false, error: err.message });
        }
    });
    // MUTE / UNMUTE ------------------------------------------------------
    socket.on(socket_constants_1.SOCKET_EVENTS.VOICE_MUTE, async (payload, ack) => {
        try {
            const dto = (0, voice_validator_1.validateVoiceMute)(payload);
            await voice_service_1.voiceService.setMute(dto, socket.id);
            ack && ack({ success: true });
        }
        catch (err) {
            logger_1.logger.error('Voice mute error', err);
            ack && ack({ success: false, error: err.message });
        }
    });
    // Cleanup on disconnect: ensure the participant is removed from the voice room
    socket.on("disconnect", async () => {
        try {
            const roomId = socket.data.roomId;
            if (roomId) {
                await voice_service_1.voiceService.leave(roomId, socket.id);
            }
        }
        catch (err) {
            logger_1.logger.error('Voice cleanup on disconnect failed', err);
        }
    });
}
