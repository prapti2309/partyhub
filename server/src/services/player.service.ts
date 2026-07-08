import { prisma } from '@/config/prisma';
import { playbackRepository } from '@/repositories/playback.repository';
import { ERROR_CODES } from '@/sockets/socket.constants';
import { getSocketIO } from '@/sockets/socket.server';
import { SOCKET_EVENTS } from '@/sockets/socket.constants';

/**
 * Validates that a room exists and returns room + ownership info.
 */
async function ensureRoomAccess(roomId: string, userId: string) {
  const room = await prisma.room.findUnique({ where: { id: roomId } });
  if (!room) {
    throw { code: ERROR_CODES.ROOM_NOT_FOUND, message: 'Room not found' };
  }
  const isOwner = room.ownerId === userId;
  return { room, isOwner };
}

export const playerService = {
  ensureRoomAccess,

  async handlePlay(roomId: string, userId: string, position: number) {
    const { isOwner } = await ensureRoomAccess(roomId, userId);

    if (!isOwner) {
      throw { code: ERROR_CODES.OWNER_REQUIRED, message: 'Only the owner can play the video' };
    }

    let state = await playbackRepository.getPlaybackState(roomId);
    if (!state) {
      state = {
        roomId,
        playing: true,
        position,
        playbackRate: 1,
        serverTimestamp: Date.now(),
        updatedBy: userId,
        version: 0,
      };
      await playbackRepository.savePlaybackState(state);
    } else {
      state.playing = true;
      state.position = position;
      state.updatedBy = userId;
      await playbackRepository.updatePlaybackState(state, state.version);
    }

    const io = getSocketIO();
    io.to(roomId).emit(SOCKET_EVENTS.PLAYER_STATE, state);

    return state;
  },

  async handlePause(roomId: string, userId: string, position: number) {
    const { isOwner } = await ensureRoomAccess(roomId, userId);

    if (!isOwner) {
      throw { code: ERROR_CODES.OWNER_REQUIRED, message: 'Only the owner can pause the video' };
    }

    let state = await playbackRepository.getPlaybackState(roomId);
    if (!state) {
      state = {
        roomId,
        playing: false,
        position,
        playbackRate: 1,
        serverTimestamp: Date.now(),
        updatedBy: userId,
        version: 0,
      };
      await playbackRepository.savePlaybackState(state);
    } else {
      state.playing = false;
      state.position = position;
      state.updatedBy = userId;
      await playbackRepository.updatePlaybackState(state, state.version);
    }

    const io = getSocketIO();
    io.to(roomId).emit(SOCKET_EVENTS.PLAYER_STATE, state);

    return state;
  },

  async handleSeek(roomId: string, userId: string, position: number) {
    const { isOwner } = await ensureRoomAccess(roomId, userId);

    if (!isOwner) {
      throw { code: ERROR_CODES.OWNER_REQUIRED, message: 'Only the owner can seek the video' };
    }

    let state = await playbackRepository.getPlaybackState(roomId);
    if (!state) {
      state = {
        roomId,
        playing: false,
        position,
        playbackRate: 1,
        serverTimestamp: Date.now(),
        updatedBy: userId,
        version: 0,
      };
      await playbackRepository.savePlaybackState(state);
    } else {
      state.position = position;
      state.updatedBy = userId;
      await playbackRepository.updatePlaybackState(state, state.version);
    }

    const io = getSocketIO();
    io.to(roomId).emit(SOCKET_EVENTS.PLAYER_STATE, state);

    return state;
  },

  async handleSync(roomId: string, userId: string) {
    await ensureRoomAccess(roomId, userId);
    const state = await playbackRepository.getPlaybackState(roomId);
    return state ?? null;
  },
};
