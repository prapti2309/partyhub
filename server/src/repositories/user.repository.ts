import { prisma } from "@/config/prisma";
import { UserRole } from "@prisma/client";

export const userRepository = {
  async findByEmail(email: string) {
    return prisma.user.findUnique({
      where: { email: email.toLowerCase() },
      include: { profile: true },
    });
  },

  async findById(id: string) {
    return prisma.user.findUnique({
      where: { id },
      include: { profile: true },
    });
  },

  async createUser(data: { email: string; passwordHash: string; displayName: string }) {
    return prisma.$transaction(async (tx) => {
      const user = await tx.user.create({
        data: {
          email: data.email.toLowerCase(),
          passwordHash: data.passwordHash,
          emailVerified: false,
          role: "USER" as UserRole,
        },
      });

      const profile = await tx.profile.create({
        data: {
          userId: user.id,
          displayName: data.displayName,
        },
      });

      return { ...user, profile };
    });
  },

  async updateUser(id: string, data: any) {
    return prisma.user.update({
      where: { id },
      data,
      include: { profile: true },
    });
  },

  async incrementTokenVersion(id: string) {
    return prisma.user.update({
      where: { id },
      data: {
        tokenVersion: {
          increment: 1,
        },
      },
    });
  },

  async createAuditLog(data: {
    userId: string | null;
    action: string;
    ip: string | null;
    userAgent: string | null;
    metadata?: any;
  }) {
    return prisma.authAuditLog.create({
      data: {
        userId: data.userId,
        action: data.action,
        ip: data.ip,
        userAgent: data.userAgent,
        metadata: data.metadata || {},
      },
    });
  },
};
