import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { prisma } from "@/config/prisma";
import { userRepository } from "@/repositories/user.repository";
import { sessionRepository } from "@/repositories/session.repository";
import { signAccessToken, signRefreshToken, verifyRefreshToken } from "@/utils/jwt";
import { AppError } from "@/utils/errors";
import { logger } from "@/utils/logger";
import { SessionMetadata } from "@/types/auth.types";

export const authService = {
  async register(data: { email: string; password: string; displayName: string }) {
    const existing = await userRepository.findByEmail(data.email);
    if (existing) {
      throw new AppError("A user with this email address already exists", 409);
    }

    const passwordHash = await bcrypt.hash(data.password, 12);
    const user = await userRepository.createUser({
      email: data.email,
      passwordHash,
      displayName: data.displayName,
    });

    // Create mock email verification token
    const verificationToken = uuidv4();
    await prisma.emailVerification.create({
      data: {
        email: user.email,
        token: verificationToken,
        expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
      },
    });

    logger.info("📧 Verification email generated", {
      userId: user.id,
      email: user.email,
      token: verificationToken,
    });

    await userRepository.createAuditLog({
      userId: user.id,
      action: "REGISTER_SUCCESS",
      ip: null,
      userAgent: null,
    });

    return {
      id: user.id,
      email: user.email,
      role: user.role,
      profile: {
        displayName: user.profile?.displayName,
      },
    };
  },

  async login(data: { email: string; password: string; ip: string; userAgent: string }) {
    const user = await userRepository.findByEmail(data.email);
    if (!user || !user.passwordHash) {
      await userRepository.createAuditLog({
        userId: null,
        action: "LOGIN_FAILURE",
        ip: data.ip,
        userAgent: data.userAgent,
        metadata: { email: data.email },
      });
      throw new AppError("Invalid email or password credentials", 401);
    }

    const matches = await bcrypt.compare(data.password, user.passwordHash);
    if (!matches) {
      await userRepository.createAuditLog({
        userId: user.id,
        action: "LOGIN_FAILURE",
        ip: data.ip,
        userAgent: data.userAgent,
      });
      throw new AppError("Invalid email or password credentials", 401);
    }

    const sessionId = uuidv4();
    const familyId = uuidv4();
    const refreshJti = uuidv4();
    const accessJti = uuidv4();

    const sessionMetadata: SessionMetadata = {
      userId: user.id,
      ip: data.ip,
      userAgent: data.userAgent,
      deviceName: data.userAgent || "Unknown Device",
      createdAt: new Date().toISOString(),
      lastSeen: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    await sessionRepository.createSession(sessionId, sessionMetadata);

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId,
      tokenVersion: user.tokenVersion,
      jti: accessJti,
    });

    const refreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      familyId,
      parentJti: null,
      sessionId,
      tokenVersion: user.tokenVersion,
      jti: refreshJti,
    });

    await userRepository.createAuditLog({
      userId: user.id,
      action: "LOGIN_SUCCESS",
      ip: data.ip,
      userAgent: data.userAgent,
      metadata: { sessionId },
    });

    return {
      accessToken,
      refreshToken,
      user: {
        id: user.id,
        email: user.email,
        role: user.role,
        profile: {
          displayName: user.profile?.displayName,
          avatarUrl: user.profile?.avatarUrl,
        },
      },
    };
  },

  async refresh(data: { refreshToken: string; ip: string; userAgent: string }) {
    let payload;
    try {
      payload = verifyRefreshToken(data.refreshToken);
    } catch (err: any) {
      throw new AppError("Invalid or expired refresh token", 401);
    }

    const user = await userRepository.findById(payload.userId);
    if (!user || user.tokenVersion !== payload.tokenVersion) {
      throw new AppError("Invalid token version. Re-authentication required.", 401);
    }

    const activeSession = await sessionRepository.getSession(payload.sessionId);
    if (!activeSession) {
      // Replay Attack Detection: check if this token was already rotated
      const rotatedTo = await sessionRepository.getRotatedToken(payload.jti);
      if (rotatedTo) {
        logger.warn("🚨 Refresh token replay attack detected! Revoking all sessions.", {
          userId: user.id,
          replayedJti: payload.jti,
          ip: data.ip,
        });

        await userRepository.incrementTokenVersion(user.id);
        await sessionRepository.deleteAllSessionsForUser(user.id);

        await userRepository.createAuditLog({
          userId: user.id,
          action: "TOKEN_REPLAY",
          ip: data.ip,
          userAgent: data.userAgent,
          metadata: { replayedJti: payload.jti },
        });

        throw new AppError("Suspicious activity detected. All sessions revoked.", 403);
      }

      throw new AppError("Session is expired or logged out", 401);
    }

    // Process Token rotation
    const newSessionId = uuidv4();
    const newRefreshJti = uuidv4();
    const newAccessJti = uuidv4();

    // Revoke old session and create new
    await sessionRepository.deleteSession(user.id, payload.sessionId);

    const sessionMetadata: SessionMetadata = {
      userId: user.id,
      ip: data.ip,
      userAgent: data.userAgent,
      deviceName: activeSession.deviceName,
      createdAt: activeSession.createdAt,
      lastSeen: new Date().toISOString(),
      expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
    };

    await sessionRepository.createSession(newSessionId, sessionMetadata);
    await sessionRepository.logRotatedToken(payload.jti, newRefreshJti);

    const accessToken = signAccessToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      sessionId: newSessionId,
      tokenVersion: user.tokenVersion,
      jti: newAccessJti,
    });

    const newRefreshToken = signRefreshToken({
      userId: user.id,
      email: user.email,
      role: user.role,
      familyId: payload.familyId,
      parentJti: payload.jti,
      sessionId: newSessionId,
      tokenVersion: user.tokenVersion,
      jti: newRefreshJti,
    });

    return {
      accessToken,
      refreshToken: newRefreshToken,
    };
  },

  async logout(userId: string, sessionId: string, ip: string, userAgent: string) {
    await sessionRepository.deleteSession(userId, sessionId);
    await userRepository.createAuditLog({
      userId,
      action: "LOGOUT",
      ip,
      userAgent,
      metadata: { sessionId },
    });
  },

  async logoutAll(userId: string, ip: string, userAgent: string) {
    await userRepository.incrementTokenVersion(userId);
    await sessionRepository.deleteAllSessionsForUser(userId);

    await userRepository.createAuditLog({
      userId,
      action: "LOGOUT_ALL",
      ip,
      userAgent,
    });
  },

  async verifyEmail(token: string, ip: string, userAgent: string) {
    const record = await prisma.emailVerification.findUnique({
      where: { token },
    });

    if (!record || record.expiresAt < new Date()) {
      throw new AppError("Invalid or expired email verification token", 400);
    }

    const user = await userRepository.findByEmail(record.email);
    if (!user) {
      throw new AppError("User account not found", 404);
    }

    await userRepository.updateUser(user.id, { emailVerified: true });
    await prisma.emailVerification.delete({ where: { token } });

    await userRepository.createAuditLog({
      userId: user.id,
      action: "EMAIL_VERIFIED",
      ip,
      userAgent,
    });
  },

  async forgotPassword(email: string, ip: string, userAgent: string) {
    const user = await userRepository.findByEmail(email);
    if (!user) {
      // Fail silently (pretend success) to prevent account enumeration
      return;
    }

    const resetToken = uuidv4();
    await prisma.passwordReset.create({
      data: {
        email: user.email,
        token: resetToken,
        expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
      },
    });

    logger.info("📧 Password reset token generated", {
      userId: user.id,
      email: user.email,
      token: resetToken,
    });

    await userRepository.createAuditLog({
      userId: user.id,
      action: "PASSWORD_RESET_REQUESTED",
      ip,
      userAgent,
    });
  },

  async resetPassword(data: { token: string; passwordHash: string }, ip: string, userAgent: string) {
    const record = await prisma.passwordReset.findUnique({
      where: { token: data.token },
    });

    if (!record || record.expiresAt < new Date() || record.usedAt) {
      throw new AppError("Invalid or expired password reset token", 400);
    }

    const user = await userRepository.findByEmail(record.email);
    if (!user) {
      throw new AppError("User account not found", 404);
    }

    // Update user record, increment version, clear sessions
    await userRepository.updateUser(user.id, {
      passwordHash: data.passwordHash,
      tokenVersion: { increment: 1 },
    });

    await sessionRepository.deleteAllSessionsForUser(user.id);

    await prisma.passwordReset.update({
      where: { token: data.token },
      data: { usedAt: new Date() },
    });

    await userRepository.createAuditLog({
      userId: user.id,
      action: "PASSWORD_RESET_COMPLETED",
      ip,
      userAgent,
    });
  },

  async getProfile(userId: string) {
    const user = await userRepository.findById(userId);
    if (!user) {
      throw new AppError("User account not found", 404);
    }
    return {
      id: user.id,
      email: user.email,
      role: user.role,
      emailVerified: user.emailVerified,
      profile: {
        displayName: user.profile?.displayName,
        avatarUrl: user.profile?.avatarUrl,
        bio: user.profile?.bio,
      },
    };
  },
};
