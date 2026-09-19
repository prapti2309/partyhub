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

    // Automatically join room channel via socket when entering room
    socketManager
      .emitWithAck("room:join", {
        roomId,
        roomCode: useRoomStore.getState().activeRoom?.code || roomId,
      })
      .catch(() => {});

    socket.on("room:participant_joined", (data) => {
      addParticipant({
        userId: data.userId,
        username: data.username,
        avatarUrl: data.avatar,
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
      socketManager.emitWithAck("room:leave", { roomId }).catch(() => {});
    };
  }, [socket, roomId, addParticipant, removeParticipant]);

  const joinRoom = async (roomCode: string, username?: string, password?: string) => {
    const response = await socketManager.emitWithAck("room:join", {
      roomId: roomCode,
      roomCode,
      username,
      password,
    });
    if (response?.room) {
      setRoomData(response.room);
    }
    return response;
  };

  const leaveRoom = async () => {
    if (roomId) {
      await socketManager.emitWithAck("room:leave", { roomId }).catch(() => {});
      useRoomStore.getState().clearRoom();
    }
  };

  return { joinRoom, leaveRoom };
};
