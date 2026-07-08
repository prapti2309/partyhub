import { useEffect, useState } from 'react';
import { useMediaStore } from '../store/useMediaStore';
import { useWebRTC } from '@/contexts/WebRTCContext';

export function useRemoteMedia() {
  const { remoteMedia, updateRemoteParticipant, removeRemoteParticipant } = useMediaStore();
  const webrtc = useWebRTC();
  const [remoteStreams, setRemoteStreams] = useState<Record<string, MediaStream>>({});

  useEffect(() => {
    const handleRemoteStream = (e: Event) => {
      const customEvent = e as CustomEvent<{ socketId: string, stream: MediaStream }>;
      const { socketId, stream } = customEvent.detail;
      
      setRemoteStreams(prev => ({
        ...prev,
        [socketId]: stream
      }));
    };

    const handleMediaStateUpdate = (payload: any) => {
      const { socketId, type, payload: eventData } = payload;
      
      switch (type) {
        case 'camera:on':
          updateRemoteParticipant(socketId, { cameraEnabled: true });
          break;
        case 'camera:off':
          updateRemoteParticipant(socketId, { cameraEnabled: false });
          break;
        case 'screen:start':
          updateRemoteParticipant(socketId, { screenSharing: true });
          break;
        case 'screen:stop':
          updateRemoteParticipant(socketId, { screenSharing: false });
          break;
        case 'speaking':
          updateRemoteParticipant(socketId, { isSpeaking: eventData.isSpeaking });
          break;
        case 'quality':
          updateRemoteParticipant(socketId, { quality: eventData.quality });
          break;
      }
    };

    window.addEventListener('voice-remote-stream', handleRemoteStream);
    webrtc?.signaling.onMediaStateUpdate(handleMediaStateUpdate);

    return () => {
      window.removeEventListener('voice-remote-stream', handleRemoteStream);
      // NOTE: Should also clean up onMediaStateUpdate listener in SignalingClient in a real implementation
    };
  }, [webrtc, updateRemoteParticipant]);

  return {
    remoteMedia,
    remoteStreams
  };
}
