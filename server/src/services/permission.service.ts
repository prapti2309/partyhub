import { prisma } from "@/config/prisma";
import { redisClient } from "@/config/redis";

export type RoomRole = "OWNER" | "MODERATOR" | "PARTICIPANT";

export type RoomAction =
  | "TRANSFER_OWNER"
  | "KICK_USER"
  | "BAN_USER"
  | "UNBAN_USER"
  | "CHANGE_ROOM_SETTINGS"
  | "CHANGE_PLAYBACK";

export class PermissionService {
  /**
   * Resolves a user's role in a specific room.
   * Checks Redis active participants first, falls back to PostgreSQL.
   */
  async getUserRole(userId: string, roomId: string): Promise<RoomRole | null> {
    // 1. Try Redis active participant role
    try {
      const participantData = await redisClient.hGet(`room:${roomId}:participants`, userId);
      if (participantData) {
        const participant = JSON.parse(participantData);
        return participant.role as RoomRole;
      }
    } catch (err) {
      // Fallback to DB on Redis error
    }

    // 2. Query Postgres
    const room = await prisma.room.findUnique({
      where: { id: roomId },
      select: { ownerId: true },
    });

    if (!room) return null;
    if (room.ownerId === userId) return "OWNER";

    const member = await prisma.roomMember.findUnique({
      where: {
        roomId_userId: { roomId, userId },
      },
    });

    if (!member) return null;
    if (member.role === "OWNER") return "OWNER";
    if (member.role === "COHOST") return "MODERATOR";
    return "PARTICIPANT";
  }

  /**
   * Centralized permission checking logic.
   */
  async hasPermission(userId: string, roomId: string, action: RoomAction): Promise<boolean> {
    // System admin check (optional but good practice)
    const user = await prisma.user.findUnique({
      where: { id: userId },
      select: { role: true },
    });
    if (user?.role === "ADMIN") return true;

    const role = await this.getUserRole(userId, roomId);
    if (!role) return false;

    // OWNER has all permissions
    if (role === "OWNER") return true;

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
        if (role === "MODERATOR") return true;
        
        // PARTICIPANTS can only change playback if settings allow sharedControls
        const settings = await prisma.roomSettings.findUnique({
          where: { roomId },
          select: { sharedControls: true },
        });
        return !!settings?.sharedControls;

      default:
        return false;
    }
  }
}

export const permissionService = new PermissionService();
