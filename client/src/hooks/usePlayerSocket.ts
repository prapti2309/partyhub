import { useEffect } from "react";
import { SOCKET_EVENTS } from "@/sockets/events";
import { usePlayerStore } from "@/stores/player.store";
import { socketManager } from "@/lib/socket/SocketManager";
import { useSocket } from "@/contexts/SocketContext";

export const usePlayerSocket = (roomId: string) => {
  const { socket } = useSocket();
  const syncState = usePlayerStore((state) => state.syncState);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleSync = (state: any) => {
      // Pass the full server state to the store; drift handling is delegated to the scheduler
      syncState(state);
    };

    socket.on(SOCKET_EVENTS.PLAYBACK_BROADCAST, handleSync);
    // No need for individual player events
    // socket.on("player:play", handleSync);
    // socket.on("player:pause", handleSync);
    // socket.on("player:seek", handleSync);
    // socket.on("player:sync", handleSync);

    // Initial sync using the new sync request
    socketManager.emitWithAck(SOCKET_EVENTS.PLAYBACK_SYNC, { roomId }).then((state) => {
      if (state) handleSync(state);
    }).catch(console.error);

    return () => {
      socket.off(SOCKET_EVENTS.PLAYBACK_BROADCAST, handleSync);
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
