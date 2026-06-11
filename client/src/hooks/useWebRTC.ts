"use client";

import { useWebRTC as useWebRTCContext } from "../contexts/WebRTCContext";

export const useWebRTC = () => {
  return useWebRTCContext();
};
