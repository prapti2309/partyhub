import { useEffect } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { usePlayerStore } from "@/stores/player.store";
import { socketManager } from "@/lib/socket/SocketManager";

export const usePlayerSocket = (roomId: string) => {
  const { socket } = useSocket();
  const syncState = usePlayerStore((state) => state.syncState);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleSync = (state: any) => {
      // Calculate drift: Actual Position = Server Position + (Current Time - Server Timestamp)
      const timeDiff = (Date.now() - state.serverTimestamp) / 1000;
      const actualPosition = state.playing ? state.position + timeDiff : state.position;
      
      syncState(actualPosition, state.playing, state.playbackRate);
    };

    socket.on("player:play", handleSync);
    socket.on("player:pause", handleSync);
    socket.on("player:seek", handleSync);
    socket.on("player:sync", handleSync);

    // Initial sync
    socketManager.emitWithAck("player:sync", { roomId }).then((state) => {
      if (state) handleSync(state);
    }).catch(console.error);

    return () => {
      socket.off("player:play", handleSync);
      socket.off("player:pause", handleSync);
      socket.off("player:seek", handleSync);
      socket.off("player:sync", handleSync);
    };
  }, [socket, roomId, syncState]);

  const emitPlay = async (position: number) => {
    await socketManager.emitWithAck("player:play", { roomId, timestamp: position });
  };

  const emitPause = async (position: number) => {
    await socketManager.emitWithAck("player:pause", { roomId, timestamp: position });
  };

  const emitSeek = async (position: number) => {
    await socketManager.emitWithAck("player:seek", { roomId, timestamp: position });
  };

  return { emitPlay, emitPause, emitSeek };
};
