"use client";

import { useSocket as useSocketContext } from "../contexts/SocketContext";

export const useSocket = () => {
  const { socket, isConnected, emitEvent } = useSocketContext();

  const joinRoom = (roomCode: string, username: string) => {
    emitEvent("join-room", { roomCode, username });
  };

  const leaveRoom = (roomId: string) => {
    emitEvent("leave-room", { roomId });
  };

  const sendChatMessage = (roomId: string, content: string, username: string, userId: string) => {
    emitEvent("chat-message", { roomId, content, username, userId });
  };

  const sendTypingStart = (roomId: string, username: string) => {
    emitEvent("typing-start", { roomId, username });
  };

  const sendTypingStop = (roomId: string, username: string) => {
    emitEvent("typing-stop", { roomId, username });
  };

  const sendPlay = (roomId: string, position: number) => {
    emitEvent("play", { roomId, position });
  };

  const sendPause = (roomId: string, position: number) => {
    emitEvent("pause", { roomId, position });
  };

  const sendSeek = (roomId: string, position: number, isPlaying: boolean) => {
    emitEvent("seek", { roomId, position, isPlaying });
  };

  return {
    socket,
    isConnected,
    joinRoom,
    leaveRoom,
    sendChatMessage,
    sendTypingStart,
    sendTypingStop,
    sendPlay,
    sendPause,
    sendSeek,
    emitEvent,
  };
};
