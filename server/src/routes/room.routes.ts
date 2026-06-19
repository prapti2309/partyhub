import { Router } from "express";
import rateLimit from "express-rate-limit";
import { roomController } from "@/controllers/room.controller";
import { requireAuth } from "@/middleware/auth.middleware";
import { validate } from "@/middleware/validate.middleware";
import {
  createRoomSchema,
  joinRoomSchema,
  transferOwnerSchema,
  kickUserSchema,
  banUserSchema,
  unbanUserSchema,
} from "@/validators/room.validators";

const router = Router();

// Room action rate limiters
const roomLimiter = rateLimit({
  windowMs: 60 * 1000, // 1 minute
  max: 15,
  message: {
    status: "fail",
    code: "RATE_LIMIT_EXCEEDED",
    message: "Too many room requests. Please try again after 1 minute.",
  },
  standardHeaders: true,
  legacyHeaders: false,
});

router.use(requireAuth);

router.post("/", roomLimiter, validate(createRoomSchema), roomController.createRoom);
router.get("/:id", roomLimiter, roomController.getRoom);
router.post("/:id/join", roomLimiter, validate(joinRoomSchema), roomController.joinRoom);
router.post("/:id/leave", roomLimiter, roomController.leaveRoom);
router.post("/:id/transfer-owner", roomLimiter, validate(transferOwnerSchema), roomController.transferOwner);
router.get("/:id/participants", roomLimiter, roomController.getParticipants);
router.post("/:id/kick", roomLimiter, validate(kickUserSchema), roomController.kickUser);
router.post("/:id/ban", roomLimiter, validate(banUserSchema), roomController.banUser);
router.post("/:id/unban", roomLimiter, validate(unbanUserSchema), roomController.unbanUser);

export default router;
