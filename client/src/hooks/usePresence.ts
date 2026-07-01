// src/hooks/usePresence.ts
import { useEffect } from 'react';
import { socketManager } from '@/lib/socket/SocketManager';
import { SOCKET_EVENTS } from '@/sockets/events';
import { usePresenceStore, PresenceStatus } from '@/stores/presence.store';
import { ParticipantInfo } from '@/stores/presence.store';

export const usePresence = (roomId: string) => {
  const updateParticipant = usePresenceStore((s) => s.updateParticipant);
  const removeParticipant = usePresenceStore((s) => s.removeParticipant);
  const setTyping = usePresenceStore((s) => s.setTyping);

  useEffect(() => {
    const socket = socketManager.getSocket();
    if (!socket) return;

    const onJoin = (payload: ParticipantInfo) => {
      if (payload.userId) updateParticipant({ ...payload, status: 'online' });
    };
    const onLeave = (payload: { userId: string }) => {
      removeParticipant(payload.userId);
    };
    const onStatus = (payload: { userId: string; status: PresenceStatus }) => {
      updateParticipant({ userId: payload.userId, status: payload.status, lastSeen: Date.now() } as any);
    };
    const onTypingStart = (payload: { userId: string }) => {
      setTyping(payload.userId, true);
    };
    const onTypingStop = (payload: { userId: string }) => {
      setTyping(payload.userId, false);
    };

    socket.on(SOCKET_EVENTS.PRESENCE_JOIN, onJoin);
    socket.on(SOCKET_EVENTS.PRESENCE_LEAVE, onLeave);
    socket.on(SOCKET_EVENTS.PRESENCE_STATUS_UPDATE, onStatus);
    socket.on(SOCKET_EVENTS.PRESENCE_TYPING_START, onTypingStart);
    socket.on(SOCKET_EVENTS.PRESENCE_TYPING_STOP, onTypingStop);

    // Request initial presence snapshot (optional server implementation)
    socket.emit(SOCKET_EVENTS.PRESENCE_SNAPSHOT_REQUEST, { roomId });

    return () => {
      socket.off(SOCKET_EVENTS.PRESENCE_JOIN, onJoin);
      socket.off(SOCKET_EVENTS.PRESENCE_LEAVE, onLeave);
      socket.off(SOCKET_EVENTS.PRESENCE_STATUS_UPDATE, onStatus);
      socket.off(SOCKET_EVENTS.PRESENCE_TYPING_START, onTypingStart);
      socket.off(SOCKET_EVENTS.PRESENCE_TYPING_STOP, onTypingStop);
    };
  }, [roomId, updateParticipant, removeParticipant, setTyping]);

  // No outbound actions are needed here; UI components call socket.emit directly via useChat when typing.
};
