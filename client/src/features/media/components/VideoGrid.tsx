import React, { useMemo } from "react";
import { useRemoteMedia } from "../hooks/useRemoteMedia";
import { useLocalMedia } from "../hooks/useLocalMedia";
import { useMediaStore } from "../store/useMediaStore";
import { VideoTile } from "./VideoTile";
import { useAuthStore } from "@/stores/auth.store";
import { useRoomStore } from "@/stores/room.store";
import { usePresenceStore } from "@/stores/presence.store";

export const VideoGrid: React.FC<{ roomId: string }> = ({ roomId }) => {
  const { remoteMedia, remoteStreams } = useRemoteMedia();
  const { localStream, cameraEnabled, micEnabled } = useLocalMedia(roomId);
  const { screenSharing } = useMediaStore();
  const { user } = useAuthStore();
  const activeRoom = useRoomStore((state) => state.activeRoom);
  const presenceParticipants = usePresenceStore((state) => state.participants);

  // Compute all unique remote participants from room store, presence, and remote media
  const remoteParticipants = useMemo(() => {
    const map = new Map<
      string,
      {
        userId: string;
        username: string;
        avatarUrl?: string;
        socketId?: string;
        mediaState?: any;
        stream?: MediaStream | null;
      }
    >();

    // 1. Room members from active room
    if (activeRoom?.members) {
      for (const m of activeRoom.members) {
        if (m.userId !== user?.id) {
          map.set(m.userId, {
            userId: m.userId,
            username: m.username || "Member",
            avatarUrl: m.avatarUrl,
          });
        }
      }
    }

    // 2. Presence store participants
    for (const p of Object.values(presenceParticipants)) {
      if (p.userId !== user?.id) {
        const existing = map.get(p.userId) || {
          userId: p.userId,
          username: p.username || "Member",
        };
        map.set(p.userId, {
          ...existing,
          username: p.username || existing.username,
          avatarUrl: p.avatar || existing.avatarUrl,
        });
      }
    }

    // 3. Remote media streams (WebRTC)
    for (const media of Object.values(remoteMedia)) {
      let foundKey = "";
      for (const [key, val] of Array.from(map.entries())) {
        if (val.socketId === media.socketId) {
          foundKey = key;
          break;
        }
      }
      if (foundKey) {
        const existing = map.get(foundKey)!;
        map.set(foundKey, {
          ...existing,
          socketId: media.socketId,
          mediaState: media,
          stream: remoteStreams[media.socketId] || null,
        });
      } else {
        map.set(media.socketId, {
          userId: media.socketId,
          username: `User ${media.socketId.substring(0, 4)}`,
          socketId: media.socketId,
          mediaState: media,
          stream: remoteStreams[media.socketId] || null,
        });
      }
    }

    return Array.from(map.values());
  }, [activeRoom, presenceParticipants, remoteMedia, remoteStreams, user?.id]);

  const totalTiles = remoteParticipants.length + 1; // +1 for local

  // Simple layout calculator
  const gridClass = useMemo(() => {
    if (totalTiles === 1) return "grid-cols-1";
    if (totalTiles === 2) return "grid-cols-1 sm:grid-cols-2";
    if (totalTiles <= 4) return "grid-cols-2";
    if (totalTiles <= 6) return "grid-cols-2 md:grid-cols-3";
    if (totalTiles <= 9) return "grid-cols-3";
    return "grid-cols-3 md:grid-cols-4";
  }, [totalTiles]);

  return (
    <div className="w-full h-full p-4 overflow-y-auto">
      <div className={`grid gap-4 w-full h-full max-h-full ${gridClass} auto-rows-fr`}>
        {/* Local Tile */}
        <VideoTile
          isLocal
          stream={localStream}
          username={user?.username || "You"}
          mediaState={{
            socketId: "local",
            cameraEnabled,
            micEnabled,
            screenSharing,
            isSpeaking: false,
            quality: "high",
          }}
        />

        {/* Remote Tiles */}
        {remoteParticipants.map((p) => (
          <VideoTile
            key={p.userId || p.socketId}
            stream={p.stream}
            mediaState={p.mediaState}
            username={p.username}
          />
        ))}
      </div>
    </div>
  );
};
