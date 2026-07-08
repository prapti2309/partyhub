"use client";

import React, { useEffect, useState, useRef } from "react";
import { useParams, useRouter } from "next/navigation";
import Link from "next/link";
import { useAuthStore } from "../../../stores/auth.store";
import { useRoomStore } from "../../../stores/room.store";
import { useChatStore } from "../../../stores/chat.store";
import { usePlayerStore } from "../../../stores/player.store";
import { useVoiceStore } from "../../../stores/voice.store";
import { useWebRTC } from "../../../hooks/useWebRTC";
import { VoiceProvider } from "../../../voice/VoiceProvider";
import { useRoomSocket } from "../../../hooks/useRoomSocket";
import { useChatSocket } from "../../../hooks/useChatSocket";
import { usePlayerSocket } from "../../../hooks/usePlayerSocket";
import { usePresence } from "../../../hooks/usePresence";
import { useSocket } from "../../../contexts/SocketContext";
import { RoomMember } from "../../../types";
import { VideoGrid } from "../../../features/media/components/VideoGrid";
import { MediaToolbar } from "../../../features/media/components/MediaToolbar";
import {
  Play,
  Pause,
  Volume2,
  Settings,
  Share2,
  MessageSquare,
  Users as UsersIcon,
  Mic,
  MicOff,
  VolumeX,
  Video as VideoIcon,
  VideoOff,
  Tv,
  ArrowLeft,
  Send,
  Smile,
  LogOut,
  UserPlus,
  Shield,
  Zap,
  Lock,
  Crown,
  Film,
} from "lucide-react";
import { Button } from "../../../components/ui/Button";
import { Card } from "../../../components/ui/Card";
import { Avatar } from "../../../components/ui/Avatar";
import { Badge } from "../../../components/ui/Badge";
import { Drawer } from "../../../components/ui/Drawer";
import { Tooltip } from "../../../components/ui/Tooltip";
import { useToast } from "../../../components/ui/Toast";
import { cn } from "../../../lib/utils";

