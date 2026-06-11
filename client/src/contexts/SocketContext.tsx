"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { useChatStore } from "../stores/chat.store";
import { usePlayerStore } from "../stores/player.store";
import { useRoomStore } from "../stores/room.store";
import { useVoiceStore } from "../stores/voice.store";
import { ChatMessage } from "../types";

interface SocketContextType {
  socket: any;
  isConnected: boolean;
  emitEvent: (event: string, data: any) => void;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState(false);

  // Get store actions to simulate server broadcasts
  const addMessage = useChatStore((state) => state.addMessage);
  const setTypist = useChatStore((state) => state.setTypist);
  const syncPlayer = usePlayerStore((state) => state.syncState);
  const toggleMuteMember = useRoomStore((state) => state.toggleMuteMember);
  const toggleCameraMember = useRoomStore((state) => state.toggleCameraMember);

  useEffect(() => {
    // Simulate initial socket connection delay
    const timer = setTimeout(() => {
      setIsConnected(true);
      console.log("🔌 [Socket.IO] Connected to namespace: /room");
    }, 500);

    return () => clearTimeout(timer);
  }, []);

  // Simple event listeners registry for client components to subscribe to
  const listeners: Record<string, ((...args: any[]) => void)[]> = {};

  const socket = {
    connected: isConnected,
    on: (event: string, callback: (...args: any[]) => void) => {
      if (!listeners[event]) listeners[event] = [];
      listeners[event].push(callback);
    },
    off: (event: string, callback?: (...args: any[]) => void) => {
      if (!listeners[event]) return;
      if (callback) {
        listeners[event] = listeners[event].filter((cb) => cb !== callback);
      } else {
        delete listeners[event];
      }
    },
  };

  const emitEvent = (event: string, payload: any) => {
    console.log(`📤 [Socket.IO] Client emitted event: "${event}"`, payload);

    // Simulate backend processing & broadcasting
    setTimeout(() => {
      switch (event) {
        case "join-room":
          console.log(`🔌 [Socket.IO] Server ACK: Joined room code ${payload.roomCode}`);
          break;

        case "leave-room":
          console.log(`🔌 [Socket.IO] Server ACK: Left room`);
          break;

        case "chat-message":
          // Server receives, saves to DB, then broadcasts new-message to all members in the room
          const mockMsg: ChatMessage = {
            id: "msg-socket-" + Math.random().toString(36).substring(2, 9),
            roomId: payload.roomId,
            userId: payload.userId || "user-current",
            username: payload.username || "Anonymous",
            avatarUrl: `https://api.dicebear.com/7.x/pixel-art/svg?seed=${payload.username}`,
            content: payload.content,
            pinned: false,
            createdAt: new Date().toISOString(),
            reactions: [],
          };

          // Broadcast to self (already handled locally, but in real WS we receive it back)
          // Also simulate responses from other mock users in the room
          if (
            payload.content.toLowerCase().includes("hello") ||
            payload.content.toLowerCase().includes("hey")
          ) {
            setTimeout(() => {
              const reply: ChatMessage = {
                id: "msg-reply-" + Math.random().toString(36).substring(2, 9),
                roomId: payload.roomId,
                userId: "user-2",
                username: "retro_coder",
                avatarUrl: "https://api.dicebear.com/7.x/pixel-art/svg?seed=retro",
                content: "Yo! Let's get the show started! 🍿",
                pinned: false,
                createdAt: new Date().toISOString(),
                reactions: [],
              };
              addMessage(reply);
            }, 1000);
          }
          break;

        case "typing-start":
          // Server broadcasts typing-update to all members
          setTypist(payload.username, true);
          break;

        case "typing-stop":
          setTypist(payload.username, false);
          break;

        case "play":
          // Server broadcasts 'play' event with position
          syncPlayer(payload.position, true, 1.0);
          console.log(`🎥 [Socket.IO] Playback Sync: PLAY at ${payload.position}s`);
          break;

        case "pause":
          // Server broadcasts 'pause'
          syncPlayer(payload.position, false, 1.0);
          console.log(`🎥 [Socket.IO] Playback Sync: PAUSE at ${payload.position}s`);
          break;

        case "seek":
          syncPlayer(payload.position, payload.isPlaying, 1.0);
          console.log(`🎥 [Socket.IO] Playback Sync: SEEK to ${payload.position}s`);
          break;

        case "voice-mute":
          toggleMuteMember(payload.userId);
          break;

        case "voice-camera":
          toggleCameraMember(payload.userId);
          break;

        default:
          break;
      }
    }, 150);
  };

  return (
    <SocketContext.Provider value={{ socket, isConnected, emitEvent }}>
      {children}
    </SocketContext.Provider>
  );
};

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within a SocketProvider");
  }
  return context;
};
