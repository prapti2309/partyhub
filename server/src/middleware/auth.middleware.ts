import { Request, Response, NextFunction } from "express";
import { verifyAccessToken } from "@/utils/jwt";
import { sessionRepository } from "@/repositories/session.repository";
import { userRepository } from "@/repositories/user.repository";

declare global {
  namespace Express {
    interface Request {
      user?: {
        id: string;
        email: string;
        role: string;
      };
      sessionId?: string;
    }
  }
}

export const requireAuth = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  const authHeader = req.headers.authorization;
  if (!authHeader || !authHeader.startsWith("Bearer ")) {
    res.status(401).json({
      status: "fail",
      code: "TOKEN_INVALID",
      message: "Authentication credentials required",
    });
    return;
  }

  const token = authHeader.split(" ")[1];
  try {
    const payload = verifyAccessToken(token);

    // 1. Verify Redis session active
    const session = await sessionRepository.getSession(payload.sessionId);
    if (!session) {
      res.status(401).json({
        status: "fail",
        code: "SESSION_REVOKED",
        message: "Session is revoked or expired",
      });
      return;
    }

    // 2. Verify user tokenVersion matches database
    const user = await userRepository.findById(payload.userId);
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      res.status(401).json({
        status: "fail",
        code: "SESSION_REVOKED",
        message: "Session version invalid. Re-authentication required.",
      });
      return;
    }

    // Update lastSeen in background
    void sessionRepository.updateSessionLastSeen(payload.sessionId);

    // Attach user information to request object
    req.user = {
      id: user.id,
      email: user.email,
      role: user.role,
    };
    req.sessionId = payload.sessionId;

    next();
  } catch (err: any) {
    if (err.name === "TokenExpiredError") {
      res.status(401).json({
        status: "fail",
        code: "TOKEN_EXPIRED",
        message: "Access token has expired",
      });
      return;
    }

    res.status(401).json({
      status: "fail",
      code: "TOKEN_INVALID",
      message: "Invalid token credentials",
    });
  }
};

export const requireEmailVerified = async (req: Request, res: Response, next: NextFunction): Promise<void> => {
  if (!req.user) {
    res.status(401).json({
      status: "fail",
      code: "TOKEN_INVALID",
      message: "Authentication required",
    });
    return;
  }

  const user = await userRepository.findById(req.user.id);
  if (!user || !user.emailVerified) {
    res.status(403).json({
      status: "fail",
      code: "EMAIL_UNVERIFIED",
      message: "Email verification required to perform this action",
    });
    return;
  }

  next();
};
export type AuthRequest = Request & {
  user: {
    id: string;
    email: string;
    role: string;
  };
  sessionId: string;
};
export type CustomRequestHandler = (req: Request, res: Response, next: NextFunction) => any;
