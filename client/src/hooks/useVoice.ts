// src/hooks/useVoice.ts
import { useVoiceStore } from "../stores/voice.store";

export const useVoice = () => {
  const {
    isInVoiceChannel,
    isMuted,
    isDeafened,
    isCameraOn,
    isScreenSharing,
    participants,
    voicePeers,
    joinVoice,
    leaveVoice,
    setMuted,
    toggleMute,
    toggleDeafen,
    toggleCamera,
    toggleScreenShare,
    addParticipant,
    removeParticipant,
    clear,
    updatePeerVoiceState,
    setSpeaking,
  } = useVoiceStore();

  return {
    isInVoiceChannel,
    isMuted,
    isDeafened,
    isCameraOn,
    isScreenSharing,
    participants,
    voicePeers,
    joinVoice,
    leaveVoice,
    setMuted,
    toggleMute,
    toggleDeafen,
    toggleCamera,
    toggleScreenShare,
    addParticipant,
    removeParticipant,
    clear,
    updatePeerVoiceState,
    setSpeaking,
  };
};
