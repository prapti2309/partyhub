import { playbackRepository, PlaybackState } from "@/repositories/playback.repository";
import { roomRepository } from "@/repositories/room.repository";
import { ERROR_CODES } from "@/sockets/socket.constants";
import { getSocketIO } from "@/sockets/socket.server";
import { SOCKET_EVENTS } from "@/sockets/socket.constants";

export const playerService = {
  async ensureRoomAccess(roomId: string, userId: string) {
    const room = await roomRepository.findById(roomId);
    if (!room) {
      throw { code: ERROR_CODES.ROOM_NOT_FOUND, message: "Room not found" };
    }
    
    // Check if user is in room (could also check redis presence)
    const isOwner = room.ownerId === userId;
    return { room, isOwner };
  },

  async handlePlay(roomId: string, userId: string, position: number) {
    const { isOwner } = await playerService.ensureRoomAccess(roomId, userId);
    
    // For now, only owner can control playback, or check room settings
    if (!isOwner) {
      throw { code: ERROR_CODES.OWNER_REQUIRED, message: "Only the owner can play the video" };
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
        version: 1,
      };
    } else {
      state.playing = true;
      state.position = position;
      state.serverTimestamp = Date.now();
      state.updatedBy = userId;
      state.version += 1;
    }

    await playbackRepository.savePlaybackState(state);
    
    const io = getSocketIO();
    io.to(roomId).emit(SOCKET_EVENTS.PLAYER_PLAY, state);
    
    return state;
  },

  async handlePause(roomId: string, userId: string, position: number) {
    const { isOwner } = await playerService.ensureRoomAccess(roomId, userId);
    
    if (!isOwner) {
      throw { code: ERROR_CODES.OWNER_REQUIRED, message: "Only the owner can pause the video" };
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
        version: 1,
      };
    } else {
      state.playing = false;
      state.position = position;
      state.serverTimestamp = Date.now();
      state.updatedBy = userId;
      state.version += 1;
    }

    await playbackRepository.savePlaybackState(state);
    
    const io = getSocketIO();
    io.to(roomId).emit(SOCKET_EVENTS.PLAYER_PAUSE, state);
    
    return state;
  },

  async handleSeek(roomId: string, userId: string, position: number) {
    const { isOwner } = await playerService.ensureRoomAccess(roomId, userId);
    
    if (!isOwner) {
      throw { code: ERROR_CODES.OWNER_REQUIRED, message: "Only the owner can seek the video" };
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
        version: 1,
      };
    } else {
      state.position = position;
      state.serverTimestamp = Date.now();
      state.updatedBy = userId;
      state.version += 1;
    }

    await playbackRepository.savePlaybackState(state);
    
    const io = getSocketIO();
    io.to(roomId).emit(SOCKET_EVENTS.PLAYER_SEEK, state);
    
    return state;
  },

  async handleSync(roomId: string, userId: string) {
    await playerService.ensureRoomAccess(roomId, userId);
    
    const state = await playbackRepository.getPlaybackState(roomId);
    if (state) {
      // Send the current canonical state to the requesting user only, handled in the handler via ack
      return state;
    }
    return null;
  }
};
