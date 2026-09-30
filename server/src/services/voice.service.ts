// src/services/voice.service.ts
import { logger } from '@/utils/logger';
import { getSocketIO } from '@/sockets/socket.server';
import { voiceRepository } from '@/repositories/voice.repository';
import {
  VoiceJoinDTO,
  VoiceOfferDTO,
  VoiceAnswerDTO,
  VoiceIceCandidateDTO,
  VoiceMuteDTO,
  VoiceStateDTO,
} from '@/types/voice.types';

/**
 * Core business logic for voice communication.
 * All methods are async and interact with Redis via voiceRepository and broadcast
 * events to other participants using the Socket.IO server instance.
 */
export const voiceService = {
  /** User joins a voice room */
  async join(dto: VoiceJoinDTO, socketId: string) {
    const { roomId } = dto;
    await voiceRepository.addParticipant(roomId, socketId);
    // Notify existing participants of new peer
    const participants = await voiceRepository.getParticipants(roomId);
    const io = getSocketIO();
    participants.forEach((pid) => {
      if (pid !== socketId) {
        io.to(pid).emit('voice:peer-connected', { socketId, roomId });
      }
    });
    logger.info(`Voice join: socket ${socketId} joined room ${roomId}`);
  },

  /** User leaves a voice room */
  async leave(roomId: string, socketId: string) {
    await voiceRepository.removeParticipant(roomId, socketId);
    const participants = await voiceRepository.getParticipants(roomId);
    const io = getSocketIO();
    participants.forEach((pid) => {
      io.to(pid).emit('voice:peer-disconnected', { socketId, roomId });
    });
    logger.info(`Voice leave: socket ${socketId} left room ${roomId}`);
  },

  /** Handle SDP offer from caller */
  async handleOffer(dto: VoiceOfferDTO, socketId: string) {
    const { roomId, sdp } = dto;
    await voiceRepository.setLastSdp(roomId, socketId, sdp);
    // Forward offer to all other participants in the room
    const participants = await voiceRepository.getParticipants(roomId);
    const io = getSocketIO();
    participants.forEach((pid) => {
      if (pid !== socketId) {
        io.to(pid).emit('voice:offer', { from: socketId, roomId, sdp });
      }
    });
  },

  /** Handle SDP answer from callee */
  async handleAnswer(dto: VoiceAnswerDTO, socketId: string) {
    const { roomId, sdp } = dto;
    await voiceRepository.setLastSdp(roomId, socketId, sdp);
    const participants = await voiceRepository.getParticipants(roomId);
    const io = getSocketIO();
    participants.forEach((pid) => {
      if (pid !== socketId) {
        io.to(pid).emit('voice:answer', { from: socketId, roomId, sdp });
      }
    });
  },

  /** ICE candidate exchange */
  async handleIceCandidate(dto: VoiceIceCandidateDTO, socketId: string) {
    const { roomId, candidate } = dto;
    const participants = await voiceRepository.getParticipants(roomId);
    const io = getSocketIO();
    participants.forEach((pid) => {
      if (pid !== socketId) {
        io.to(pid).emit('voice:ice-candidate', { from: socketId, roomId, candidate });
      }
    });
  },

  /** Mute / unmute */
  async setMute(dto: VoiceMuteDTO, socketId: string) {
    const { roomId, muted } = dto;
    const io = getSocketIO();
    const participants = await voiceRepository.getParticipants(roomId);
    participants.forEach((pid) => {
      if (pid !== socketId) {
        io.to(pid).emit('voice:mute', { socketId, roomId, muted });
      }
    });
    logger.info(`Voice mute: socket ${socketId} muted=${muted} in room ${roomId}`);
  },

  /** Broadcast generic voice state */
  async broadcastState(dto: VoiceStateDTO) {
    const { roomId, state } = dto;
    const io = getSocketIO();
    io.to(roomId).emit('voice:state', { roomId, state });
  },
};