export default function RoomPage() {
  const router = useRouter();
  const params = useParams();
  const code = (params?.code as string)?.toUpperCase() || "";

  const { success, error: toastError } = useToast();

  // Custom stores & contexts
  const { user, isAuthenticated } = useAuthStore();
  const { activeRoom, joinRoom, leaveRoom, updateSettings, kickMember } = useRoomStore();
  const { messages, typists, sendMessage, addReaction } = useChatStore();

  const player = usePlayerStore();
  const voice = useVoiceStore();
  const webrtc = useWebRTC();
  const { joinRoom, leaveRoom } = useRoomSocket(activeRoom?.id || "");
  const { sendMessage, setTyping } = useChatSocket(activeRoom?.id || "");
  const { emitPlay, emitPause, emitSeek } = usePlayerSocket(activeRoom?.id || "");
  usePresence(activeRoom?.id || "");
  
  const { emitEvent } = useSocket();

  // Component UI States
  const [chatInput, setChatInput] = useState("");
  const [showInviteModal, setShowInviteModal] = useState(false);
  const [mobileChatOpen, setMobileChatOpen] = useState(false);
  const [mobileMembersOpen, setMobileMembersOpen] = useState(false);

  const chatBottomRef = useRef<HTMLDivElement>(null);
  const iframeRef = useRef<HTMLIFrameElement>(null);
  const typingTimeoutRef = useRef<NodeJS.Timeout | null>(null);

  // Guard routing
  useEffect(() => {
    if (!isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, router]);

  // Join Room simulation on mount
  useEffect(() => {
    if (isAuthenticated && user && code && (!activeRoom || activeRoom.code !== code)) {
      joinRoom(code, user.username).catch(() => {
        toastError("Failed to access watch room.", "Connection Error");
        router.push("/dashboard");
      });
    }

    return () => {
      // Clean up room on leave
      if (activeRoom) {
        leaveRoom();
      }
    };
  }, [code, isAuthenticated, user, joinRoom, leaveRoom, router, activeRoom, toastError]);

  // Scroll chat to bottom when new messages arrive
  useEffect(() => {
    chatBottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  if (!isAuthenticated || !user || !activeRoom) {
    return (
      <div className="flex h-screen items-center justify-center bg-background text-text-secondary gap-3">
        <span className="animate-spin rounded-full border-2 border-primary border-t-transparent h-6 w-6" />
        <span className="text-sm font-semibold">Connecting to Room Server...</span>
      </div>
    );
  }

  const isOwner = activeRoom.ownerId === user.id;

  // Handle Play/Pause
  const handlePlayToggle = () => {
    if (!isOwner && !activeRoom.settings.sharedControls) {
      toastError("Only the room host can control video playback.", "Permission Denied");
      return;
    }

    if (player.isPlaying) {
      emitPause(player.position);
    } else {
      emitPlay(player.position);
    }
  };

  // Handle Seek slider
  const handleSeek = (e: React.ChangeEvent<HTMLInputElement>) => {
    if (!isOwner && !activeRoom.settings.sharedControls) {
      return;
    }
    const val = parseFloat(e.target.value);
    emitSeek(val);
  };

  // Chat message send
  const handleSendChat = (e: React.FormEvent) => {
    e.preventDefault();
    if (!chatInput.trim()) return;

    sendMessage(chatInput.trim());
    setChatInput("");

    // Stop typing immediately
    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }
    setTyping(false);
  };

  // Chat typing handler
  const handleChatInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setChatInput(e.target.value);

    // Notify typing started
    setTyping(true);

    if (typingTimeoutRef.current) {
      clearTimeout(typingTimeoutRef.current);
    }

    // Stop typing timeout
    typingTimeoutRef.current = setTimeout(() => {
      setTyping(false);
    }, 2000);
  };

  // Copy invitation link
  const handleCopyLink = () => {
    const link = `${window.location.origin}/room/${activeRoom.code}`;
    void navigator.clipboard.writeText(link);
    success(`Share link copied to clipboard: ${link}`, "Invite Link Copied");
  };

  // Audio Voice toggles
  const handleVoiceToggle = async () => {
    if (voice.isInVoiceChannel) {
      webrtc.leaveVoiceChannel();
      success("Left voice channel.", "Disconnected");
    } else {
      await webrtc.joinVoiceChannel();
      success("Joined voice channel. Mic is active.", "Connected");
    }
  };

  const handleMuteToggle = () => {
    voice.toggleMute();
    emitEvent("voice-mute", { userId: user.id });
  };

  const handleCameraToggle = async () => {
    if (!voice.isCameraOn) {
      await webrtc.startLocalVideo();
    } else {
      webrtc.stopLocalVideo();
    }
    voice.toggleCamera();
    emitEvent("voice-camera", { userId: user.id });
  };

  const handleScreenShareToggle = async () => {
    if (!voice.isScreenSharing) {
      await webrtc.startScreenShare();
    } else {
      webrtc.stopScreenShare();
    }
    voice.toggleScreenShare();
  };

  return (
    <VoiceProvider>
      <div className="flex flex-col h-screen bg-[#0A0A12] text-text-primary overflow-hidden font-sans">
      {/* 1. ROOM NAVBAR */}
      <nav className="h-14 border-b border-border bg-surface px-4 flex items-center justify-between z-10">
        <div className="flex items-center gap-3.5">
          <Link
            href="/dashboard"
            className="p-1 rounded hover:bg-panel text-text-secondary hover:text-text-primary transition-colors"
          >
            <ArrowLeft className="h-5 w-5" />
          </Link>
          <div className="flex items-center gap-2">
            <Film className="h-4.5 w-4.5 text-primary" />
            <span className="font-bold text-sm truncate max-w-[150px] sm:max-w-xs">
              {activeRoom.name}
            </span>
            <Badge variant="primary" className="font-mono text-[10px] bg-primary/20 tracking-wider">
              {activeRoom.code}
            </Badge>
          </div>
        </div>

        <div className="flex items-center gap-2">
          {/* Settings Toggles for Owner */}
          {isOwner && (
            <Tooltip content="Room Settings">
              <Button
                variant="ghost"
                size="sm"
                className="p-2 rounded hover:bg-panel text-text-secondary hover:text-text-primary cursor-pointer"
                onClick={() => {
                  const currentShared = activeRoom.settings.sharedControls;
                  updateSettings({ sharedControls: !currentShared });
                  success(`Playback control settings updated.`, "Settings Saved");
                }}
              >
                <Settings className="h-4.5 w-4.5" />
              </Button>
            </Tooltip>
          )}

          {/* Share Invitation */}
          <Button
            variant="secondary"
            size="sm"
            onClick={handleCopyLink}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs border-border/80 hover:bg-panel cursor-pointer"
          >
            <Share2 className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Invite Friends</span>
          </Button>

          {/* Mobile Overlay triggers */}
          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileChatOpen(true)}
            className="flex lg:hidden p-2 text-text-secondary hover:text-text-primary"
          >
            <MessageSquare className="h-5 w-5" />
          </Button>

          <Button
            variant="ghost"
            size="sm"
            onClick={() => setMobileMembersOpen(true)}
            className="flex lg:hidden p-2 text-text-secondary hover:text-text-primary"
          >
            <UsersIcon className="h-5 w-5" />
          </Button>

          <Button
            variant="danger"
            size="sm"
            onClick={() => router.push("/dashboard")}
            className="flex items-center gap-1.5 px-3 py-1.5 text-xs cursor-pointer"
          >
            <LogOut className="h-3.5 w-3.5" />
            <span className="hidden sm:inline">Leave Room</span>
          </Button>
        </div>
      </nav>

      {/* 2. MAIN SPLIT BODY CONTAINER */}
      <div className="flex-1 flex flex-col lg:flex-row overflow-hidden relative">
        {/* LEFT COLUMN PANEL: Video Player, WebRTC Overlays, controls */}
        <div className="flex-1 flex flex-col overflow-y-auto no-scrollbar bg-black/40 border-r border-border/40 justify-between">
          {/* Main Theater Area */}
          <div className="flex-1 w-full max-w-5xl mx-auto p-4 flex flex-col justify-center gap-4">
            {/* 16:9 Video Box */}
            <div className="w-full aspect-video bg-[#050508] border border-border/60 rounded-xl overflow-hidden shadow-2xl relative group">
              {player.videoUrl ? (
                <iframe
                  ref={iframeRef}
                  src={`${player.videoUrl}?enablejsapi=1&controls=0&autoplay=0`}
                  title={player.videoTitle}
                  className="h-full w-full pointer-events-none"
                  allow="autoplay; encrypted-media"
                />
              ) : (
                <div className="h-full w-full flex items-center justify-center text-text-secondary flex-col gap-3">
                  <Tv className="h-12 w-12 text-border" />
                  <span className="text-sm">No video file loaded in player.</span>
                </div>
              )}

              {/* Synchronized indicator */}
              <Badge
                variant="primary"
                className="absolute top-4 left-4 font-mono text-[10px] flex items-center gap-1.5 glass bg-primary/20 border-primary/45 shadow select-none animate-pulse"
              >
                <Zap className="h-3.5 w-3.5 text-primary fill-primary" />
                <span>SYNCED</span>
              </Badge>

              {/* Video control overlay HUD (only reveals controls if owner or sharedControls) */}
              <div className="absolute inset-0 bg-gradient-to-t from-black/85 via-transparent to-black/30 opacity-0 group-hover:opacity-100 transition-opacity flex flex-col justify-between p-4 duration-300">
                <div className="flex justify-between items-start text-xs font-semibold">
                  <span className="bg-black/40 px-2.5 py-1 rounded backdrop-blur">
                    {player.videoTitle || "Unnamed Video"}
                  </span>
                </div>

                <div className="flex flex-col gap-3">
                  {/* Slider bar */}
                  <input
                    type="range"
                    min="0"
                    max="300"
                    step="1"
                    value={player.position}
                    onChange={handleSeek}
                    disabled={!isOwner && !activeRoom.settings.sharedControls}
                    className="w-full h-1 bg-zinc-700/80 rounded-full appearance-none cursor-pointer accent-primary"
                  />

                  {/* Player controls */}
                  <div className="flex items-center justify-between">
                    <div className="flex items-center gap-4">
                      <button
                        onClick={handlePlayToggle}
                        className="p-2 rounded bg-primary text-white hover:bg-primary-hover shadow cursor-pointer focus:outline-none transition-colors"
                      >
                        {player.isPlaying ? (
                          <Pause className="h-4.5 w-4.5 fill-white" />
                        ) : (
                          <Play className="h-4.5 w-4.5 fill-white translate-x-0.5" />
                        )}
                      </button>

                      <span className="text-xs text-zinc-300">
                        {Math.floor(player.position / 60)}:
                        {String(Math.floor(player.position % 60)).padStart(2, "0")} / 05:00
                      </span>
                    </div>

                    <div className="flex items-center gap-3">
                      {/* Playback speed selector */}
                      <select
                        value={player.speed}
                        onChange={(e) => {
                          const speed = parseFloat(e.target.value);
                          player.setSpeed(speed);
                          success(`Playback speed modified to ${speed}x`, "Speed Updated");
                        }}
                        disabled={!isOwner && !activeRoom.settings.sharedControls}
                        className="bg-black/50 border border-border text-xs text-zinc-300 rounded px-2 py-1 focus:outline-none"
                      >
                        <option value="0.75">0.75x</option>
                        <option value="1">1.0x (Normal)</option>
                        <option value="1.25">1.25x</option>
                        <option value="1.5">1.5x</option>
                        <option value="2">2.0x</option>
                      </select>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* VideoGrid Component handles all webcam grids */}
            <div className="flex-1 mt-2 border border-border/40 rounded-xl overflow-hidden bg-black/50">
              <VideoGrid roomId={code} />
            </div>
          </div>

          {/* Media Toolbar replaces old Voice Bar */}
          <MediaToolbar roomId={code} />
        </div>

        {/* RIGHT COLUMN PANEL: Chat and presence */}
        <aside className="hidden lg:flex w-80 bg-surface border-l border-border flex-col justify-between">
          <PresenceSidebar roomId={code} />
          <ChatPanel roomId={code} />
        </aside>
        </div>

      {/* 3. MOBILE OVERLAYS: Drawer panels */}
      <Drawer
        isOpen={mobileChatOpen}
        onClose={() => setMobileChatOpen(false)}
        title="Live Chat Stream"
        side="right"
      >
        <div className="flex flex-col h-[70vh] justify-between">
          <div className="flex-1 overflow-y-auto no-scrollbar flex flex-col gap-4 py-4 pr-1">
            {messages.map((msg) => (
              <div key={msg.id} className="flex items-start gap-2.5">
                <Avatar src={msg.avatarUrl} fallback={msg.username} size="xs" />
                <div className="flex flex-col min-w-0 flex-1 bg-panel/30 border border-border/40 p-2 rounded-lg">
                  <div className="flex items-center gap-2 mb-0.5">
                    <span className="text-xs font-semibold text-text-primary truncate">
                      {msg.username}
                    </span>
                    <span className="text-[9px] text-text-secondary">
                      {new Date(msg.createdAt).toLocaleTimeString()}
                    </span>
                  </div>
                  <p className="text-xs text-text-secondary leading-normal break-words">
                    {msg.content}
                  </p>
                </div>
              </div>
            ))}
          </div>

          <div className="pt-4 border-t border-border">
            <form
              onSubmit={handleSendChat}
              className="flex items-center gap-2 bg-surface border border-border rounded-lg px-3 py-2"
            >
              <input
                type="text"
                placeholder="Message in room..."
                value={chatInput}
                onChange={handleChatInputChange}
                className="bg-transparent text-xs text-text-primary focus:outline-none flex-1"
              />
              <button type="submit" className="text-primary p-1">
                <Send className="h-4 w-4" />
              </button>
            </form>
          </div>
        </div>
      </Drawer>

      <Drawer
        isOpen={mobileMembersOpen}
        onClose={() => setMobileMembersOpen(false)}
        title="Room Members"
        side="right"
      >
        <div className="flex flex-col gap-3.5 py-4">
          {activeRoom.members.map((member: RoomMember) => (
            <div key={member.userId} className="flex items-center justify-between">
              <div className="flex items-center gap-2.5">
                <Avatar
                  fallback={member.username}
                  src={member.avatarUrl}
                  status={member.speaking ? "online" : "offline"}
                  size="xs"
                />
                <span className="text-sm font-semibold truncate">{member.username}</span>
                {member.role === "OWNER" && (
                  <Crown className="h-3.5 w-3.5 text-warning fill-warning" />
                )}
              </div>

              {member.role !== "OWNER" && isOwner && (
                <button
                  onClick={() => {
                    kickMember(member.userId);
                    success(`Kicked user ${member.username} from room.`, "User Removed");
                  }}
                  className="text-xs text-error hover:underline"
                >
                  Kick
                </button>
              )}
            </div>
          ))}
        </div>
      </Drawer>
      </div>
    </VoiceProvider>
  );
}
