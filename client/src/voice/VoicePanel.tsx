// src/voice/VoicePanel.tsx
import React from "react";
import { useVoice } from "../hooks/useVoice";
import { useWebRTC } from "../hooks/useWebRTC";
import { useToast } from "../components/ui/Toast";
import { Button } from "../components/ui/Button";
import { Avatar } from "../components/ui/Avatar";
import { Tooltip } from "../components/ui/Tooltip";
import { Mic, MicOff, Video, VideoOff, Share2, Volume2, VolumeX } from "lucide-react";
import { cn } from "../lib/utils";

/**
 * Minimal voice control panel displayed at the bottom of the room.
 * It provides buttons for joining/leaving voice, mute/unmute, deafen,
 * camera toggle, and screen‑share toggle, as well as a list of peer avatars.
 */
export default function VoicePanel() {
  const {
    isInVoiceChannel,
    isMuted,
    isDeafened,
    isCameraOn,
    isScreenSharing,
    voicePeers,
    toggleMute,
    toggleDeafen,
    toggleCamera,
    toggleScreenShare,
    clear,
  } = useVoice();
  const webrtc = useWebRTC();
  const { success } = useToast();

  const handleVoiceToggle = async () => {
    if (isInVoiceChannel) {
      webrtc.leaveVoiceChannel();
      clear();
      success("Left voice channel.", "Disconnected");
    } else {
      await webrtc.joinVoiceChannel();
      success("Joined voice channel.", "Connected");
    }
  };

  return (
    <div className="fixed bottom-0 left-0 right-0 bg-surface border-t border-border p-2 flex items-center justify-between z-20">
      {/* Join/Leave */}
      <Button
        variant={isInVoiceChannel ? "primary" : "secondary"}
        onClick={handleVoiceToggle}
        size="sm"
        className="flex items-center gap-1"
      >
        <Mic className="h-4 w-4" />
        {isInVoiceChannel ? "Connected" : "Join Voice"}
      </Button>

      {/* Controls when connected */}
      {isInVoiceChannel && (
        <div className="flex items-center gap-2">
          <Tooltip content={isMuted ? "Unmute Mic" : "Mute Mic"}>
            <Button variant="ghost" size="sm" onClick={toggleMute} className={cn("p-1.5", isMuted && "text-error bg-error/10")}>
              {isMuted ? <MicOff className="h-4 w-4" /> : <Mic className="h-4 w-4" />}
            </Button>
          </Tooltip>
          <Tooltip content={isDeafened ? "Undeafen" : "Deafen"}>
            <Button variant="ghost" size="sm" onClick={toggleDeafen} className={cn("p-1.5", isDeafened && "text-error bg-error/10")}>
              {isDeafened ? <VolumeX className="h-4 w-4" /> : <Volume2 className="h-4 w-4" />}
            </Button>
          </Tooltip>
          <Tooltip content={isCameraOn ? "Turn Camera Off" : "Turn Camera On"}>
            <Button variant="ghost" size="sm" onClick={() => { toggleCamera(); webrtc[isCameraOn ? "stopLocalVideo" : "startLocalVideo"](); }}
              className={cn("p-1.5", isCameraOn && "bg-primary/10")}
            >
              {isCameraOn ? <Video className="h-4 w-4" /> : <VideoOff className="h-4 w-4" />}
            </Button>
          </Tooltip>
          <Tooltip content={isScreenSharing ? "Stop Share" : "Share Screen"}>
            <Button variant="ghost" size="sm" onClick={() => { toggleScreenShare(); webrtc[isScreenSharing ? "stopScreenShare" : "startScreenShare"](); }}
              className={cn("p-1.5", isScreenSharing && "bg-primary/10")}
            >
              <Share2 className="h-4 w-4" />
            </Button>
          </Tooltip>
        </div>
      )}

      {/* Peer avatars */}
      <div className="flex -space-x-2">
        {voicePeers.map((p) => (
          <Tooltip key={p.socketId} content={p.username}>
            <Avatar fallback={p.username} src={p.avatarUrl} size="sm" className={cn(p.isMuted && "opacity-50")} />
          </Tooltip>
        ))}
      </div>
    </div>
  );
}
