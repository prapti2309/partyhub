"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const room_service_1 = require("@/services/room.service");
const room_repository_1 = require("@/repositories/room.repository");
const permission_service_1 = require("@/services/permission.service");
const prisma_1 = require("@/config/prisma");
const redis_1 = require("@/config/redis");
// Mock prisma and redisClient modules
jest.mock("@/config/prisma", () => {
    const mockPrismaObj = {
        room: {
            create: jest.fn(),
            findUnique: jest.fn(),
            findFirst: jest.fn(),
            update: jest.fn(),
        },
        roomMember: {
            create: jest.fn(),
            findUnique: jest.fn(),
            update: jest.fn(),
            updateMany: jest.fn(),
            count: jest.fn(),
        },
        roomBan: {
            findUnique: jest.fn(),
            delete: jest.fn(),
            upsert: jest.fn(),
            deleteMany: jest.fn(),
        },
        roomOwnershipHistory: {
            create: jest.fn(),
        },
        moderationAction: {
            create: jest.fn(),
        },
        user: {
            findUnique: jest.fn(),
        },
        roomSettings: {
            findUnique: jest.fn(),
        },
        $transaction: jest.fn(async (cb) => {
            return await cb(mockPrismaObj);
        }),
    };
    return { prisma: mockPrismaObj };
});
const mockRedisStore = new Map();
const mockRedisHashes = new Map();
const mockRedisSets = new Map();
jest.mock("@/config/redis", () => {
    return {
        redisClient: {
            hSet: jest.fn(async (key, field, val) => {
                if (!mockRedisHashes.has(key)) {
                    mockRedisHashes.set(key, new Map());
                }
                const hash = mockRedisHashes.get(key);
                if (typeof field === "object") {
                    for (const [k, v] of Object.entries(field)) {
                        hash.set(k, String(v));
                    }
                }
                else {
                    hash.set(field, String(val));
                }
                return 1;
            }),
            hGet: jest.fn(async (key, field) => {
                return mockRedisHashes.get(key)?.get(field) || null;
            }),
            hGetAll: jest.fn(async (key) => {
                const hash = mockRedisHashes.get(key);
                if (!hash)
                    return {};
                const obj = {};
                for (const [k, v] of hash.entries()) {
                    obj[k] = v;
                }
                return obj;
            }),
            hDel: jest.fn(async (key, field) => {
                mockRedisHashes.get(key)?.delete(field);
                return 1;
            }),
            set: jest.fn(async (key, val, _options) => {
                mockRedisStore.set(key, String(val));
                return "OK";
            }),
            get: jest.fn(async (key) => {
                return mockRedisStore.get(key) || null;
            }),
            del: jest.fn(async (key) => {
                mockRedisStore.delete(key);
                mockRedisHashes.delete(key);
                return 1;
            }),
            sAdd: jest.fn(async (key, member) => {
                if (!mockRedisSets.has(key)) {
                    mockRedisSets.set(key, new Set());
                }
                mockRedisSets.get(key).add(member);
                return 1;
            }),
            sRem: jest.fn(async (key, member) => {
                mockRedisSets.get(key)?.delete(member);
                return 1;
            }),
            sMembers: jest.fn(async (key) => {
                return Array.from(mockRedisSets.get(key) || []);
            }),
        },
    };
});
// Mock Socket IO
jest.mock("@/sockets", () => ({
    getSocketIO: jest.fn(() => ({
        to: jest.fn(() => ({
            emit: jest.fn(),
        })),
        sockets: {
            sockets: {
                get: jest.fn(() => ({
                    emit: jest.fn(),
                    leave: jest.fn(),
                    disconnect: jest.fn(),
                })),
            },
        },
    })),
}));
describe("Room Infrastructure (Phase 3) Test Suite", () => {
    beforeEach(() => {
        jest.clearAllMocks();
        mockRedisStore.clear();
        mockRedisHashes.clear();
        mockRedisSets.clear();
    });
    describe("Room Creation", () => {
        it("should successfully create room records in DB and cache, and initialize owner in participants", async () => {
            const mockRoom = {
                id: "room_123",
                name: "Test Room",
                ownerId: "user_owner",
                roomCode: "ABCDEF",
                isPrivate: false,
                settings: {},
            };
            prisma_1.prisma.room.create.mockResolvedValue(mockRoom);
            prisma_1.prisma.roomMember.create.mockResolvedValue({});
            prisma_1.prisma.user.findUnique.mockResolvedValue({
                id: "user_owner",
                profile: { displayName: "Owner User" },
            });
            const result = await room_service_1.roomService.createRoom("user_owner", "Test Room", false);
            expect(result.id).toBe("room_123");
            expect(prisma_1.prisma.room.create).toHaveBeenCalled();
            expect(prisma_1.prisma.roomMember.create).toHaveBeenCalledWith({
                data: { roomId: "room_123", userId: "user_owner", role: "OWNER" },
            });
            // Verify Redis State
            const activeRooms = await redis_1.redisClient.sMembers("active_rooms");
            expect(activeRooms).toContain("room_123");
            const roomMeta = await room_repository_1.roomRepository.getRoomState("room_123");
            expect(roomMeta?.ownerId).toBe("user_owner");
            const participants = await room_repository_1.roomRepository.listParticipants("room_123");
            expect(participants.length).toBe(1);
            expect(participants[0].userId).toBe("user_owner");
            expect(participants[0].role).toBe("OWNER");
        });
    });
    describe("Room Joining and Presence", () => {
        it("should allow a valid user to join the room and prevent ban list violators", async () => {
            // Setup room in DB
            const mockRoom = {
                id: "room_123",
                name: "Test Room",
                roomCode: "ABCDEF",
                status: "ACTIVE",
                isPrivate: false,
                maxCapacity: 10,
                ownerId: "owner_user",
            };
            prisma_1.prisma.room.findUnique.mockResolvedValue(mockRoom);
            prisma_1.prisma.room.findFirst.mockResolvedValue(mockRoom);
            prisma_1.prisma.roomBan.findUnique.mockResolvedValue(null);
            prisma_1.prisma.roomMember.findUnique.mockResolvedValue(null);
            prisma_1.prisma.roomMember.create.mockResolvedValue({ role: "VIEWER" });
            prisma_1.prisma.roomMember.count.mockResolvedValue(1);
            const result = await room_service_1.roomService.joinRoom("user_joiner", "ABCDEF", "socket_123", "Joiner User");
            expect(result.participant.userId).toBe("user_joiner");
            expect(result.participant.online).toBe(true);
            expect(result.participant.socketIds).toContain("socket_123");
            // Verify socket presence in Redis
            const socketPresence = await room_repository_1.roomRepository.getSocketPresence("socket_123");
            expect(socketPresence?.userId).toBe("user_joiner");
            expect(socketPresence?.roomId).toBe("room_123");
        });
        it("should prevent banned users from joining", async () => {
            const mockRoom = {
                id: "room_123",
                name: "Test Room",
                roomCode: "ABCDEF",
                status: "ACTIVE",
                isPrivate: false,
                maxCapacity: 10,
            };
            prisma_1.prisma.room.findUnique.mockResolvedValue(mockRoom);
            prisma_1.prisma.roomBan.findUnique.mockResolvedValue({
                id: "ban_123",
                expiresAt: null,
            });
            await expect(room_service_1.roomService.joinRoom("banned_user", "ABCDEF", "socket_123", "Banned User")).rejects.toThrow("You are banned from this room");
        });
    });
    describe("Ownership Transfer", () => {
        it("should allow the owner to manually transfer ownership", async () => {
            // Mock database setup
            prisma_1.prisma.user.findUnique.mockResolvedValue({ role: "USER" });
            prisma_1.prisma.roomMember.findUnique.mockResolvedValue({ role: "VIEWER", leftAt: null });
            const mockRoom = { id: "room_123", ownerId: "owner_user", name: "Room", roomCode: "ABC" };
            prisma_1.prisma.room.findUnique.mockResolvedValue(mockRoom);
            prisma_1.prisma.room.findFirst.mockResolvedValue(mockRoom);
            prisma_1.prisma.room.update.mockResolvedValue(mockRoom);
            const roomMeta = { id: "room_123", ownerId: "owner_user", name: "Room", code: "ABC" };
            await room_repository_1.roomRepository.createRoomState("room_123", roomMeta);
            await room_repository_1.roomRepository.saveParticipant("room_123", {
                userId: "owner_user",
                username: "Owner",
                role: "OWNER",
                joinedAt: new Date().toISOString(),
                online: true,
                socketIds: [],
            });
            await room_repository_1.roomRepository.saveParticipant("room_123", {
                userId: "new_owner",
                username: "NewOwner",
                role: "PARTICIPANT",
                joinedAt: new Date().toISOString(),
                online: true,
                socketIds: [],
            });
            await room_service_1.roomService.transferOwnershipManually("room_123", "owner_user", "new_owner");
            const updatedMeta = await room_repository_1.roomRepository.getRoomState("room_123");
            expect(updatedMeta?.ownerId).toBe("new_owner");
            const pOwner = await room_repository_1.roomRepository.getParticipant("room_123", "owner_user");
            const pNewOwner = await room_repository_1.roomRepository.getParticipant("room_123", "new_owner");
            expect(pOwner?.role).toBe("PARTICIPANT");
            expect(pNewOwner?.role).toBe("OWNER");
        });
        it("should automatically transfer ownership to the oldest member when owner leaves", async () => {
            const mockRoom = { id: "room_123", ownerId: "owner_user", name: "Room", roomCode: "ABC" };
            prisma_1.prisma.room.findUnique.mockResolvedValue(mockRoom);
            prisma_1.prisma.room.findFirst.mockResolvedValue(mockRoom);
            prisma_1.prisma.room.update.mockResolvedValue(mockRoom);
            const roomMeta = { id: "room_123", ownerId: "owner_user", name: "Room", code: "ABC" };
            await room_repository_1.roomRepository.createRoomState("room_123", roomMeta);
            const joinTime = Date.now();
            await room_repository_1.roomRepository.saveParticipant("room_123", {
                userId: "owner_user",
                username: "Owner",
                role: "OWNER",
                joinedAt: new Date(joinTime).toISOString(),
                online: true,
                socketIds: ["socket_owner"],
            });
            await room_repository_1.roomRepository.saveParticipant("room_123", {
                userId: "member_old",
                username: "OldMember",
                role: "PARTICIPANT",
                joinedAt: new Date(joinTime + 1000).toISOString(),
                online: true,
                socketIds: ["socket_old"],
            });
            await room_repository_1.roomRepository.saveParticipant("room_123", {
                userId: "member_new",
                username: "NewMember",
                role: "PARTICIPANT",
                joinedAt: new Date(joinTime + 5000).toISOString(),
                online: true,
                socketIds: ["socket_new"],
            });
            // Owner leaves
            await room_service_1.roomService.leaveRoom("owner_user", "room_123", "socket_owner");
            // Verify owner left Redis participants list
            const pOwner = await room_repository_1.roomRepository.getParticipant("room_123", "owner_user");
            expect(pOwner).toBeNull();
            // Verify next owner is member_old (earliest join timestamp after owner)
            const updatedMeta = await room_repository_1.roomRepository.getRoomState("room_123");
            expect(updatedMeta?.ownerId).toBe("member_old");
            const pOld = await room_repository_1.roomRepository.getParticipant("room_123", "member_old");
            expect(pOld?.role).toBe("OWNER");
        });
    });
    describe("Permissions", () => {
        it("should allow owner to execute owner actions and deny regular participants", async () => {
            const mockRoom = { id: "room_123", ownerId: "owner_user", name: "Room", roomCode: "ABC" };
            prisma_1.prisma.room.findUnique.mockResolvedValue(mockRoom);
            prisma_1.prisma.room.findFirst.mockResolvedValue(mockRoom);
            const roomMeta = { id: "room_123", ownerId: "owner_user", name: "Room", code: "ABC" };
            await room_repository_1.roomRepository.createRoomState("room_123", roomMeta);
            await room_repository_1.roomRepository.saveParticipant("room_123", {
                userId: "owner_user",
                username: "Owner",
                role: "OWNER",
                joinedAt: new Date().toISOString(),
                online: true,
                socketIds: [],
            });
            await room_repository_1.roomRepository.saveParticipant("room_123", {
                userId: "member_user",
                username: "Member",
                role: "PARTICIPANT",
                joinedAt: new Date().toISOString(),
                online: true,
                socketIds: [],
            });
            // TRANSFER_OWNER permission check
            const ownerPerm = await permission_service_1.permissionService.hasPermission("owner_user", "room_123", "TRANSFER_OWNER");
            const memberPerm = await permission_service_1.permissionService.hasPermission("member_user", "room_123", "TRANSFER_OWNER");
            expect(ownerPerm).toBe(true);
            expect(memberPerm).toBe(false);
        });
    });
});
