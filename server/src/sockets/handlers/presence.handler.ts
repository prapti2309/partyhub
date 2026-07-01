import { Server, Socket } from "socket.io";
import { SocketData } from "../socket.types";
import { SOCKET_EVENTS } from "../socket.constants";
import { createSuccessResponse } from "../socket.utils";
import { socketRegistry } from "../socket.registry";
import { roomService } from "@/services/room.service";

export const registerPresenceHandlers = (io: Server, socket: Socket<any, any, any, SocketData>) => {
  const userId = socket.data.user.id;

  socket.on(SOCKET_EVENTS.PING, async (payload, ack) => {
    try {
      await socketRegistry.updateHeartbeat(socket.id);
      
      // We could also run room heartbeat logic here if needed
      if (socket.data.roomId) {
        // e.g. roomService.updateHeartbeat(socket.data.roomId, userId)
      }

      if (typeof ack === "function") {
        ack(createSuccessResponse({ timestamp: Date.now() }));
      } else {
        socket.emit(SOCKET_EVENTS.PONG, { timestamp: Date.now() });
      }
    } catch (err) {
      // Ignore heartbeat errors
    }
  });

  socket.on("disconnect", async () => {
    try {
      const socketInfo = await socketRegistry.getSocket(socket.id);
      if (socketInfo && socketInfo.roomId) {
        await roomService.leaveRoom(userId, socketInfo.roomId, socket.id);
      }
      await socketRegistry.removeSocket(socket.id);
    } catch (err) {
      console.error("Error during disconnect presence handling", err);
    }
  });
};
