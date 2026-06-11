import { z } from "zod";

const envSchema = z.object({
  NEXT_PUBLIC_API_URL: z.string().url().default("http://localhost:4000/v1"),
  NEXT_PUBLIC_SOCKET_URL: z.string().url().default("http://localhost:4000"),
});

const getEnv = () => {
  const parsed = envSchema.safeParse({
    NEXT_PUBLIC_API_URL: process.env.NEXT_PUBLIC_API_URL,
    NEXT_PUBLIC_SOCKET_URL: process.env.NEXT_PUBLIC_SOCKET_URL,
  });

  if (!parsed.success) {
    console.error("❌ Invalid environment variables:", parsed.error.format());
    throw new Error("Invalid environment configurations. Boot terminated.");
  }

  return parsed.data;
};

export const env = getEnv();
