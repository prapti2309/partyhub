// src/voice/VoiceProvider.tsx
import React, { ReactNode } from "react";
import { WebRTCProvider } from "../contexts/WebRTCContext";
import VoicePanel from "./VoicePanel";

/**
 * VoiceProvider composes the WebRTC context with the persistent VoicePanel UI.
 * It should wrap the entire room page to ensure WebRTC lifecycle is managed
 * alongside the rest of the application.
 */
export const VoiceProvider = ({ children }: { children: ReactNode }) => {
  return (
    <WebRTCProvider>
      {children}
      <VoicePanel />
    </WebRTCProvider>
  );
};
