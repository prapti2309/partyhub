"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initSocketServer = initSocketServer;
const socket_io_1 = require("socket.io");
const logger_1 = require("../utils/logger");
const jwt_1 = require("../utils/jwt");
const session_repository_1 = require("../repositories/session.repository");
const user_repository_1 = require("../repositories/user.repository");
function initSocketServer(server) {
    const io = new socket_io_1.Server(server, {
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
            const payload = (0, jwt_1.verifyAccessToken)(accessToken);
            // Verify Redis session active
            const session = await session_repository_1.sessionRepository.getSession(payload.sessionId);
            if (!session) {
                return next(new Error("Session is revoked or expired"));
            }
            // Verify user version matches
            const user = await user_repository_1.userRepository.findById(payload.userId);
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
        }
        catch (err) {
            next(new Error("Invalid or expired authentication token"));
        }
    });
    io.on("connection", (socket) => {
        logger_1.logger.info(`🔌 [Socket.IO] New client connection established: ${socket.id} (user: ${socket.data.user?.id})`);
        socket.on("disconnect", () => {
            logger_1.logger.info(`🔌 [Socket.IO] Client disconnected: ${socket.id} (user: ${socket.data.user?.id})`);
        });
    });
    return io;
}
