"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.registerMediaHandlers = registerMediaHandlers;
const socket_constants_1 = require("../socket.constants");
const logger_1 = require("@/utils/logger");
const media_validator_1 = require("@/validators/media.validator");
function registerMediaHandlers(io, socket) {
    const userId = socket.data.user?.id;
    const handleMediaEvent = (schema, eventType) => async (payload, ack) => {
        try {
            const data = schema.parse(payload);
            const { roomId, ...rest } = data;
            // Broadcast media state update to everyone else in the room
            socket.to(roomId).emit(socket_constants_1.SOCKET_EVENTS.MEDIA_STATE_UPDATE, {
                userId,
                socketId: socket.id,
                type: eventType,
                payload: rest,
            });
            ack && ack({ success: true });
        }
        catch (err) {
            logger_1.logger.error(`Media event error [${eventType}]`, err);
            ack && ack({ success: false, error: err.message });
        }
    };
    socket.on(socket_constants_1.SOCKET_EVENTS.MEDIA_CAMERA_ON, handleMediaEvent(media_validator_1.CameraOnSchema, "camera:on"));
    socket.on(socket_constants_1.SOCKET_EVENTS.MEDIA_CAMERA_OFF, handleMediaEvent(media_validator_1.CameraOffSchema, "camera:off"));
    socket.on(socket_constants_1.SOCKET_EVENTS.MEDIA_SCREEN_START, handleMediaEvent(media_validator_1.ScreenStartSchema, "screen:start"));
    socket.on(socket_constants_1.SOCKET_EVENTS.MEDIA_SCREEN_STOP, handleMediaEvent(media_validator_1.ScreenStopSchema, "screen:stop"));
    socket.on(socket_constants_1.SOCKET_EVENTS.MEDIA_DEVICE_UPDATE, handleMediaEvent(media_validator_1.DeviceUpdateSchema, "device:update"));
    socket.on(socket_constants_1.SOCKET_EVENTS.MEDIA_PERMISSIONS, handleMediaEvent(media_validator_1.PermissionsSchema, "permissions"));
    socket.on(socket_constants_1.SOCKET_EVENTS.MEDIA_SPEAKING, handleMediaEvent(media_validator_1.SpeakingSchema, "speaking"));
    socket.on(socket_constants_1.SOCKET_EVENTS.MEDIA_QUALITY, handleMediaEvent(media_validator_1.QualitySchema, "quality"));
}
