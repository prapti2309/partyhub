import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { logger } from "@/utils/logger";
import { ClientToServerEvents, ServerToClientEvents } from "@/types/socket.types";

export function initSocketServer(server: HttpServer) {
  const io = new SocketServer<ClientToServerEvents, ServerToClientEvents>(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  io.on("connection", (socket) => {
    logger.info(`🔌 [Socket.IO] New client connection established: ${socket.id}`);

    socket.on("disconnect", () => {
      logger.info(`🔌 [Socket.IO] Client disconnected: ${socket.id}`);
    });
  });

  return io;
}
export type AppSocketServer = ReturnType<typeof initSocketServer>;
