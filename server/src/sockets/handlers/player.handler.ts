import { Server, Socket } from "socket.io";
import { SocketData } from "../socket.types";
import { SOCKET_EVENTS } from "../socket.constants";
import { validatePayload, withErrorHandling } from "../socket.middleware";
import { PlaySchema, PlayDTO, PauseSchema, PauseDTO, SeekSchema, SeekDTO, SyncSchema, SyncDTO } from "@/validators/player.validator";
import { playerService } from "@/services/player.service";
import { createSuccessResponse } from "../socket.utils";

export const registerPlayerHandlers = (io: Server, socket: Socket<any, any, any, SocketData>) => {
  const userId = socket.data.user.id;
  const roomId = socket.data.roomId; // Assuming roomId stored in socket data

  socket.on(SOCKET_EVENTS.PLAYER_PLAY, async (payload, ack) => {
    await withErrorHandling(async (socket, data, ackFn) => {
      const validated = validatePayload(PlaySchema)(data, ackFn);
      if (!validated.success) return;
      const { roomId, timestamp } = validated.data as PlayDTO;

      const state = await playerService.handlePlay(roomId, userId, timestamp);
      io.to(roomId).emit(SOCKET_EVENTS.PLAYBACK_BROADCAST, state);

      if (typeof ackFn === "function") {
        ackFn(createSuccessResponse(state));
      }
    })(socket, payload, ack);
  });

  socket.on(SOCKET_EVENTS.PLAYER_PAUSE, async (payload, ack) => {
    await withErrorHandling(async (socket, data, ackFn) => {
      const validated = validatePayload(PauseSchema)(data, ackFn);
      if (!validated.success) return;
      const { roomId, timestamp } = validated.data as PauseDTO;

      const state = await playerService.handlePause(roomId, userId, timestamp);
      io.to(roomId).emit(SOCKET_EVENTS.PLAYBACK_BROADCAST, state);

      if (typeof ackFn === "function") {
        ackFn(createSuccessResponse(state));
      }
    })(socket, payload, ack);
  });

  socket.on(SOCKET_EVENTS.PLAYER_SEEK, async (payload, ack) => {
    await withErrorHandling(async (socket, data, ackFn) => {
      const validated = validatePayload(SeekSchema)(data, ackFn);
      if (!validated.success) return;
      const { roomId, timestamp } = validated.data as SeekDTO;

      const state = await playerService.handleSeek(roomId, userId, timestamp);
      io.to(roomId).emit(SOCKET_EVENTS.PLAYBACK_BROADCAST, state);

      if (typeof ackFn === "function") {
        ackFn(createSuccessResponse(state));
      }
    })(socket, payload, ack);
  });

  socket.on(SOCKET_EVENTS.PLAYBACK_SYNC, async (payload, ack) => {
    await withErrorHandling(async (socket, data, ackFn) => {
      const validated = validatePayload(SyncSchema)(data, ackFn);
      if (!validated.success) return;
      const { roomId } = validated.data as SyncDTO;

      const state = await playerService.handleSync(roomId, userId);
      if (typeof ackFn === "function") {
        ackFn(createSuccessResponse(state));
      }
    })(socket, payload, ack);
  });
    await withErrorHandling(async (socket, data, ackFn) => {
      const validated = validatePayload(SyncSchema)(data, ackFn);
      if (!validated.success) return;
      const { roomId } = validated.data as SyncDTO;

      const state = await playerService.handleSync(roomId, userId);

      if (typeof ackFn === "function") {
        ackFn(createSuccessResponse(state));
      }
    })(socket, payload, ack);
  });
};
