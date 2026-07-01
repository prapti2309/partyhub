import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { logger } from "@/utils/logger";
import { SocketData } from "./socket.types";
import { getRedisAdapter } from "./socket.adapter";
import { socketAuthenticationMiddleware } from "./socket.authentication";

// Import Handlers
import { registerRoomHandlers } from "./handlers/room.handler";
import { registerPlayerHandlers } from "./handlers/player.handler";
import { registerChatHandlers } from "./handlers/chat.handler";
import { registerPresenceHandlers } from "./handlers/presence.handler";
import { registerVoiceHandlers } from "./handlers/voice.handler";

let ioInstance: SocketServer | null = null;

export function getSocketIO() {
  if (!ioInstance) {
    throw new Error("Socket.IO has not been initialized");
  }
  return ioInstance;
}

export function initSocketServer(server: HttpServer) {
  const io = new SocketServer<any, any, any, SocketData>(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
    adapter: getRedisAdapter(),
    pingInterval: 10000,
    pingTimeout: 5000,
  });

  ioInstance = io;

  // Socket connection authorization handshake middleware
  io.use(socketAuthenticationMiddleware);

  io.on("connection", (socket) => {
    logger.info(`🔌 [Socket.IO] New client connected: ${socket.id} (user: ${socket.data.user?.id})`);

    // Register Handlers
    registerRoomHandlers(io, socket);
    registerPlayerHandlers(io, socket);
    registerChatHandlers(io, socket);
    registerPresenceHandlers(io, socket);
    registerVoiceHandlers(io, socket);
    socket.on("disconnect", (reason) => {
      logger.info(`🔌 [Socket.IO] Client disconnected: ${socket.id} (user: ${socket.data.user?.id}), Reason: ${reason}`);
      // Actual cleanup is done inside presence/room handlers listening to disconnect
    });
  });

  return io;
}
