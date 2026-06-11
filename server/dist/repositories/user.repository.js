"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.userRepository = void 0;
const prisma_1 = require("../config/prisma");
exports.userRepository = {
    async findByEmail(email) {
        return prisma_1.prisma.user.findUnique({
            where: { email: email.toLowerCase() },
            include: { profile: true },
        });
    },
    async findById(id) {
        return prisma_1.prisma.user.findUnique({
            where: { id },
            include: { profile: true },
        });
    },
    async createUser(data) {
        return prisma_1.prisma.$transaction(async (tx) => {
            const user = await tx.user.create({
                data: {
                    email: data.email.toLowerCase(),
                    passwordHash: data.passwordHash,
                    emailVerified: false,
                    role: "USER",
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
    async updateUser(id, data) {
        return prisma_1.prisma.user.update({
            where: { id },
            data,
            include: { profile: true },
        });
    },
    async incrementTokenVersion(id) {
        return prisma_1.prisma.user.update({
            where: { id },
            data: {
                tokenVersion: {
                    increment: 1,
                },
            },
        });
    },
    async createAuditLog(data) {
        return prisma_1.prisma.authAuditLog.create({
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
