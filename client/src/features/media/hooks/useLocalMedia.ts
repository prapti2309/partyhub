import { useEffect, useCallback } from 'react';
import { mediaService } from '../services/MediaService';
import { useMediaStore } from '../store/useMediaStore';
import { useWebRTC } from '@/contexts/WebRTCContext'; // Assuming context exposes webrtc instance

export function useLocalMedia(roomId: string) {
  const webrtc = useWebRTC();
  const { 
    cameraEnabled, 
    micEnabled, 
    selectedCamera, 
    selectedMicrophone 
  } = useMediaStore();

  useEffect(() => {
    mediaService.enumerateDevices();
  }, []);

  const toggleCamera = useCallback(async () => {
    if (cameraEnabled) {
      mediaService.disableCamera();
      await webrtc?.replaceVideoTrack(null);
      await webrtc?.signaling.setCamera({ roomId, enabled: false });
    } else {
      const track = await mediaService.enableCamera(selectedCamera || undefined);
      if (track) {
        await webrtc?.replaceVideoTrack(track);
        await webrtc?.signaling.setCamera({ roomId, enabled: true });
      }
    }
  }, [cameraEnabled, selectedCamera, roomId, webrtc]);

  const toggleMicrophone = useCallback(async () => {
    if (micEnabled) {
      mediaService.disableMicrophone();
      await webrtc?.setMute(roomId, true); // Use existing mute functionality
    } else {
      const track = await mediaService.enableMicrophone(selectedMicrophone || undefined);
      if (track) {
        await webrtc?.replaceAudioTrack(track);
        await webrtc?.setMute(roomId, false);
      }
    }
  }, [micEnabled, selectedMicrophone, roomId, webrtc]);

  return {
    cameraEnabled,
    micEnabled,
    toggleCamera,
    toggleMicrophone,
    localStream: mediaService.getLocalStream()
  };
}
