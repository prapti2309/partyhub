"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const express_rate_limit_1 = __importDefault(require("express-rate-limit"));
const room_controller_1 = require("@/controllers/room.controller");
const auth_middleware_1 = require("@/middleware/auth.middleware");
const validate_middleware_1 = require("@/middleware/validate.middleware");
const room_validators_1 = require("@/validators/room.validators");
const router = (0, express_1.Router)();
// Room action rate limiters
const roomLimiter = (0, express_rate_limit_1.default)({
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
router.use(auth_middleware_1.requireAuth);
router.post("/", roomLimiter, (0, validate_middleware_1.validate)(room_validators_1.createRoomSchema), room_controller_1.roomController.createRoom);
router.get("/:id", roomLimiter, room_controller_1.roomController.getRoom);
router.post("/:id/join", roomLimiter, (0, validate_middleware_1.validate)(room_validators_1.joinRoomSchema), room_controller_1.roomController.joinRoom);
router.post("/:id/leave", roomLimiter, room_controller_1.roomController.leaveRoom);
router.post("/:id/transfer-owner", roomLimiter, (0, validate_middleware_1.validate)(room_validators_1.transferOwnerSchema), room_controller_1.roomController.transferOwner);
router.get("/:id/participants", roomLimiter, room_controller_1.roomController.getParticipants);
router.post("/:id/kick", roomLimiter, (0, validate_middleware_1.validate)(room_validators_1.kickUserSchema), room_controller_1.roomController.kickUser);
router.post("/:id/ban", roomLimiter, (0, validate_middleware_1.validate)(room_validators_1.banUserSchema), room_controller_1.roomController.banUser);
router.post("/:id/unban", roomLimiter, (0, validate_middleware_1.validate)(room_validators_1.unbanUserSchema), room_controller_1.roomController.unbanUser);
exports.default = router;
