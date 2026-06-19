import { Request, Response } from "express";
import { prisma } from "@/config/prisma";
import { roomService } from "@/services/room.service";
import { roomRepository } from "@/repositories/room.repository";
import { asyncHandler } from "@/utils/asyncHandler";
import { AppError } from "@/utils/errors";

/**
 * Resolves a roomId or roomCode to a valid Room db record
 */
async function resolveRoom(id: string) {
  const room = await prisma.room.findFirst({
    where: {
      OR: [{ id }, { roomCode: id }],
    },
    include: { settings: true },
  });
  if (!room) {
    throw new AppError("Room not found", 404);
  }
  return room;
}

export const roomController = {
  createRoom: asyncHandler(async (req: Request, res: Response) => {
    const { name, isPrivate, password } = req.body;
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const room = await roomService.createRoom(userId, name, isPrivate, password);

    res.status(201).json({
      status: "success",
      data: { room },
    });
  }),

  getRoom: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const room = await resolveRoom(id);

    res.status(200).json({
      status: "success",
      data: { room },
    });
  }),

  joinRoom: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { socketId, username, password } = req.body;
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const room = await resolveRoom(id);
    const resolvedUsername = username || req.user?.email || "Guest";

    const result = await roomService.joinRoom(
      userId,
      room.roomCode,
      socketId || "rest_conn",
      resolvedUsername,
      password
    );

    res.status(200).json({
      status: "success",
      data: result,
    });
  }),

  leaveRoom: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { socketId } = req.body;
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const room = await resolveRoom(id);
    await roomService.leaveRoom(userId, room.id, socketId);

    res.status(200).json({
      status: "success",
      message: "Successfully left the room",
    });
  }),

  transferOwner: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { newOwnerId } = req.body;
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const room = await resolveRoom(id);
    await roomService.transferOwnershipManually(room.id, userId, newOwnerId);

    res.status(200).json({
      status: "success",
      message: "Ownership transferred successfully",
    });
  }),

  getParticipants: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const room = await resolveRoom(id);

    const participants = await roomRepository.listParticipants(room.id);

    res.status(200).json({
      status: "success",
      data: { participants },
    });
  }),

  kickUser: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { targetUserId, reason } = req.body;
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const room = await resolveRoom(id);
    await roomService.kickUser(userId, room.id, targetUserId, reason || "Kicked by moderator");

    res.status(200).json({
      status: "success",
      message: "User kicked successfully",
    });
  }),

  banUser: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { targetUserId, reason, expiresAt } = req.body;
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const room = await resolveRoom(id);
    const parsedExpiresAt = expiresAt ? new Date(expiresAt) : undefined;

    await roomService.banUser(
      userId,
      room.id,
      targetUserId,
      reason || "Banned by moderator",
      parsedExpiresAt
    );

    res.status(200).json({
      status: "success",
      message: "User banned successfully",
    });
  }),

  unbanUser: asyncHandler(async (req: Request, res: Response) => {
    const { id } = req.params;
    const { targetUserId } = req.body;
    const userId = req.user?.id;
    if (!userId) throw new AppError("Unauthorized", 401);

    const room = await resolveRoom(id);
    await roomService.unbanUser(userId, room.id, targetUserId);

    res.status(200).json({
      status: "success",
      message: "User unbanned successfully",
    });
  }),
};
