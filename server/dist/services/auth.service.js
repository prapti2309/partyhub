"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authService = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const uuid_1 = require("uuid");
const prisma_1 = require("../config/prisma");
const user_repository_1 = require("../repositories/user.repository");
const session_repository_1 = require("../repositories/session.repository");
const jwt_1 = require("../utils/jwt");
const errors_1 = require("../utils/errors");
const logger_1 = require("../utils/logger");
exports.authService = {
    async register(data) {
        const existing = await user_repository_1.userRepository.findByEmail(data.email);
        if (existing) {
            throw new errors_1.AppError("A user with this email address already exists", 409);
        }
        const passwordHash = await bcrypt_1.default.hash(data.password, 12);
        const user = await user_repository_1.userRepository.createUser({
            email: data.email,
            passwordHash,
            displayName: data.displayName,
        });
        // Create mock email verification token
        const verificationToken = (0, uuid_1.v4)();
        await prisma_1.prisma.emailVerification.create({
            data: {
                email: user.email,
                token: verificationToken,
                expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000), // 24 hours
            },
        });
        logger_1.logger.info("📧 Verification email generated", {
            userId: user.id,
            email: user.email,
            token: verificationToken,
        });
        await user_repository_1.userRepository.createAuditLog({
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
    async login(data) {
        const user = await user_repository_1.userRepository.findByEmail(data.email);
        if (!user || !user.passwordHash) {
            await user_repository_1.userRepository.createAuditLog({
                userId: null,
                action: "LOGIN_FAILURE",
                ip: data.ip,
                userAgent: data.userAgent,
                metadata: { email: data.email },
            });
            throw new errors_1.AppError("Invalid email or password credentials", 401);
        }
        const matches = await bcrypt_1.default.compare(data.password, user.passwordHash);
        if (!matches) {
            await user_repository_1.userRepository.createAuditLog({
                userId: user.id,
                action: "LOGIN_FAILURE",
                ip: data.ip,
                userAgent: data.userAgent,
            });
            throw new errors_1.AppError("Invalid email or password credentials", 401);
        }
        const sessionId = (0, uuid_1.v4)();
        const familyId = (0, uuid_1.v4)();
        const refreshJti = (0, uuid_1.v4)();
        const accessJti = (0, uuid_1.v4)();
        const sessionMetadata = {
            userId: user.id,
            ip: data.ip,
            userAgent: data.userAgent,
            deviceName: data.userAgent || "Unknown Device",
            createdAt: new Date().toISOString(),
            lastSeen: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };
        await session_repository_1.sessionRepository.createSession(sessionId, sessionMetadata);
        const accessToken = (0, jwt_1.signAccessToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
            sessionId,
            tokenVersion: user.tokenVersion,
            jti: accessJti,
        });
        const refreshToken = (0, jwt_1.signRefreshToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
            familyId,
            parentJti: null,
            sessionId,
            tokenVersion: user.tokenVersion,
            jti: refreshJti,
        });
        await user_repository_1.userRepository.createAuditLog({
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
    async refresh(data) {
        let payload;
        try {
            payload = (0, jwt_1.verifyRefreshToken)(data.refreshToken);
        }
        catch (err) {
            throw new errors_1.AppError("Invalid or expired refresh token", 401);
        }
        const user = await user_repository_1.userRepository.findById(payload.userId);
        if (!user || user.tokenVersion !== payload.tokenVersion) {
            throw new errors_1.AppError("Invalid token version. Re-authentication required.", 401);
        }
        const activeSession = await session_repository_1.sessionRepository.getSession(payload.sessionId);
        if (!activeSession) {
            // Replay Attack Detection: check if this token was already rotated
            const rotatedTo = await session_repository_1.sessionRepository.getRotatedToken(payload.jti);
            if (rotatedTo) {
                logger_1.logger.warn("🚨 Refresh token replay attack detected! Revoking all sessions.", {
                    userId: user.id,
                    replayedJti: payload.jti,
                    ip: data.ip,
                });
                await user_repository_1.userRepository.incrementTokenVersion(user.id);
                await session_repository_1.sessionRepository.deleteAllSessionsForUser(user.id);
                await user_repository_1.userRepository.createAuditLog({
                    userId: user.id,
                    action: "TOKEN_REPLAY",
                    ip: data.ip,
                    userAgent: data.userAgent,
                    metadata: { replayedJti: payload.jti },
                });
                throw new errors_1.AppError("Suspicious activity detected. All sessions revoked.", 403);
            }
            throw new errors_1.AppError("Session is expired or logged out", 401);
        }
        // Process Token rotation
        const newSessionId = (0, uuid_1.v4)();
        const newRefreshJti = (0, uuid_1.v4)();
        const newAccessJti = (0, uuid_1.v4)();
        // Revoke old session and create new
        await session_repository_1.sessionRepository.deleteSession(user.id, payload.sessionId);
        const sessionMetadata = {
            userId: user.id,
            ip: data.ip,
            userAgent: data.userAgent,
            deviceName: activeSession.deviceName,
            createdAt: activeSession.createdAt,
            lastSeen: new Date().toISOString(),
            expiresAt: new Date(Date.now() + 7 * 24 * 60 * 60 * 1000).toISOString(),
        };
        await session_repository_1.sessionRepository.createSession(newSessionId, sessionMetadata);
        await session_repository_1.sessionRepository.logRotatedToken(payload.jti, newRefreshJti);
        const accessToken = (0, jwt_1.signAccessToken)({
            userId: user.id,
            email: user.email,
            role: user.role,
            sessionId: newSessionId,
            tokenVersion: user.tokenVersion,
            jti: newAccessJti,
        });
        const newRefreshToken = (0, jwt_1.signRefreshToken)({
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
    async logout(userId, sessionId, ip, userAgent) {
        await session_repository_1.sessionRepository.deleteSession(userId, sessionId);
        await user_repository_1.userRepository.createAuditLog({
            userId,
            action: "LOGOUT",
            ip,
            userAgent,
            metadata: { sessionId },
        });
    },
    async logoutAll(userId, ip, userAgent) {
        await user_repository_1.userRepository.incrementTokenVersion(userId);
        await session_repository_1.sessionRepository.deleteAllSessionsForUser(userId);
        await user_repository_1.userRepository.createAuditLog({
            userId,
            action: "LOGOUT_ALL",
            ip,
            userAgent,
        });
    },
    async verifyEmail(token, ip, userAgent) {
        const record = await prisma_1.prisma.emailVerification.findUnique({
            where: { token },
        });
        if (!record || record.expiresAt < new Date()) {
            throw new errors_1.AppError("Invalid or expired email verification token", 400);
        }
        const user = await user_repository_1.userRepository.findByEmail(record.email);
        if (!user) {
            throw new errors_1.AppError("User account not found", 404);
        }
        await user_repository_1.userRepository.updateUser(user.id, { emailVerified: true });
        await prisma_1.prisma.emailVerification.delete({ where: { token } });
        await user_repository_1.userRepository.createAuditLog({
            userId: user.id,
            action: "EMAIL_VERIFIED",
            ip,
            userAgent,
        });
    },
    async forgotPassword(email, ip, userAgent) {
        const user = await user_repository_1.userRepository.findByEmail(email);
        if (!user) {
            // Fail silently (pretend success) to prevent account enumeration
            return;
        }
        const resetToken = (0, uuid_1.v4)();
        await prisma_1.prisma.passwordReset.create({
            data: {
                email: user.email,
                token: resetToken,
                expiresAt: new Date(Date.now() + 1 * 60 * 60 * 1000), // 1 hour
            },
        });
        logger_1.logger.info("📧 Password reset token generated", {
            userId: user.id,
            email: user.email,
            token: resetToken,
        });
        await user_repository_1.userRepository.createAuditLog({
            userId: user.id,
            action: "PASSWORD_RESET_REQUESTED",
            ip,
            userAgent,
        });
    },
    async resetPassword(data, ip, userAgent) {
        const record = await prisma_1.prisma.passwordReset.findUnique({
            where: { token: data.token },
        });
        if (!record || record.expiresAt < new Date() || record.usedAt) {
            throw new errors_1.AppError("Invalid or expired password reset token", 400);
        }
        const user = await user_repository_1.userRepository.findByEmail(record.email);
        if (!user) {
            throw new errors_1.AppError("User account not found", 404);
        }
        // Update user record, increment version, clear sessions
        await user_repository_1.userRepository.updateUser(user.id, {
            passwordHash: data.passwordHash,
            tokenVersion: { increment: 1 },
        });
        await session_repository_1.sessionRepository.deleteAllSessionsForUser(user.id);
        await prisma_1.prisma.passwordReset.update({
            where: { token: data.token },
            data: { usedAt: new Date() },
        });
        await user_repository_1.userRepository.createAuditLog({
            userId: user.id,
            action: "PASSWORD_RESET_COMPLETED",
            ip,
            userAgent,
        });
    },
    async getProfile(userId) {
        const user = await user_repository_1.userRepository.findById(userId);
        if (!user) {
            throw new errors_1.AppError("User account not found", 404);
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
