import { Server as SocketServer, Socket } from "socket.io";
import { SOCKET_EVENTS } from "../socket.constants";
import { logger } from "@/utils/logger";
import { SocketData } from "../socket.types";
import {
  CameraOnSchema,
  CameraOffSchema,
  ScreenStartSchema,
  ScreenStopSchema,
  DeviceUpdateSchema,
  PermissionsSchema,
  SpeakingSchema,
  QualitySchema,
} from "@/validators/media.validator";

export function registerMediaHandlers(_io: SocketServer, socket: Socket<any, any, any, SocketData>) {
  const userId = socket.data.user?.id;

  const handleMediaEvent = (schema: any, eventType: string) => async (payload: any, ack: any) => {
    try {
      const data = schema.parse(payload);
      const { roomId, ...rest } = data;
      
      // Broadcast media state update to everyone else in the room
      socket.to(roomId).emit(SOCKET_EVENTS.MEDIA_STATE_UPDATE, {
        userId,
        socketId: socket.id,
        type: eventType,
        payload: rest,
      });

      ack && ack({ success: true });
    } catch (err: any) {
      logger.error(`Media event error [${eventType}]`, err);
      ack && ack({ success: false, error: err.message });
    }
  };

  socket.on(SOCKET_EVENTS.MEDIA_CAMERA_ON, handleMediaEvent(CameraOnSchema, "camera:on"));
  socket.on(SOCKET_EVENTS.MEDIA_CAMERA_OFF, handleMediaEvent(CameraOffSchema, "camera:off"));
  socket.on(SOCKET_EVENTS.MEDIA_SCREEN_START, handleMediaEvent(ScreenStartSchema, "screen:start"));
  socket.on(SOCKET_EVENTS.MEDIA_SCREEN_STOP, handleMediaEvent(ScreenStopSchema, "screen:stop"));
  socket.on(SOCKET_EVENTS.MEDIA_DEVICE_UPDATE, handleMediaEvent(DeviceUpdateSchema, "device:update"));
  socket.on(SOCKET_EVENTS.MEDIA_PERMISSIONS, handleMediaEvent(PermissionsSchema, "permissions"));
  socket.on(SOCKET_EVENTS.MEDIA_SPEAKING, handleMediaEvent(SpeakingSchema, "speaking"));
  socket.on(SOCKET_EVENTS.MEDIA_QUALITY, handleMediaEvent(QualitySchema, "quality"));
}
