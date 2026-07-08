import React, { useMemo } from 'react';
import { useRemoteMedia } from '../hooks/useRemoteMedia';
import { useLocalMedia } from '../hooks/useLocalMedia';
import { useMediaStore } from '../store/useMediaStore';
import { VideoTile } from './VideoTile';
import { useAuthStore } from '@/stores/auth.store'; // Assuming this exists to get local user info

export const VideoGrid: React.FC<{ roomId: string }> = ({ roomId }) => {
  const { remoteMedia, remoteStreams } = useRemoteMedia();
  const { localStream, cameraEnabled, micEnabled } = useLocalMedia(roomId);
  const { screenSharing } = useMediaStore();
  const { user } = useAuthStore();

  const participants = useMemo(() => {
    return Object.values(remoteMedia);
  }, [remoteMedia]);

  const totalTiles = participants.length + 1; // +1 for local

  // Simple layout calculator
  const gridClass = useMemo(() => {
    if (totalTiles === 1) return 'grid-cols-1';
    if (totalTiles === 2) return 'grid-cols-1 sm:grid-cols-2';
    if (totalTiles <= 4) return 'grid-cols-2';
    if (totalTiles <= 6) return 'grid-cols-2 md:grid-cols-3';
    if (totalTiles <= 9) return 'grid-cols-3';
    if (totalTiles <= 12) return 'grid-cols-3 md:grid-cols-4';
    return 'grid-cols-4 md:grid-cols-5';
  }, [totalTiles]);

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <div className={`grid gap-4 w-full h-full max-h-full ${gridClass} auto-rows-fr`}>
        
        {/* Local Tile */}
        <VideoTile 
          isLocal 
          stream={localStream} 
          username={user?.username || 'You'} 
          mediaState={{
            socketId: 'local',
            cameraEnabled,
            micEnabled,
            screenSharing,
            isSpeaking: false, // Could integrate local speaking detection
            quality: 'high'
          }}
        />

        {/* Remote Tiles */}
        {participants.map(p => (
          <VideoTile 
            key={p.socketId}
            stream={remoteStreams[p.socketId]}
            mediaState={p}
            username={`User ${p.socketId.substring(0, 4)}`} // Replace with real username if synced via presence
          />
        ))}

      </div>
    </div>
  );
};
