import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { logger } from "@/utils/logger";
import { ClientToServerEvents, ServerToClientEvents, SocketData } from "@/types/socket.types";
import { verifyAccessToken } from "@/utils/jwt";
import { sessionRepository } from "@/repositories/session.repository";
import { userRepository } from "@/repositories/user.repository";

export function initSocketServer(server: HttpServer) {
  const io = new SocketServer<ClientToServerEvents, ServerToClientEvents, any, SocketData>(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  // Socket connection authorization handshake middleware
  io.use(async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
    if (!token) {
      return next(new Error("Authentication credentials required"));
    }

    try {
      const accessToken = token.startsWith("Bearer ") ? token.split(" ")[1] : token;
      const payload = verifyAccessToken(accessToken);

      // Verify Redis session active
      const session = await sessionRepository.getSession(payload.sessionId);
      if (!session) {
        return next(new Error("Session is revoked or expired"));
      }

      // Verify user version matches
      const user = await userRepository.findById(payload.userId);
      if (!user || user.tokenVersion !== payload.tokenVersion) {
        return next(new Error("Session version invalid. Re-authentication required."));
      }

      // Attach user state to socket context data
      socket.data.user = {
        id: user.id,
        email: user.email,
        role: user.role,
      };
      socket.data.sessionId = payload.sessionId;

      next();
    } catch (err) {
      next(new Error("Invalid or expired authentication token"));
    }
  });

  io.on("connection", (socket) => {
    logger.info(`🔌 [Socket.IO] New client connection established: ${socket.id} (user: ${socket.data.user?.id})`);

    socket.on("disconnect", () => {
      logger.info(`🔌 [Socket.IO] Client disconnected: ${socket.id} (user: ${socket.data.user?.id})`);
    });
  });

  return io;
}
export type AppSocketServer = ReturnType<typeof initSocketServer>;
