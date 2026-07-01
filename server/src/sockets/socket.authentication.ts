import { Socket } from "socket.io";
import { ExtendedError } from "socket.io/dist/namespace";
import { verifyAccessToken } from "@/utils/jwt";
import { sessionRepository } from "@/repositories/session.repository";
import { userRepository } from "@/repositories/user.repository";
import { SocketData } from "./socket.types";
import { ERROR_CODES } from "./socket.constants";

export const socketAuthenticationMiddleware = async (
  socket: Socket<any, any, any, SocketData>,
  next: (err?: ExtendedError) => void
) => {
  const token = socket.handshake.auth?.token || socket.handshake.headers?.authorization;
  if (!token) {
    return next(new Error(ERROR_CODES.UNAUTHORIZED));
  }

  try {
    const accessToken = token.startsWith("Bearer ") ? token.split(" ")[1] : token;
    const payload = verifyAccessToken(accessToken);

    // Verify Redis session active
    const session = await sessionRepository.getSession(payload.sessionId);
    if (!session) {
      return next(new Error(ERROR_CODES.UNAUTHORIZED));
    }

    // Verify user version matches
    const user = await userRepository.findById(payload.userId);
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      return next(new Error(ERROR_CODES.UNAUTHORIZED));
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
  } catch (err) {
    next(new Error(ERROR_CODES.UNAUTHORIZED));
  }
};
