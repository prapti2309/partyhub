import { roomService } from "@/services/room.service";
import { roomRepository } from "@/repositories/room.repository";
import { permissionService } from "@/services/permission.service";
import { prisma } from "@/config/prisma";
import { redisClient } from "@/config/redis";

// Mock prisma and redisClient modules
jest.mock("@/config/prisma", () => {
  const mockPrismaObj: any = {
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

const mockRedisStore = new Map<string, string>();
const mockRedisHashes = new Map<string, Map<string, string>>();
const mockRedisSets = new Map<string, Set<string>>();

jest.mock("@/config/redis", () => {
  return {
    redisClient: {
      hSet: jest.fn(async (key, field, val) => {
        if (!mockRedisHashes.has(key)) {
          mockRedisHashes.set(key, new Map());
        }
        const hash = mockRedisHashes.get(key)!;
        if (typeof field === "object") {
          for (const [k, v] of Object.entries(field)) {
            hash.set(k, String(v));
          }
        } else {
          hash.set(field, String(val));
        }
        return 1;
      }),
      hGet: jest.fn(async (key, field) => {
        return mockRedisHashes.get(key)?.get(field) || null;
      }),
      hGetAll: jest.fn(async (key) => {
        const hash = mockRedisHashes.get(key);
        if (!hash) return {};
        const obj: Record<string, string> = {};
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
        mockRedisSets.get(key)!.add(member);
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

      (prisma.room.create as jest.Mock).mockResolvedValue(mockRoom);
      (prisma.roomMember.create as jest.Mock).mockResolvedValue({});
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({
        id: "user_owner",
        profile: { displayName: "Owner User" },
      });

      const result = await roomService.createRoom("user_owner", "Test Room", false);

      expect(result.id).toBe("room_123");
      expect(prisma.room.create).toHaveBeenCalled();
      expect(prisma.roomMember.create).toHaveBeenCalledWith({
        data: { roomId: "room_123", userId: "user_owner", role: "OWNER" },
      });

      // Verify Redis State
      const activeRooms = await redisClient.sMembers("active_rooms");
      expect(activeRooms).toContain("room_123");

      const roomMeta = await roomRepository.getRoomState("room_123");
      expect(roomMeta?.ownerId).toBe("user_owner");

      const participants = await roomRepository.listParticipants("room_123");
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

      (prisma.room.findUnique as jest.Mock).mockResolvedValue(mockRoom);
      (prisma.room.findFirst as jest.Mock).mockResolvedValue(mockRoom);
      (prisma.roomBan.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.roomMember.findUnique as jest.Mock).mockResolvedValue(null);
      (prisma.roomMember.create as jest.Mock).mockResolvedValue({ role: "VIEWER" });
      (prisma.roomMember.count as jest.Mock).mockResolvedValue(1);

      const result = await roomService.joinRoom("user_joiner", "ABCDEF", "socket_123", "Joiner User");

      expect(result.participant.userId).toBe("user_joiner");
      expect(result.participant.online).toBe(true);
      expect(result.participant.socketIds).toContain("socket_123");

      // Verify socket presence in Redis
      const socketPresence = await roomRepository.getSocketPresence("socket_123");
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

      (prisma.room.findUnique as jest.Mock).mockResolvedValue(mockRoom);
      (prisma.roomBan.findUnique as jest.Mock).mockResolvedValue({
        id: "ban_123",
        expiresAt: null,
      });

      await expect(
        roomService.joinRoom("banned_user", "ABCDEF", "socket_123", "Banned User")
      ).rejects.toThrow("You are banned from this room");
    });
  });

  describe("Ownership Transfer", () => {
    it("should allow the owner to manually transfer ownership", async () => {
      // Mock database setup
      (prisma.user.findUnique as jest.Mock).mockResolvedValue({ role: "USER" });
      (prisma.roomMember.findUnique as jest.Mock).mockResolvedValue({ role: "VIEWER", leftAt: null });
      
      const mockRoom = { id: "room_123", ownerId: "owner_user", name: "Room", roomCode: "ABC" };
      (prisma.room.findUnique as jest.Mock).mockResolvedValue(mockRoom);
      (prisma.room.findFirst as jest.Mock).mockResolvedValue(mockRoom);
      (prisma.room.update as jest.Mock).mockResolvedValue(mockRoom);

      const roomMeta = { id: "room_123", ownerId: "owner_user", name: "Room", code: "ABC" };
      await roomRepository.createRoomState("room_123", roomMeta);
      await roomRepository.saveParticipant("room_123", {
        userId: "owner_user",
        username: "Owner",
        role: "OWNER",
        joinedAt: new Date().toISOString(),
        online: true,
        socketIds: [],
      });
      await roomRepository.saveParticipant("room_123", {
        userId: "new_owner",
        username: "NewOwner",
        role: "PARTICIPANT",
        joinedAt: new Date().toISOString(),
        online: true,
        socketIds: [],
      });

      await roomService.transferOwnershipManually("room_123", "owner_user", "new_owner");

      const updatedMeta = await roomRepository.getRoomState("room_123");
      expect(updatedMeta?.ownerId).toBe("new_owner");

      const pOwner = await roomRepository.getParticipant("room_123", "owner_user");
      const pNewOwner = await roomRepository.getParticipant("room_123", "new_owner");
      expect(pOwner?.role).toBe("PARTICIPANT");
      expect(pNewOwner?.role).toBe("OWNER");
    });

    it("should automatically transfer ownership to the oldest member when owner leaves", async () => {
      const mockRoom = { id: "room_123", ownerId: "owner_user", name: "Room", roomCode: "ABC" };
      (prisma.room.findUnique as jest.Mock).mockResolvedValue(mockRoom);
      (prisma.room.findFirst as jest.Mock).mockResolvedValue(mockRoom);
      (prisma.room.update as jest.Mock).mockResolvedValue(mockRoom);

      const roomMeta = { id: "room_123", ownerId: "owner_user", name: "Room", code: "ABC" };
      await roomRepository.createRoomState("room_123", roomMeta);
      
      const joinTime = Date.now();
      
      await roomRepository.saveParticipant("room_123", {
        userId: "owner_user",
        username: "Owner",
        role: "OWNER",
        joinedAt: new Date(joinTime).toISOString(),
        online: true,
        socketIds: ["socket_owner"],
      });
      
      await roomRepository.saveParticipant("room_123", {
        userId: "member_old",
        username: "OldMember",
        role: "PARTICIPANT",
        joinedAt: new Date(joinTime + 1000).toISOString(),
        online: true,
        socketIds: ["socket_old"],
      });

      await roomRepository.saveParticipant("room_123", {
        userId: "member_new",
        username: "NewMember",
        role: "PARTICIPANT",
        joinedAt: new Date(joinTime + 5000).toISOString(),
        online: true,
        socketIds: ["socket_new"],
      });

      // Owner leaves
      await roomService.leaveRoom("owner_user", "room_123", "socket_owner");

      // Verify owner left Redis participants list
      const pOwner = await roomRepository.getParticipant("room_123", "owner_user");
      expect(pOwner).toBeNull();

      // Verify next owner is member_old (earliest join timestamp after owner)
      const updatedMeta = await roomRepository.getRoomState("room_123");
      expect(updatedMeta?.ownerId).toBe("member_old");

      const pOld = await roomRepository.getParticipant("room_123", "member_old");
      expect(pOld?.role).toBe("OWNER");
    });
  });

  describe("Permissions", () => {
    it("should allow owner to execute owner actions and deny regular participants", async () => {
      const mockRoom = { id: "room_123", ownerId: "owner_user", name: "Room", roomCode: "ABC" };
      (prisma.room.findUnique as jest.Mock).mockResolvedValue(mockRoom);
      (prisma.room.findFirst as jest.Mock).mockResolvedValue(mockRoom);

      const roomMeta = { id: "room_123", ownerId: "owner_user", name: "Room", code: "ABC" };
      await roomRepository.createRoomState("room_123", roomMeta);
      
      await roomRepository.saveParticipant("room_123", {
        userId: "owner_user",
        username: "Owner",
        role: "OWNER",
        joinedAt: new Date().toISOString(),
        online: true,
        socketIds: [],
      });
      
      await roomRepository.saveParticipant("room_123", {
        userId: "member_user",
        username: "Member",
        role: "PARTICIPANT",
        joinedAt: new Date().toISOString(),
        online: true,
        socketIds: [],
      });

      // TRANSFER_OWNER permission check
      const ownerPerm = await permissionService.hasPermission("owner_user", "room_123", "TRANSFER_OWNER");
      const memberPerm = await permissionService.hasPermission("member_user", "room_123", "TRANSFER_OWNER");

      expect(ownerPerm).toBe(true);
      expect(memberPerm).toBe(false);
    });
  });
});

