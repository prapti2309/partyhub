"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.permissionService = exports.PermissionService = void 0;
const prisma_1 = require("@/config/prisma");
const redis_1 = require("@/config/redis");
class PermissionService {
    /**
     * Resolves a user's role in a specific room.
     * Checks Redis active participants first, falls back to PostgreSQL.
     */
    async getUserRole(userId, roomId) {
        // 1. Try Redis active participant role
        try {
            const participantData = await redis_1.redisClient.hGet(`room:${roomId}:participants`, userId);
            if (participantData) {
                const participant = JSON.parse(participantData);
                return participant.role;
            }
        }
        catch (err) {
            // Fallback to DB on Redis error
        }
        // 2. Query Postgres
        const room = await prisma_1.prisma.room.findUnique({
            where: { id: roomId },
            select: { ownerId: true },
        });
        if (!room)
            return null;
        if (room.ownerId === userId)
            return "OWNER";
        const member = await prisma_1.prisma.roomMember.findUnique({
            where: {
                roomId_userId: { roomId, userId },
            },
        });
        if (!member)
            return null;
        if (member.role === "OWNER")
            return "OWNER";
        if (member.role === "COHOST")
            return "MODERATOR";
        return "PARTICIPANT";
    }
    /**
     * Centralized permission checking logic.
     */
    async hasPermission(userId, roomId, action) {
        // System admin check (optional but good practice)
        const user = await prisma_1.prisma.user.findUnique({
            where: { id: userId },
            select: { role: true },
        });
        if (user?.role === "ADMIN")
            return true;
        const role = await this.getUserRole(userId, roomId);
        if (!role)
            return false;
        // OWNER has all permissions
        if (role === "OWNER")
            return true;
        switch (action) {
            case "TRANSFER_OWNER":
            case "CHANGE_ROOM_SETTINGS":
            case "UNBAN_USER":
                // Only OWNER can transfer owner, change settings, or unban (unless system admin)
                return false;
            case "BAN_USER":
            case "KICK_USER":
                // OWNER and MODERATOR can kick/ban
                return role === "MODERATOR";
            case "CHANGE_PLAYBACK":
                // OWNER and MODERATOR can always change playback.
                if (role === "MODERATOR")
                    return true;
                // PARTICIPANTS can only change playback if settings allow sharedControls
                const settings = await prisma_1.prisma.roomSettings.findUnique({
                    where: { roomId },
                    select: { sharedControls: true },
                });
                return !!settings?.sharedControls;
            default:
                return false;
        }
    }
}
exports.PermissionService = PermissionService;
exports.permissionService = new PermissionService();
