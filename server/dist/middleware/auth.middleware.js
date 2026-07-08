"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.requireEmailVerified = exports.requireAuth = void 0;
const jwt_1 = require("@/utils/jwt");
const session_repository_1 = require("@/repositories/session.repository");
const user_repository_1 = require("@/repositories/user.repository");
const requireAuth = async (req, res, next) => {
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
        const payload = (0, jwt_1.verifyAccessToken)(token);
        // 1. Verify Redis session active
        const session = await session_repository_1.sessionRepository.getSession(payload.sessionId);
        if (!session) {
            res.status(401).json({
                status: "fail",
                code: "SESSION_REVOKED",
                message: "Session is revoked or expired",
            });
            return;
        }
        // 2. Verify user tokenVersion matches database
        const user = await user_repository_1.userRepository.findById(payload.userId);
        if (!user || user.tokenVersion !== payload.tokenVersion) {
            res.status(401).json({
                status: "fail",
                code: "SESSION_REVOKED",
                message: "Session version invalid. Re-authentication required.",
            });
            return;
        }
        // Update lastSeen in background
        void session_repository_1.sessionRepository.updateSessionLastSeen(payload.sessionId);
        // Attach user information to request object
        req.user = {
            id: user.id,
            email: user.email,
            role: user.role,
        };
        req.sessionId = payload.sessionId;
        next();
    }
    catch (err) {
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
exports.requireAuth = requireAuth;
const requireEmailVerified = async (req, res, next) => {
    if (!req.user) {
        res.status(401).json({
            status: "fail",
            code: "TOKEN_INVALID",
            message: "Authentication required",
        });
        return;
    }
    const user = await user_repository_1.userRepository.findById(req.user.id);
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
exports.requireEmailVerified = requireEmailVerified;
