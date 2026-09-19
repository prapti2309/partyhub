"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const auth_controller_1 = require("../controllers/auth.controller");
const validate_middleware_1 = require("../middleware/validate.middleware");
const auth_middleware_1 = require("../middleware/auth.middleware");
const auth_validators_1 = require("../validators/auth.validators");
const router = (0, express_1.Router)();
// Route-Specific Rate Limiters
const loginLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 5,
    message: {
        status: "fail",
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many login attempts. Please try again after 1 minute.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
const registerLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 3,
    message: {
        status: "fail",
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many registration attempts. Please try again after 1 minute.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
const refreshLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 1000, // 1 minute
    max: 20,
    message: {
        status: "fail",
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many token refresh attempts.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
const resetPasswordLimiter = (0, express_rate_limit_1.default)({
    windowMs: 60 * 60 * 1000, // 1 hour
    max: 3,
    message: {
        status: "fail",
        code: "RATE_LIMIT_EXCEEDED",
        message: "Too many password reset requests. Please try again after 1 hour.",
    },
    standardHeaders: true,
    legacyHeaders: false,
});
router.post("/register", registerLimiter, (0, validate_middleware_1.validate)(auth_validators_1.registerSchema), auth_controller_1.authController.register);
router.post("/login", loginLimiter, (0, validate_middleware_1.validate)(auth_validators_1.loginSchema), auth_controller_1.authController.login);
router.post("/refresh", refreshLimiter, auth_controller_1.authController.refresh);
router.post("/logout", auth_middleware_1.requireAuth, auth_controller_1.authController.logout);
router.post("/logout-all", auth_middleware_1.requireAuth, auth_controller_1.authController.logoutAll);
router.get("/me", auth_middleware_1.requireAuth, auth_controller_1.authController.me);
router.post("/verify-email", (0, validate_middleware_1.validate)(auth_validators_1.verifyEmailSchema), auth_controller_1.authController.verifyEmail);
router.post("/forgot-password", (0, validate_middleware_1.validate)(auth_validators_1.forgotPasswordSchema), auth_controller_1.authController.forgotPassword);
router.post("/reset-password", resetPasswordLimiter, (0, validate_middleware_1.validate)(auth_validators_1.resetPasswordSchema), auth_controller_1.authController.resetPassword);
exports.default = router;
