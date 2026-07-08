import { useCallback } from 'react';
import { mediaService } from '../services/MediaService';
import { useMediaStore } from '../store/useMediaStore';
import { useWebRTC } from '@/contexts/WebRTCContext';

export function useScreenShare(roomId: string) {
  const webrtc = useWebRTC();
  const { screenSharing, cameraEnabled, selectedCamera } = useMediaStore();

  const toggleScreenShare = useCallback(async () => {
    if (screenSharing) {
      mediaService.stopScreenShare();
      
      // If camera was previously enabled, restore it
      if (cameraEnabled) {
        const track = await mediaService.enableCamera(selectedCamera || undefined);
        if (track) {
          await webrtc?.replaceVideoTrack(track);
        }
      } else {
        await webrtc?.replaceVideoTrack(null);
      }
      
      await webrtc?.signaling.setScreenSharing({ roomId, enabled: false });
    } else {
      const track = await mediaService.startScreenShare();
      if (track) {
        await webrtc?.replaceVideoTrack(track);
        await webrtc?.signaling.setScreenSharing({ roomId, enabled: true });
        
        // Listen to native 'stop sharing' from browser bar
        track.onended = async () => {
           mediaService.stopScreenShare();
           if (cameraEnabled) {
              const camTrack = await mediaService.enableCamera(selectedCamera || undefined);
              if (camTrack) await webrtc?.replaceVideoTrack(camTrack);
           } else {
              await webrtc?.replaceVideoTrack(null);
           }
           await webrtc?.signaling.setScreenSharing({ roomId, enabled: false });
        };
      }
    }
  }, [screenSharing, cameraEnabled, selectedCamera, roomId, webrtc]);

  return {
    screenSharing,
    toggleScreenShare,
    displayStream: mediaService.getDisplayStream()
  };
}
