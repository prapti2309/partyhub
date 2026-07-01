// src/sockets/handlers/voice.handler.ts
import { Socket } from "socket.io";
import { Server as SocketServer } from "socket.io";
import { SOCKET_EVENTS } from "../socket.constants";
import {
  validateVoiceJoin,
  validateVoiceOffer,
  validateVoiceAnswer,
  validateVoiceIceCandidate,
  validateVoiceMute,
} from "@/validators/voice.validator";
import { voiceService } from "@/services/voice.service";
import { logger } from "@/utils/logger";

/**
 * Register all voice‑related Socket.IO events.
 * All events are namespaced under the constants defined in `socket.constants.ts`.
 * Validation is performed using the Zod schemas from `voice.validator.ts`.
 */
export function registerVoiceHandlers(io: SocketServer, socket: Socket) {
  // JOIN ---------------------------------------------------------------
  socket.on(SOCKET_EVENTS.VOICE_JOIN, async (payload: any, ack: any) => {
    try {
      const dto = validateVoiceJoin(payload);
      await voiceService.join(dto, socket.id);
      ack && ack({ success: true });
    } catch (err: any) {
      logger.error('Voice join validation error', err);
      ack && ack({ success: false, error: err.message });
    }
  });

  // LEAVE --------------------------------------------------------------
  socket.on("voice:leave", async (payload: any, ack: any) => {
    try {
      // payload must contain roomId
      const { roomId } = payload;
      await voiceService.leave(roomId, socket.id);
      ack && ack({ success: true });
    } catch (err: any) {
      logger.error('Voice leave error', err);
      ack && ack({ success: false, error: err.message });
    }
  });

  // OFFER --------------------------------------------------------------
  socket.on(SOCKET_EVENTS.VOICE_OFFER, async (payload: any, ack: any) => {
    try {
      const dto = validateVoiceOffer(payload);
      await voiceService.handleOffer(dto, socket.id);
      ack && ack({ success: true });
    } catch (err: any) {
      logger.error('Voice offer error', err);
      ack && ack({ success: false, error: err.message });
    }
  });

  // ANSWER -------------------------------------------------------------
  socket.on(SOCKET_EVENTS.VOICE_ANSWER, async (payload: any, ack: any) => {
    try {
      const dto = validateVoiceAnswer(payload);
      await voiceService.handleAnswer(dto, socket.id);
      ack && ack({ success: true });
    } catch (err: any) {
      logger.error('Voice answer error', err);
      ack && ack({ success: false, error: err.message });
    }
  });

  // ICE CANDIDATE ------------------------------------------------------
  socket.on(SOCKET_EVENTS.VOICE_ICE_CANDIDATE, async (payload: any, ack: any) => {
    try {
      const dto = validateVoiceIceCandidate(payload);
      await voiceService.handleIceCandidate(dto, socket.id);
      ack && ack({ success: true });
    } catch (err: any) {
      logger.error('Voice ICE candidate error', err);
      ack && ack({ success: false, error: err.message });
    }
  });

  // MUTE / UNMUTE ------------------------------------------------------
  socket.on(SOCKET_EVENTS.VOICE_MUTE, async (payload: any, ack: any) => {
    try {
      const dto = validateVoiceMute(payload);
      await voiceService.setMute(dto, socket.id);
      ack && ack({ success: true });
    } catch (err: any) {
      logger.error('Voice mute error', err);
      ack && ack({ success: false, error: err.message });
    }
  });

  // Cleanup on disconnect: ensure the participant is removed from the voice room
  socket.on("disconnect", async () => {
    try {
      const roomId = socket.data.roomId;
      if (roomId) {
        await voiceService.leave(roomId, socket.id);
      }
    } catch (err: any) {
      logger.error('Voice cleanup on disconnect failed', err);
    }
  });
}
