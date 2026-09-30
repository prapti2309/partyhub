import { prisma } from "@/config/prisma";
import { redisClient } from "@/config/redis";
import { roomRepository } from "@/repositories/room.repository";
import { permissionService } from "./permission.service";
import { generateRoomCode } from "@/utils/roomCode";
import { logger } from "@/utils/logger";
import { getSocketIO } from "@/sockets";

export class RoomService {
  /**
   * Helper to broadcast websocket events to a room
   */
  private broadcast(roomId: string, event: string, payload: any) {
    const io = getSocketIO();
    if (io) {
      io.to(roomId).emit(event, payload);
    } else {
      logger.warn("Socket.IO instance not initialized yet, cannot broadcast", { event, roomId });
    }
  }

  /**
   * Create a new room in PostgreSQL and initialize in Redis.
   */
  async createRoom(ownerId: string, name: string, isPrivate: boolean = false, password?: string) {
    const roomCode = await generateRoomCode();

    // 1. Write to Postgres
    const room = await prisma.$transaction(async (tx) => {
      const newRoom = await tx.room.create({
        data: {
          name,
          ownerId,
          roomCode,
          isPrivate,
          password,
          settings: {
            create: {
              sharedControls: false,
              chatEnabled: true,
              voiceEnabled: true,
              videoEnabled: true,
              guestAllowed: true,
            },
          },
        },
        include: {
          settings: true,
        },
      });

      // Add owner as a RoomMember in DB
      await tx.roomMember.create({
        data: {
          roomId: newRoom.id,
          userId: ownerId,
          role: "OWNER",
        },
      });

      return newRoom;
    });

    // 2. Initialize state in Redis
    await roomRepository.createRoomState(room.id, {
      ownerId,
      code: roomCode,
      name,
    });
    await redisClient.sAdd("active_rooms", room.id);

    // 3. Add owner as active participant in Redis
    const ownerUser = await prisma.user.findUnique({
      where: { id: ownerId },
      select: { profile: { select: { displayName: true } } },
    });
    const displayName = ownerUser?.profile?.displayName || "Owner";

    await roomRepository.saveParticipant(room.id, {
      userId: ownerId,
      username: displayName,
      role: "OWNER",
      joinedAt: new Date().toISOString(),
      online: false, // will become online when socket connects
      socketIds: [],
    });

    return room;
  }

