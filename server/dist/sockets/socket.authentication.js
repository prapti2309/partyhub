"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.socketAuthenticationMiddleware = void 0;
const jwt_1 = require("@/utils/jwt");
const session_repository_1 = require("@/repositories/session.repository");
const user_repository_1 = require("@/repositories/user.repository");
const socket_constants_1 = require("./socket.constants");
const socketAuthenticationMiddleware = async (socket, next) => {
    const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
    if (!token) {
        return next(new Error(socket_constants_1.ERROR_CODES.UNAUTHORIZED));
    }
    try {
        const accessToken = token.startsWith("Bearer ") ? token.split(" ")[1] : token;
        const payload = (0, jwt_1.verifyAccessToken)(accessToken);
        // Verify Redis session active
        const session = await session_repository_1.sessionRepository.getSession(payload.sessionId);
        if (!session) {
            return next(new Error(socket_constants_1.ERROR_CODES.UNAUTHORIZED));
        }
        // Verify user version matches
        const user = await user_repository_1.userRepository.findById(payload.userId);
        if (!user || user.tokenVersion !== payload.tokenVersion) {
            return next(new Error(socket_constants_1.ERROR_CODES.UNAUTHORIZED));
        }
        // Attach user state to socket context data
        socket.data.user = {
            id: user.id,
            email: user.email,
            role: user.role,
            sessionId: payload.sessionId,
        };
        socket.data.sessionId = payload.sessionId;
        next();
    }
    catch (err) {
        next(new Error(socket_constants_1.ERROR_CODES.UNAUTHORIZED));
    }
};
exports.socketAuthenticationMiddleware = socketAuthenticationMiddleware;
