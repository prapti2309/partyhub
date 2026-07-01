import { useEffect } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { useRoomStore } from "@/stores/room.store";

export const usePresence = (roomId: string) => {
  const { socket } = useSocket();
  const updateParticipantStatus = useRoomStore((state) => state.updateParticipantStatus);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleOffline = (data: { userId: string }) => {
      updateParticipantStatus(data.userId, false);
    };

    socket.on("room:participant_offline", handleOffline);

    return () => {
      socket.off("room:participant_offline", handleOffline);
    };
  }, [socket, roomId, updateParticipantStatus]);
};
