import { Server as HttpServer } from "http";
import { Server as SocketServer } from "socket.io";
import { logger } from "@/utils/logger";
import { SocketData } from "@/types/socket.types";
import { verifyAccessToken } from "@/utils/jwt";
import { sessionRepository } from "@/repositories/session.repository";
import { userRepository } from "@/repositories/user.repository";
import { roomService } from "@/services/room.service";
import { roomRepository } from "@/repositories/room.repository";

let ioInstance: SocketServer | null = null;

export function getSocketIO() {
  return ioInstance;
}

export function initSocketServer(server: HttpServer) {
  const io = new SocketServer<any, any, any, SocketData>(server, {
    cors: {
      origin: "*",
      methods: ["GET", "POST"],
    },
  });

  ioInstance = io;

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

    // Handle Join Room (supports both styles)
    const handleJoin = async (payload: { roomCode: string; username?: string }) => {
      try {
        const { roomCode, username } = payload;
        const resolvedUsername = username || socket.data.user?.email || "Guest";
        
        const { room, participant } = await roomService.joinRoom(
          socket.data.user.id,
          roomCode,
          socket.id,
          resolvedUsername
        );
        
        socket.join(room.id);
        socket.emit("ROOM_JOINED", { room, participant });
      } catch (err: any) {
        logger.error("Socket error on join", { err, user: socket.data.user?.id });
        socket.emit("error", { message: err.message });
      }
    };

    socket.on("room:join", handleJoin);
    socket.on("JOIN_ROOM", handleJoin);

    // Handle Leave Room
    const handleLeave = async (payload: { roomId: string }) => {
      try {
        const { roomId } = payload;
        await roomService.leaveRoom(socket.data.user.id, roomId, socket.id);
        socket.leave(roomId);
        socket.emit("ROOM_LEFT", { roomId });
      } catch (err: any) {
        socket.emit("error", { message: err.message });
      }
    };

    socket.on("room:leave", handleLeave);
    socket.on("LEAVE_ROOM", handleLeave);

    // Handle Ping/Heartbeat
    socket.on("PING", async () => {
      try {
        await roomRepository.updateHeartbeat(socket.data.user.id);
        socket.emit("PONG");
      } catch (err) {}
    });

    // Handle Transfer Owner
    socket.on("TRANSFER_OWNER", async (payload: { roomId: string; newOwnerId: string }) => {
      try {
        const { roomId, newOwnerId } = payload;
        await roomService.transferOwnershipManually(roomId, socket.data.user.id, newOwnerId);
      } catch (err: any) {
        socket.emit("error", { message: err.message });
      }
    });

    socket.on("disconnect", async () => {
      logger.info(`🔌 [Socket.IO] Client disconnected: ${socket.id} (user: ${socket.data.user?.id})`);
      try {
        await roomService.handleSocketDisconnect(socket.id);
      } catch (err) {
        logger.error("Error handling socket disconnect", { err });
      }
    });
  });

  return io;
}

export type AppSocketServer = ReturnType<typeof initSocketServer>;

