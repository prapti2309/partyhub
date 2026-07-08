import React from 'react';
import { useLocalMedia } from '../hooks/useLocalMedia';
import { useScreenShare } from '../hooks/useScreenShare';
import { Mic, MicOff, Video, VideoOff, MonitorUp, MonitorOff, Settings, LogOut } from 'lucide-react';
import { useRouter } from 'next/navigation';

export const MediaToolbar: React.FC<{ roomId: string }> = ({ roomId }) => {
  const { cameraEnabled, micEnabled, toggleCamera, toggleMicrophone } = useLocalMedia(roomId);
  const { screenSharing, toggleScreenShare } = useScreenShare(roomId);
  const router = useRouter();

  const handleLeave = () => {
    // You would typically call your roomService leave here, then route away
    router.push('/');
  };

  return (
    <div className="flex items-center justify-center w-full p-4 bg-gray-900 border-t border-gray-800">
      <div className="flex items-center space-x-4 bg-gray-800 rounded-full px-6 py-3 shadow-xl">
        
        {/* Mic Toggle */}
        <button 
          onClick={toggleMicrophone}
          className={`p-3 rounded-full transition-colors ${micEnabled ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500/20 hover:bg-red-500/30 text-red-500'}`}
          title={micEnabled ? 'Mute' : 'Unmute'}
        >
          {micEnabled ? <Mic className="w-6 h-6" /> : <MicOff className="w-6 h-6" />}
        </button>

        {/* Camera Toggle */}
        <button 
          onClick={toggleCamera}
          className={`p-3 rounded-full transition-colors ${cameraEnabled ? 'bg-gray-700 hover:bg-gray-600 text-white' : 'bg-red-500/20 hover:bg-red-500/30 text-red-500'}`}
          title={cameraEnabled ? 'Turn off camera' : 'Turn on camera'}
        >
          {cameraEnabled ? <Video className="w-6 h-6" /> : <VideoOff className="w-6 h-6" />}
        </button>

        {/* Screen Share Toggle */}
        <button 
          onClick={toggleScreenShare}
          className={`p-3 rounded-full transition-colors ${screenSharing ? 'bg-blue-500 hover:bg-blue-600 text-white' : 'bg-gray-700 hover:bg-gray-600 text-gray-300'}`}
          title={screenSharing ? 'Stop sharing' : 'Share screen'}
        >
          {screenSharing ? <MonitorOff className="w-6 h-6" /> : <MonitorUp className="w-6 h-6" />}
        </button>

        <div className="w-px h-8 bg-gray-600 mx-2" />

        {/* Settings (Placeholder) */}
        <button 
          className="p-3 rounded-full bg-gray-700 hover:bg-gray-600 text-gray-300 transition-colors"
          title="Settings"
        >
          <Settings className="w-6 h-6" />
        </button>

        {/* Leave Room */}
        <button 
          onClick={handleLeave}
          className="p-3 rounded-full bg-red-600 hover:bg-red-700 text-white transition-colors"
          title="Leave Room"
        >
          <LogOut className="w-6 h-6" />
        </button>

      </div>
    </div>
  );
};
