import { Server, Socket } from "socket.io";
import { SocketData } from "../socket.types";
import { SOCKET_EVENTS } from "../socket.constants";
import { validatePayload, withErrorHandling } from "../socket.middleware";
import { JoinRoomSchema, JoinRoomDTO, LeaveRoomSchema, LeaveRoomDTO, TransferOwnerSchema, TransferOwnerDTO } from "@/validators/room.validator";
import { roomService } from "@/services/room.service";
import { presenceService } from "@/services/presence.service";
import { createSuccessResponse } from "../socket.utils";
import { socketRegistry } from "../socket.registry";

export const registerRoomHandlers = (io: Server, socket: Socket<any, any, any, SocketData>) => {
  const userId = socket.data.user.id;

  socket.on(SOCKET_EVENTS.ROOM_JOIN, async (payload: any, ack: any) => {
    await withErrorHandling(async (_sock, data, ackFn) => {
      const validated = validatePayload(JoinRoomSchema)(data, ackFn);
      if (!validated.success) return;
      const { roomId, username } = validated.data as JoinRoomDTO;

      const resolvedUsername = username || socket.data.user.email || "Guest";
      
      const { room, participant } = await roomService.joinRoom(
        userId,
        roomId,
        socket.id,
        resolvedUsername
      );

      socket.join(room.id);
      socket.data.roomId = room.id;
      
      await socketRegistry.registerSocket(socket.id, userId);
      await socketRegistry.updateRoom(socket.id, room.id);
      
      await presenceService.handleUserJoin(room.id, userId, socket.id);

      if (typeof ackFn === "function") {
        ackFn(createSuccessResponse({ room, participant }));
      }
    })(socket, payload, ack);
  });

  socket.on(SOCKET_EVENTS.ROOM_LEAVE, async (payload: any, ack: any) => {
    await withErrorHandling(async (_sock, data, ackFn) => {
      const validated = validatePayload(LeaveRoomSchema)(data, ackFn);
      if (!validated.success) return;
      const { roomId } = validated.data as LeaveRoomDTO;

      await roomService.leaveRoom(userId, roomId, socket.id);
      socket.leave(roomId);
      socket.data.roomId = undefined;
      
      await socketRegistry.updateRoom(socket.id, null);
      await presenceService.handleUserLeave(roomId, userId);

      if (typeof ackFn === "function") {
        ackFn(createSuccessResponse({ success: true }));
      }
    })(socket, payload, ack);
  });

  socket.on(SOCKET_EVENTS.ROOM_TRANSFER, async (payload: any, ack: any) => {
    await withErrorHandling(async (_sock, data, ackFn) => {
      const validated = validatePayload(TransferOwnerSchema)(data, ackFn);
      if (!validated.success) return;
      const { roomId, newOwnerId } = validated.data as TransferOwnerDTO;

      await roomService.transferOwnershipManually(roomId, userId, newOwnerId);
      
      io.to(roomId).emit(SOCKET_EVENTS.ROOM_OWNERSHIP_TRANSFERRED, { newOwnerId });

      if (typeof ackFn === "function") {
        ackFn(createSuccessResponse({ success: true }));
      }
    })(socket, payload, ack);
  });
};
