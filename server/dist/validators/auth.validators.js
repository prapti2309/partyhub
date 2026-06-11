"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.resetPasswordSchema = exports.forgotPasswordSchema = exports.verifyEmailSchema = exports.loginSchema = exports.registerSchema = void 0;
const zod_1 = require("zod");
const passwordSchema = zod_1.z
    .string()
    .min(8, "Password must be at least 8 characters long")
    .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
    .regex(/[a-z]/, "Password must contain at least one lowercase letter")
    .regex(/[0-9]/, "Password must contain at least one number")
    .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");
exports.registerSchema = {
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email address format"),
        password: passwordSchema,
        displayName: zod_1.z
            .string()
            .min(2, "Display name must be at least 2 characters long")
            .max(50, "Display name must not exceed 50 characters"),
    }),
};
exports.loginSchema = {
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email address format"),
        password: zod_1.z.string().min(1, "Password is required"),
    }),
};
exports.verifyEmailSchema = {
    body: zod_1.z.object({
        token: zod_1.z.string().min(1, "Verification token is required"),
    }),
};
exports.forgotPasswordSchema = {
    body: zod_1.z.object({
        email: zod_1.z.string().email("Invalid email address format"),
    }),
};
exports.resetPasswordSchema = {
    body: zod_1.z.object({
        token: zod_1.z.string().min(1, "Reset token is required"),
        newPassword: passwordSchema,
    }),
};
