import { z } from "zod";

const passwordSchema = z
  .string()
  .min(8, "Password must be at least 8 characters long")
  .regex(/[A-Z]/, "Password must contain at least one uppercase letter")
  .regex(/[a-z]/, "Password must contain at least one lowercase letter")
  .regex(/[0-9]/, "Password must contain at least one number")
  .regex(/[^A-Za-z0-9]/, "Password must contain at least one special character");

export const registerSchema = {
  body: z.object({
    email: z.string().email("Invalid email address format"),
    password: passwordSchema,
    displayName: z
      .string()
      .min(2, "Display name must be at least 2 characters long")
      .max(50, "Display name must not exceed 50 characters"),
  }),
};

export const loginSchema = {
  body: z.object({
    email: z.string().email("Invalid email address format"),
    password: z.string().min(1, "Password is required"),
  }),
};

export const verifyEmailSchema = {
  body: z.object({
    token: z.string().min(1, "Verification token is required"),
  }),
};

export const forgotPasswordSchema = {
  body: z.object({
    email: z.string().email("Invalid email address format"),
  }),
};

export const resetPasswordSchema = {
  body: z.object({
    token: z.string().min(1, "Reset token is required"),
    newPassword: passwordSchema,
  }),
};
