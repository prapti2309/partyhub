import { z } from "zod";

const baseMediaSchema = z.object({
  roomId: z.string().uuid("Invalid room ID"),
});

export const CameraOnSchema = baseMediaSchema;
export const CameraOffSchema = baseMediaSchema;
export const ScreenStartSchema = baseMediaSchema;
export const ScreenStopSchema = baseMediaSchema;

export const DeviceUpdateSchema = baseMediaSchema.extend({
  hasAudio: z.boolean(),
  hasVideo: z.boolean(),
});

export const PermissionsSchema = baseMediaSchema.extend({
  audio: z.boolean(),
  video: z.boolean(),
  screen: z.boolean(),
});

export const SpeakingSchema = baseMediaSchema.extend({
  isSpeaking: z.boolean(),
});

export const QualitySchema = baseMediaSchema.extend({
  quality: z.enum(["high", "medium", "low", "poor"]),
});

export type CameraOnDTO = z.infer<typeof CameraOnSchema>;
export type CameraOffDTO = z.infer<typeof CameraOffSchema>;
export type ScreenStartDTO = z.infer<typeof ScreenStartSchema>;
export type ScreenStopDTO = z.infer<typeof ScreenStopSchema>;
export type DeviceUpdateDTO = z.infer<typeof DeviceUpdateSchema>;
export type PermissionsDTO = z.infer<typeof PermissionsSchema>;
export type SpeakingDTO = z.infer<typeof SpeakingSchema>;
export type QualityDTO = z.infer<typeof QualitySchema>;
