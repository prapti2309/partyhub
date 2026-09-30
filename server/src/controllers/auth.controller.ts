import { Request, Response } from "express";
import bcrypt from "bcrypt";
import { authService } from "@/services/auth.service";
import { asyncHandler } from "@/utils/asyncHandler";
import { AppError } from "@/utils/errors";
import { env } from "@/config/env";

const isProd = env.NODE_ENV === "production";

const setRefreshTokenCookie = (res: Response, token: string) => {
  res.cookie("refreshToken", token, {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/api/v1/auth",
    maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
  });
};

const clearRefreshTokenCookie = (res: Response) => {
  res.clearCookie("refreshToken", {
    httpOnly: true,
    secure: isProd,
    sameSite: "lax",
    path: "/api/v1/auth",
  });
};

// CSRF Origin validation helper
const validateOrigin = (req: Request) => {
  const origin = req.headers.origin || req.headers.referer;
  // In development sandbox, origin checking might be relaxed. In prod, strict match is needed.
  if (isProd && origin) {
    const allowed = ["https://watchparty.app", "http://localhost:3000"]; // Configured domains list
    const parsedOrigin = new URL(origin).origin;
    if (!allowed.some((domain) => parsedOrigin.startsWith(domain))) {
      throw new AppError("Cross-Origin CSRF validation failed", 403);
    }
  }
};

export const authController = {
  register: asyncHandler(async (req: Request, res: Response) => {
    validateOrigin(req);
    const { email, password, displayName } = req.body;
    const user = await authService.register({ email, password, displayName });

    res.status(201).json({
      status: "success",
      user,
    });
  }),

  login: asyncHandler(async (req: Request, res: Response) => {
    validateOrigin(req);
    const { email, password } = req.body;
    const ip = req.ip || req.socket.remoteAddress || "0.0.0.0";
    const userAgent = req.headers["user-agent"] || "Unknown User Agent";

    const { accessToken, refreshToken, user } = await authService.login({
      email,
      password,
      ip,
      userAgent,
    });

    setRefreshTokenCookie(res, refreshToken);

    res.status(200).json({
      status: "success",
      accessToken,
      user,
    });
  }),

  refresh: asyncHandler(async (req: Request, res: Response) => {
    const refreshToken = req.cookies?.refreshToken;
    if (!refreshToken) {
      throw new AppError("Session expired or refresh token cookie missing", 401);
    }

    const ip = req.ip || req.socket.remoteAddress || "0.0.0.0";
    const userAgent = req.headers["user-agent"] || "Unknown User Agent";

    try {
      const { accessToken, refreshToken: newRefreshToken } = await authService.refresh({
        refreshToken,
        ip,
        userAgent,
      });

      setRefreshTokenCookie(res, newRefreshToken);

      res.status(200).json({
        status: "success",
        accessToken,
      });
    } catch (err: any) {
      clearRefreshTokenCookie(res);
      throw err;
    }
  }),

  logout: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const sessionId = req.sessionId;
    const ip = req.ip || req.socket.remoteAddress || "0.0.0.0";
    const userAgent = req.headers["user-agent"] || "Unknown User Agent";

    if (userId && sessionId) {
      await authService.logout(userId, sessionId, ip, userAgent);
    }

    clearRefreshTokenCookie(res);

    res.status(200).json({
      status: "success",
      message: "Logged out successfully from this device",
    });
  }),

  logoutAll: asyncHandler(async (req: Request, res: Response) => {
    const userId = req.user?.id;
    const ip = req.ip || req.socket.remoteAddress || "0.0.0.0";
    const userAgent = req.headers["user-agent"] || "Unknown User Agent";

    if (userId) {
      await authService.logoutAll(userId, ip, userAgent);
    }

    clearRefreshTokenCookie(res);

    res.status(200).json({
      status: "success",
      message: "Logged out successfully from all active devices",
    });
  }),

  me: asyncHandler(async (req: Request, res: Response) => {
    if (!req.user) {
      throw new AppError("Authentication credentials required", 401);
    }
    const profile = await authService.getProfile(req.user.id);
    res.status(200).json({
      status: "success",
      user: profile,
    });
  }),

  verifyEmail: asyncHandler(async (req: Request, res: Response) => {
    const { token } = req.body;
    const ip = req.ip || req.socket.remoteAddress || "0.0.0.0";
    const userAgent = req.headers["user-agent"] || "Unknown User Agent";

    await authService.verifyEmail(token, ip, userAgent);

    res.status(200).json({
      status: "success",
      message: "Email address verified successfully",
    });
  }),

  forgotPassword: asyncHandler(async (req: Request, res: Response) => {
    const { email } = req.body;
    const ip = req.ip || req.socket.remoteAddress || "0.0.0.0";
    const userAgent = req.headers["user-agent"] || "Unknown User Agent";

    await authService.forgotPassword(email, ip, userAgent);

    // Fail silently to prevent username enumeration
    res.status(200).json({
      status: "success",
      message: "If a matching email account exists, password recovery link was dispatched",
    });
  }),

  resetPassword: asyncHandler(async (req: Request, res: Response) => {
    const { token, newPassword } = req.body;
    const ip = req.ip || req.socket.remoteAddress || "0.0.0.0";
    const userAgent = req.headers["user-agent"] || "Unknown User Agent";

    const passwordHash = await bcrypt.hash(newPassword, 12);
    await authService.resetPassword({ token, passwordHash }, ip, userAgent);

    res.status(200).json({
      status: "success",
      message: "Password updated successfully. All devices have been logged out.",
    });
  }),
};
