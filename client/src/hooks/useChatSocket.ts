import { useEffect, useCallback } from "react";
import { useSocket } from "@/contexts/SocketContext";
import { useChatStore } from "@/stores/chat.store";
import { socketManager } from "@/lib/socket/SocketManager";
import { useAuthStore } from "@/stores/auth.store";

export const useChatSocket = (roomId: string) => {
  const { socket } = useSocket();
  const addMessage = useChatStore((state) => state.addMessage);
  const setTypist = useChatStore((state) => state.setTypist);
  const user = useAuthStore((state) => state.user);

  useEffect(() => {
    if (!socket || !roomId) return;

    const handleMessage = (message: any) => {
      // Don't add if it's already in the store (e.g. from optimistic update if we implement one)
      addMessage({
        id: message.id,
        roomId: message.roomId,
        userId: message.senderId,
        username: message.sender.username,
        avatarUrl: message.sender.avatar || `https://api.dicebear.com/7.x/pixel-art/svg?seed=${message.sender.username}`,
        content: message.content,
        pinned: false,
        createdAt: message.createdAt,
        reactions: [],
      });
    };

    const handleTyping = (data: { userId: string; isTyping: boolean }) => {
      if (data.userId !== user?.id) {
        setTypist(data.userId, data.isTyping);
      }
    };

    socket.on("chat:message", handleMessage);
    socket.on("chat:typing", handleTyping);

    return () => {
      socket.off("chat:message", handleMessage);
      socket.off("chat:typing", handleTyping);
    };
  }, [socket, roomId, addMessage, setTypist, user]);

  const sendMessage = useCallback(async (content: string) => {
    try {
      await socketManager.emitWithAck("chat:send", { roomId, content });
    } catch (error) {
      console.error("Failed to send message:", error);
    }
  }, [roomId]);

  const setTyping = useCallback((isTyping: boolean) => {
    socketManager.emitWithAck("chat:typing", { roomId, isTyping }).catch(console.error);
  }, [roomId]);

  return { sendMessage, setTyping };
};
