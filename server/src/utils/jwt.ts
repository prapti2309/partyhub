import jwt from "jsonwebtoken";
import { env } from "@/config/env";
import { AccessTokenPayload, RefreshTokenPayload } from "@/types/auth.types";

export function signAccessToken(payload: Omit<AccessTokenPayload, "exp" | "iat">): string {
  return jwt.sign(payload, env.JWT_SECRET, { expiresIn: env.JWT_EXPIRES_IN as any });
}

export function signRefreshToken(payload: Omit<RefreshTokenPayload, "exp" | "iat">): string {
  return jwt.sign(payload, env.JWT_REFRESH_SECRET, { expiresIn: env.JWT_REFRESH_EXPIRES_IN as any });
}

export function verifyAccessToken(token: string): AccessTokenPayload {
  return jwt.verify(token, env.JWT_SECRET) as AccessTokenPayload;
}

export function verifyRefreshToken(token: string): RefreshTokenPayload {
  return jwt.verify(token, env.JWT_REFRESH_SECRET) as RefreshTokenPayload;
}
