"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.roomController = void 0;
const prisma_1 = require("@/config/prisma");
const room_service_1 = require("@/services/room.service");
const room_repository_1 = require("@/repositories/room.repository");
const asyncHandler_1 = require("@/utils/asyncHandler");
const errors_1 = require("@/utils/errors");
/**
 * Resolves a roomId or roomCode to a valid Room db record
 */
async function resolveRoom(id) {
    const room = await prisma_1.prisma.room.findFirst({
        where: {
            OR: [{ id }, { roomCode: id }],
        },
        include: { settings: true },
    });
    if (!room) {
        throw new errors_1.AppError("Room not found", 404);
    }
    return room;
}
exports.roomController = {
    createRoom: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { name, isPrivate, password } = req.body;
        const userId = req.user?.id;
        if (!userId)
            throw new errors_1.AppError("Unauthorized", 401);
        const room = await room_service_1.roomService.createRoom(userId, name, isPrivate, password);
        res.status(201).json({
            status: "success",
            data: { room },
        });
    }),
    getRoom: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const room = await resolveRoom(id);
        res.status(200).json({
            status: "success",
            data: { room },
        });
    }),
    joinRoom: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const { socketId, username, password } = req.body;
        const userId = req.user?.id;
        if (!userId)
            throw new errors_1.AppError("Unauthorized", 401);
        const room = await resolveRoom(id);
        const resolvedUsername = username || req.user?.email || "Guest";
        const result = await room_service_1.roomService.joinRoom(userId, room.roomCode, socketId || "rest_conn", resolvedUsername, password);
        res.status(200).json({
            status: "success",
            data: result,
        });
    }),
    leaveRoom: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const { socketId } = req.body;
        const userId = req.user?.id;
        if (!userId)
            throw new errors_1.AppError("Unauthorized", 401);
        const room = await resolveRoom(id);
        await room_service_1.roomService.leaveRoom(userId, room.id, socketId);
        res.status(200).json({
            status: "success",
            message: "Successfully left the room",
        });
    }),
    transferOwner: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const { newOwnerId } = req.body;
        const userId = req.user?.id;
        if (!userId)
            throw new errors_1.AppError("Unauthorized", 401);
        const room = await resolveRoom(id);
        await room_service_1.roomService.transferOwnershipManually(room.id, userId, newOwnerId);
        res.status(200).json({
            status: "success",
            message: "Ownership transferred successfully",
        });
    }),
    getParticipants: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const room = await resolveRoom(id);
        const participants = await room_repository_1.roomRepository.listParticipants(room.id);
        res.status(200).json({
            status: "success",
            data: { participants },
        });
    }),
    kickUser: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const { targetUserId, reason } = req.body;
        const userId = req.user?.id;
        if (!userId)
            throw new errors_1.AppError("Unauthorized", 401);
        const room = await resolveRoom(id);
        await room_service_1.roomService.kickUser(userId, room.id, targetUserId, reason || "Kicked by moderator");
        res.status(200).json({
            status: "success",
            message: "User kicked successfully",
        });
    }),
    banUser: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const { targetUserId, reason, expiresAt } = req.body;
        const userId = req.user?.id;
        if (!userId)
            throw new errors_1.AppError("Unauthorized", 401);
        const room = await resolveRoom(id);
        const parsedExpiresAt = expiresAt ? new Date(expiresAt) : undefined;
        await room_service_1.roomService.banUser(userId, room.id, targetUserId, reason || "Banned by moderator", parsedExpiresAt);
        res.status(200).json({
            status: "success",
            message: "User banned successfully",
        });
    }),
    unbanUser: (0, asyncHandler_1.asyncHandler)(async (req, res) => {
        const { id } = req.params;
        const { targetUserId } = req.body;
        const userId = req.user?.id;
        if (!userId)
            throw new errors_1.AppError("Unauthorized", 401);
        const room = await resolveRoom(id);
        await room_service_1.roomService.unbanUser(userId, room.id, targetUserId);
        res.status(200).json({
            status: "success",
            message: "User unbanned successfully",
        });
    }),
};