  /**
   * Join a room. Validates bans, duplicate joins, capacity, etc.
   */
  async joinRoom(userId: string, roomCode: string, socketId: string, username: string, password?: string) {
    // 1. Fetch room from DB
    const room = await prisma.room.findUnique({
      where: { roomCode },
      include: { settings: true },
    });

    if (!room) {
      throw new Error("Room not found");
    }

    if (room.status !== "ACTIVE") {
      throw new Error("Room is not active");
    }

    // 2. Validate password if private
    if (room.isPrivate && room.password && room.password !== password) {
      throw new Error("Invalid room password");
    }

    // 3. Validate user is not banned from this room
    const isBanned = await prisma.roomBan.findUnique({
      where: {
        roomId_userId: {
          roomId: room.id,
          userId,
        },
      },
    });

    if (isBanned) {
      if (!isBanned.expiresAt || isBanned.expiresAt > new Date()) {
        throw new Error("You are banned from this room");
      } else {
        // Ban expired, remove it
        await prisma.roomBan.delete({
          where: { id: isBanned.id },
        });
      }
    }

    // 4. Upsert RoomMember record in DB
    let member = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId: room.id, userId } },
    });

    if (member) {
      if (member.isBanned) {
        throw new Error("You are banned from this room");
      }
      // Re-joining, update leftAt to null
      if (member.leftAt) {
        member = await prisma.roomMember.update({
          where: { id: member.id },
          data: { leftAt: null },
        });
      }
    } else {
      // New member, check capacity
      const activeCount = await prisma.roomMember.count({
        where: { roomId: room.id, leftAt: null },
      });
      if (activeCount >= room.maxCapacity) {
        throw new Error("Room has reached max capacity");
      }

      const role = room.ownerId === userId ? "OWNER" : "VIEWER";
      member = await prisma.roomMember.create({
        data: {
          roomId: room.id,
          userId,
          role,
        },
      });
    }

    // 5. Redis state integration
    let participant = await roomRepository.getParticipant(room.id, userId);
    const resolvedRole = room.ownerId === userId ? "OWNER" : (member.role === "COHOST" ? "MODERATOR" : "PARTICIPANT");

    if (participant) {
      // Reconnect/Duplicate Join prevention
      if (!participant.socketIds.includes(socketId)) {
        participant.socketIds.push(socketId);
      }
      participant.online = true;
      participant.role = resolvedRole;
    } else {
      // First time joining or fully left state
      participant = {
        userId,
        username,
        role: resolvedRole,
        joinedAt: new Date().toISOString(),
        online: true,
        socketIds: [socketId],
      };
    }

    await roomRepository.saveParticipant(room.id, participant);
    await redisClient.sAdd("active_rooms", room.id);
    await roomRepository.setUserPresence(userId, "online");

    // Track Socket Presence mapping
    await roomRepository.setSocketPresence(socketId, {
      userId,
      roomId: room.id,
      connectedAt: new Date().toISOString(),
    });

    // Update heartbeat
    await roomRepository.updateHeartbeat(userId);

    // 6. Broadcast Events
    this.broadcast(room.id, "PARTICIPANT_JOINED", {
      userId,
      username,
      role: participant.role,
      joinedAt: participant.joinedAt,
      online: true,
    });

    return {
      room,
      participant,
    };
  }

  /**
   * Leave room explicitly.
   */
  async leaveRoom(userId: string, roomId: string, socketId?: string) {
    const participant = await roomRepository.getParticipant(roomId, userId);
    if (!participant) return;

    // Remove socket association
    if (socketId) {
      participant.socketIds = participant.socketIds.filter((id) => id !== socketId);
      await roomRepository.removeSocketPresence(socketId);
    } else {
      // If no socketId provided, clear all
      for (const id of participant.socketIds) {
        await roomRepository.removeSocketPresence(id);
      }
      participant.socketIds = [];
    }

    // Check if user is offline or fully removed
    if (participant.socketIds.length === 0) {
      participant.online = false;
      await roomRepository.setUserPresence(userId, "offline");
      await roomRepository.removeHeartbeat(userId);

      // In Postgres, mark they left
      await prisma.roomMember.updateMany({
        where: { roomId, userId },
        data: { leftAt: new Date() },
      });

      // Remove from active participants list in Redis
      await roomRepository.removeParticipant(roomId, userId);

      // Broadcast Participant Left
      this.broadcast(roomId, "PARTICIPANT_LEFT", { userId });

      // Handle ownership transfer if the leaving user is the owner
      const roomState = await roomRepository.getRoomState(roomId);
      if (roomState?.ownerId === userId) {
        await this.handleAutomaticOwnershipTransfer(roomId, userId);
      }
    } else {
      // User is still online on other sockets
      await roomRepository.saveParticipant(roomId, participant);
    }
  }

  /**
   * Disconnect single socket (could be temporary disconnect).
   */
  async handleSocketDisconnect(socketId: string) {
    const presence = await roomRepository.getSocketPresence(socketId);
    if (!presence) return;

    const { userId, roomId } = presence;
    await roomRepository.removeSocketPresence(socketId);

    const participant = await roomRepository.getParticipant(roomId, userId);
    if (!participant) return;

    participant.socketIds = participant.socketIds.filter((id) => id !== socketId);

    if (participant.socketIds.length === 0) {
      // Mark as offline but keep participant details in Redis temporarily for heartbeat timeout worker
      participant.online = false;
      await roomRepository.saveParticipant(roomId, participant);
      await roomRepository.setUserPresence(userId, "offline");

      this.broadcast(roomId, "PARTICIPANT_OFFLINE", { userId });

      // Trigger automatic transfer if they were owner
      const roomState = await roomRepository.getRoomState(roomId);
      if (roomState?.ownerId === userId) {
        // Wait: worker or heartbeat handles actual clean transfer, or trigger immediately.
        // The prompt says "When owner disconnects or leaves, trigger ownership transfer."
        // Let's trigger it immediately for seamless UX, but allow reconnect if they come back fast.
        // Wait, immediate transfer is safer to avoid headless rooms. Let's trigger it.
        await this.handleAutomaticOwnershipTransfer(roomId, userId);
      }
    } else {
      await roomRepository.saveParticipant(roomId, participant);
    }
  }

  /**
   * Handle automatic ownership transfer when owner departs/disconnects.
   */
  private async handleAutomaticOwnershipTransfer(roomId: string, currentOwnerId: string) {
    const participants = await roomRepository.listParticipants(roomId);

    // Filter eligible: active (online preferred, but any active participant other than current owner)
    const eligible = participants
      .filter((p) => p.userId !== currentOwnerId)
      .sort((a, b) => new Date(a.joinedAt).getTime() - new Date(b.joinedAt).getTime());

    if (eligible.length === 0) {
      logger.info(`No other active participants in room ${roomId}. Room remains ownerless until next join.`);
      return;
    }

    const nextOwner = eligible[0];
    await this.performOwnershipTransfer(roomId, currentOwnerId, nextOwner.userId, "Owner disconnected/left");
  }

  /**
   * Perform the atomic ownership transfer.
   */
  private async performOwnershipTransfer(roomId: string, fromId: string, toId: string, reason: string) {
    await prisma.$transaction(async (tx) => {
      // 1. Update room owner in Postgres
      await tx.room.update({
        where: { id: roomId },
        data: { ownerId: toId },
      });

      // 2. Update member roles in Postgres
      await tx.roomMember.updateMany({
        where: { roomId, userId: fromId },
        data: { role: "VIEWER" },
      });

      await tx.roomMember.updateMany({
        where: { roomId, userId: toId },
        data: { role: "OWNER" },
      });

      // 3. Write to ownership history
      await tx.roomOwnershipHistory.create({
        data: {
          roomId,
          previousOwnerId: fromId,
          newOwnerId: toId,
          reason,
        },
      });
    });

    // 4. Update Redis owner metadata
    await roomRepository.updateRoomState(roomId, { ownerId: toId });

    // 5. Update participant roles in Redis
    const prevParticipant = await roomRepository.getParticipant(roomId, fromId);
    if (prevParticipant) {
      prevParticipant.role = "PARTICIPANT";
      await roomRepository.saveParticipant(roomId, prevParticipant);
    }

    const nextParticipant = await roomRepository.getParticipant(roomId, toId);
    if (nextParticipant) {
      nextParticipant.role = "OWNER";
      await roomRepository.saveParticipant(roomId, nextParticipant);
    }

    // 6. Broadcast Event
    this.broadcast(roomId, "OWNER_CHANGED", {
      previousOwnerId: fromId,
      newOwnerId: toId,
      reason,
    });
  }

  /**
   * Manual ownership transfer initiated by current owner.
   */
  async transferOwnershipManually(roomId: string, currentOwnerId: string, newOwnerId: string) {
    const isAllowed = await permissionService.hasPermission(currentOwnerId, roomId, "TRANSFER_OWNER");
    if (!isAllowed) {
      throw new Error("Unauthorized to transfer ownership");
    }

    if (currentOwnerId === newOwnerId) {
      throw new Error("Cannot transfer ownership to yourself");
    }

    // Verify new owner is currently a member
    const newOwnerMember = await prisma.roomMember.findUnique({
      where: { roomId_userId: { roomId, userId: newOwnerId } },
    });
    if (!newOwnerMember || newOwnerMember.leftAt) {
      throw new Error("New owner must be an active member of the room");
    }

    await this.performOwnershipTransfer(roomId, currentOwnerId, newOwnerId, "Manual transfer by owner");
  }

  /**
   * Kick a participant from the room.
   */
  async kickUser(moderatorId: string, roomId: string, targetUserId: string, reason: string) {
    const isAllowed = await permissionService.hasPermission(moderatorId, roomId, "KICK_USER");
    if (!isAllowed) {
      throw new Error("Unauthorized to kick user");
    }

    const targetParticipant = await roomRepository.getParticipant(roomId, targetUserId);
    
    // In Postgres, mark left
    await prisma.roomMember.updateMany({
      where: { roomId, userId: targetUserId },
      data: { leftAt: new Date() },
    });

    // Write audit moderation action
    await prisma.moderationAction.create({
      data: {
        roomId,
        moderatorId,
        targetUserId,
        action: "kick",
        reason,
      },
    });

    if (targetParticipant) {
      // Disconnect their sockets
      const io = getSocketIO();
      if (io) {
        for (const socketId of targetParticipant.socketIds) {
          const socket = io.sockets.sockets.get(socketId);
          if (socket) {
            socket.emit("ROOM_LEFT", { reason: `Kicked by moderator: ${reason}` });
            socket.leave(roomId);
          }
          await roomRepository.removeSocketPresence(socketId);
        }
      }
      await roomRepository.removeParticipant(roomId, targetUserId);
    }

    // Broadcast left event
    this.broadcast(roomId, "PARTICIPANT_LEFT", { userId: targetUserId, reason: `Kicked: ${reason}` });
  }

  /**
   * Ban user from a room.
   */
  async banUser(moderatorId: string, roomId: string, targetUserId: string, reason: string, expiresAt?: Date) {
    const isAllowed = await permissionService.hasPermission(moderatorId, roomId, "BAN_USER");
    if (!isAllowed) {
      throw new Error("Unauthorized to ban user");
    }

    // 1. Record ban in Postgres
    await prisma.roomBan.upsert({
      where: {
        roomId_userId: { roomId, userId: targetUserId },
      },
      update: {
        bannedBy: moderatorId,
        reason,
        expiresAt,
      },
      create: {
        roomId,
        userId: targetUserId,
        bannedBy: moderatorId,
        reason,
        expiresAt,
      },
    });

    // 2. Also record in moderation actions
    await prisma.moderationAction.create({
      data: {
        roomId,
        moderatorId,
        targetUserId,
        action: "ban",
        reason,
      },
    });

    // 3. Kick if currently in the room
    const targetParticipant = await roomRepository.getParticipant(roomId, targetUserId);
    if (targetParticipant) {
      const io = getSocketIO();
      if (io) {
        for (const socketId of targetParticipant.socketIds) {
          const socket = io.sockets.sockets.get(socketId);
          if (socket) {
            socket.emit("ROOM_LEFT", { reason: `Banned by moderator: ${reason}` });
            socket.leave(roomId);
          }
          await roomRepository.removeSocketPresence(socketId);
        }
      }
      await roomRepository.removeParticipant(roomId, targetUserId);
    }

    // Broadcast left event
    this.broadcast(roomId, "PARTICIPANT_LEFT", { userId: targetUserId, reason: `Banned: ${reason}` });
  }

  /**
   * Unban user from a room.
   */
  async unbanUser(moderatorId: string, roomId: string, targetUserId: string) {
    const isAllowed = await permissionService.hasPermission(moderatorId, roomId, "UNBAN_USER");
    if (!isAllowed) {
      throw new Error("Unauthorized to unban user");
    }

    await prisma.roomBan.deleteMany({
      where: { roomId, userId: targetUserId },
    });

    // Record moderation action
    await prisma.moderationAction.create({
      data: {
        roomId,
        moderatorId,
        targetUserId,
        action: "unban",
        reason: "Unbanned by moderator",
      },
    });
  }
}

export const roomService = new RoomService();
