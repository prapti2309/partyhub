import { useEffect } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { useRoomStore } from "@/stores/room.store";
import { socketManager } from "@/lib/socket/SocketManager";

export const useRoomSocket = (roomId: string) => {
  const { socket } = useSocket();
  const setRoomData = useRoomStore((state) => state.setRoomData);
  const addParticipant = useRoomStore((state) => state.addParticipant);
  const removeParticipant = useRoomStore((state) => state.removeParticipant);

  useEffect(() => {
    if (!socket || !roomId) return;

    socket.on("room:participant_joined", (data) => {
      addParticipant({
        userId: data.userId,
        username: data.username,
        avatar: data.avatar,
        role: "PARTICIPANT",
        isOnline: true,
      });
    });

    socket.on("room:participant_left", (data) => {
      removeParticipant(data.userId);
    });

    socket.on("room:ownership_transferred", (data) => {
      // update local state for ownership
      useRoomStore.getState().updateRoomOwner(data.newOwnerId);
    });

    return () => {
      socket.off("room:participant_joined");
      socket.off("room:participant_left");
      socket.off("room:ownership_transferred");
    };
  }, [socket, roomId, addParticipant, removeParticipant]);

  const joinRoom = async (roomCode: string, username?: string) => {
    const response = await socketManager.emitWithAck("room:join", { roomCode, username });
    setRoomData(response.room);
    return response;
  };

  const leaveRoom = async () => {
    if (roomId) {
      await socketManager.emitWithAck("room:leave", { roomId });
      useRoomStore.getState().clearRoom();
    }
  };

  return { joinRoom, leaveRoom };
};
