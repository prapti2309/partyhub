// src/validators/voice.validator.ts
import { z } from "zod";
import {
  VoiceJoinDTO,
  VoiceOfferDTO,
  VoiceAnswerDTO,
  VoiceIceCandidateDTO,
  VoiceMuteDTO,
  VoiceStateDTO,
  VoiceJoinSchema,
  VoiceOfferSchema,
  VoiceAnswerSchema,
  VoiceIceCandidateSchema,
  VoiceMuteSchema,
  VoiceStateSchema,
} from "../types/voice.types";

/**
 * Validation helpers for Voice signaling payloads.
 * Each function validates the incoming plain object and returns the typed DTO.
 * Throws a ZodError if validation fails.
 */
export const validateVoiceJoin = (data: any): VoiceJoinDTO => {
  return VoiceJoinSchema.parse(data) as VoiceJoinDTO;
};

export const validateVoiceOffer = (data: any): VoiceOfferDTO => {
  return VoiceOfferSchema.parse(data) as VoiceOfferDTO;
};

export const validateVoiceAnswer = (data: any): VoiceAnswerDTO => {
  return VoiceAnswerSchema.parse(data) as VoiceAnswerDTO;
};

export const validateVoiceIceCandidate = (data: any): VoiceIceCandidateDTO => {
  return VoiceIceCandidateSchema.parse(data) as VoiceIceCandidateDTO;
};

export const validateVoiceMute = (data: any): VoiceMuteDTO => {
  return VoiceMuteSchema.parse(data) as VoiceMuteDTO;
};

export const validateVoiceState = (data: any): VoiceStateDTO => {
  return VoiceStateSchema.parse(data) as VoiceStateDTO;
};
