import React, { useEffect, useRef } from 'react';
import { RemoteParticipantMedia } from '../store/useMediaStore';
import { Mic, MicOff, Video, VideoOff, MonitorUp } from 'lucide-react';

interface VideoTileProps {
  stream?: MediaStream | null;
  mediaState?: RemoteParticipantMedia; // Or local equivalent
  isLocal?: boolean;
  username?: string;
}

export const VideoTile: React.FC<VideoTileProps> = ({ stream, mediaState, isLocal, username = 'Participant' }) => {
  const videoRef = useRef<HTMLVideoElement>(null);

  useEffect(() => {
    if (videoRef.current && stream) {
      videoRef.current.srcObject = stream;
    }
  }, [stream]);

  const hasVideo = isLocal 
    ? (stream?.getVideoTracks().length ?? 0) > 0 
    : (mediaState?.cameraEnabled || mediaState?.screenSharing);

  const isMuted = isLocal 
    ? (stream?.getAudioTracks().find(t => !t.enabled) !== undefined) // This is a rough estimation for local
    : !mediaState?.micEnabled;

  const isSpeaking = mediaState?.isSpeaking;

  return (
    <div className={`relative flex flex-col items-center justify-center bg-gray-900 rounded-xl overflow-hidden aspect-video transition-all duration-300 ${isSpeaking ? 'ring-4 ring-primary-500' : 'ring-1 ring-gray-800'}`}>
      
      {hasVideo ? (
        <video 
          ref={videoRef}
          autoPlay 
          playsInline 
          muted={isLocal} 
          className={`w-full h-full object-cover ${isLocal && !mediaState?.screenSharing ? 'scale-x-[-1]' : ''}`} 
        />
      ) : (
        <div className="flex items-center justify-center w-24 h-24 bg-gray-700 rounded-full text-3xl font-bold text-white uppercase shadow-lg">
          {username.substring(0, 2)}
        </div>
      )}

      {/* Badges Overlay */}
      <div className="absolute bottom-3 left-3 flex items-center space-x-2 bg-black/60 backdrop-blur-md px-3 py-1.5 rounded-full">
        <span className="text-white text-sm font-medium truncate max-w-[120px]">
          {username} {isLocal ? '(You)' : ''}
        </span>
        
        <div className="flex items-center space-x-1.5 border-l border-gray-600 pl-2 ml-2">
          {isMuted ? (
            <MicOff className="w-4 h-4 text-red-400" />
          ) : (
             <Mic className={`w-4 h-4 ${isSpeaking ? 'text-green-400' : 'text-gray-300'}`} />
          )}

          {!hasVideo && <VideoOff className="w-4 h-4 text-red-400" />}
          
          {mediaState?.screenSharing && (
            <MonitorUp className="w-4 h-4 text-blue-400" />
          )}
        </div>
      </div>
    </div>
  );
};
