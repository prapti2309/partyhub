import { Router } from "express";
import rateLimit from "express-rate-limit";
import { authController } from "@/controllers/auth.controller";
import { validate } from "@/middleware/validate.middleware";
import { requireAuth } from "@/middleware/auth.middleware";
import {
  registerSchema,
  loginSchema,
  verifyEmailSchema,
  forgotPasswordSchema,
  resetPasswordSchema,
} from "@/validators/auth.validators";

const router = Router();

// Route-Specific Rate Limiters
const loginLimiter = rateLimit({
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

const registerLimiter = rateLimit({
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

const refreshLimiter = rateLimit({
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

const resetPasswordLimiter = rateLimit({
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

router.post("/register", registerLimiter, validate(registerSchema), authController.register);
router.post("/login", loginLimiter, validate(loginSchema), authController.login);
router.post("/refresh", refreshLimiter, authController.refresh);
router.post("/logout", requireAuth, authController.logout);
router.post("/logout-all", requireAuth, authController.logoutAll);
router.get("/me", requireAuth, authController.me);
router.post("/verify-email", validate(verifyEmailSchema), authController.verifyEmail);
router.post("/forgot-password", validate(forgotPasswordSchema), authController.forgotPassword);
router.post("/reset-password", resetPasswordLimiter, validate(resetPasswordSchema), authController.resetPassword);

export default router;
