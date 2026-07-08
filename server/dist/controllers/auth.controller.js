"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.authController = void 0;
const bcrypt_1 = __importDefault(require("bcrypt"));
const auth_service_1 = require("@/services/auth.service");
const asyncHandler_1 = require("@/utils/asyncHandler");
const errors_1 = require("@/utils/errors");
const env_1 = require("@/config/env");
const isProd = env_1.env.NODE_ENV === "production";
const setRefreshTokenCookie = (res, token) => {
    res.cookie("refreshToken", token, {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/api/v1/auth",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });
};
const clearRefreshTokenCookie = (res) => {
    res.clearCookie("refreshToken", {
        httpOnly: true,
        secure: isProd,
        sameSite: "lax",
        path: "/api/v1/auth",
    });
};
// CSRF Origin validation helper
const validateOrigin = (req) => {
    const origin = req.headers.origin || req.headers.referer;
    // In development sandbox, origin checking might be relaxed. In prod, strict match is needed.
    if (isProd && origin) {
        const allowed = ["https://watchparty.app", "http://localhost:3000"]; // Configured domains list
        const parsedOrigin = new URL(origin).origin;
        if (!allowed.some((domain) => parsedOrigin.startsWith(domain))) {
            throw new errors_1.AppError("Cross-Origin CSRF validation failed", 403);
        }
    }
};
exports.authController = {
    register: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        validateOrigin(req);
        const { email, password, displayName } = req.body;
        const user = await auth_service_1.authService.register({ email, password, displayName });
        res.status(201).json({
            status: "success",
            user,
        });
    }),
    login: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        validateOrigin(req);
        const { email, password } = req.body;
        const ip = req.ip || req.socket.remoteAddress || "0.0.0.0";
        const userAgent = req.headers["user-agent"] || "Unknown User Agent";
        const { accessToken, refreshToken, user } = await auth_service_1.authService.login({
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
    refresh: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const refreshToken = req.cookies?.refreshToken;
        if (!refreshToken) {
            throw new errors_1.AppError("Session expired or refresh token cookie missing", 401);
        }
        const ip = req.ip || req.socket.remoteAddress || "0.0.0.0";
        const userAgent = req.headers["user-agent"] || "Unknown User Agent";
        try {
            const { accessToken, refreshToken: newRefreshToken } = await auth_service_1.authService.refresh({
                refreshToken,
                ip,
                userAgent,
            });
            setRefreshTokenCookie(res, newRefreshToken);
            res.status(200).json({
                status: "success",
                accessToken,
            });
        }
        catch (err) {
            clearRefreshTokenCookie(res);
            throw err;
        }
    }),
    logout: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user?.id;
        const sessionId = req.sessionId;
        const ip = req.ip || req.socket.remoteAddress || "0.0.0.0";
        const userAgent = req.headers["user-agent"] || "Unknown User Agent";
        if (userId && sessionId) {
            await auth_service_1.authService.logout(userId, sessionId, ip, userAgent);
        }
        clearRefreshTokenCookie(res);
        res.status(200).json({
            status: "success",
            message: "Logged out successfully from this device",
        });
    }),
    logoutAll: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const userId = req.user?.id;
        const ip = req.ip || req.socket.remoteAddress || "0.0.0.0";
        const userAgent = req.headers["user-agent"] || "Unknown User Agent";
        if (userId) {
            await auth_service_1.authService.logoutAll(userId, ip, userAgent);
        }
        clearRefreshTokenCookie(res);
        res.status(200).json({
            status: "success",
            message: "Logged out successfully from all active devices",
        });
    }),
    me: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        if (!req.user) {
            throw new errors_1.AppError("Authentication credentials required", 401);
        }
        const profile = await auth_service_1.authService.getProfile(req.user.id);
        res.status(200).json({
            status: "success",
            user: profile,
        });
    }),
    verifyEmail: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { token } = req.body;
        const ip = req.ip || req.socket.remoteAddress || "0.0.0.0";
        const userAgent = req.headers["user-agent"] || "Unknown User Agent";
        await auth_service_1.authService.verifyEmail(token, ip, userAgent);
        res.status(200).json({
            status: "success",
            message: "Email address verified successfully",
        });
    }),
    forgotPassword: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { email } = req.body;
        const ip = req.ip || req.socket.remoteAddress || "0.0.0.0";
        const userAgent = req.headers["user-agent"] || "Unknown User Agent";
        await auth_service_1.authService.forgotPassword(email, ip, userAgent);
        // Fail silently to prevent username enumeration
        res.status(200).json({
            status: "success",
            message: "If a matching email account exists, password recovery link was dispatched",
        });
    }),
    resetPassword: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { token, newPassword } = req.body;
        const ip = req.ip || req.socket.remoteAddress || "0.0.0.0";
        const userAgent = req.headers["user-agent"] || "Unknown User Agent";
        const passwordHash = await bcrypt_1.default.hash(newPassword, 12);
        await auth_service_1.authService.resetPassword({ token, passwordHash }, ip, userAgent);
        res.status(200).json({
            status: "success",
            message: "Password updated successfully. All devices have been logged out.",
        });
    }),
};
