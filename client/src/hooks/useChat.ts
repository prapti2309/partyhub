// src/hooks/useChat.ts
import { useEffect } from 'react';
import { socketManager } from '@/lib/socket/SocketManager';
import { SOCKET_EVENTS } from '@/sockets/events';
import { useChatStore } from '@/stores/chat.store';
import { ChatMessage, MessageReaction } from '@/types/chat.types';

export const useChat = (roomId: string) => {
  const addMessage = useChatStore((s) => s.addMessage);
  const editMessage = useChatStore((s) => s.editMessage);
  const deleteMessage = useChatStore((s) => s.deleteMessage);
  const addReaction = useChatStore((s) => s.addReaction);
  const removeReaction = useChatStore((s) => s.removeReaction);
  const setTyping = useChatStore((s) => s.setTyping);
  const incrementUnread = useChatStore((s) => s.incrementUnread);
  const resetUnread = useChatStore((s) => s.resetUnread);
  const markRead = useChatStore((s) => s.markRead);

  // Subscribe to inbound events
  useEffect(() => {
    const socket = socketManager.getSocket();
    if (!socket) return;

    const onMessage = (msg: ChatMessage) => {
      if (msg.roomId !== roomId) return;
      addMessage(msg);
      // Increment unread if the user is not currently viewing the room
      incrementUnread();
    };
    const onEdit = (msg: ChatMessage) => {
      if (msg.roomId !== roomId) return;
      editMessage(msg.id, msg.content);
    };
    const onDelete = (payload: { messageId: string; userId: string }) => {
      if (payload.messageId) deleteMessage(payload.messageId);
    };
    const onReactionAdd = (reaction: MessageReaction) => {
      if (reaction.roomId !== roomId) return;
      addReaction(reaction);
    };
    const onReactionRemove = (payload: { messageId: string; userId: string; emoji: string }) => {
      removeReaction(payload.messageId, payload.userId, payload.emoji);
    };
    const onTypingStart = (payload: { userId: string }) => {
      setTyping(payload.userId, true);
    };
    const onTypingStop = (payload: { userId: string }) => {
      setTyping(payload.userId, false);
    };
    const onReadReceipt = (payload: { userId: string; lastReadMessageId: string }) => {
      if (payload.userId === socket.data.user.id) {
        // This client read its own messages – clear unread counter
        resetUnread();
        markRead(payload.lastReadMessageId);
      }
    };

    socket.on(SOCKET_EVENTS.CHAT_MESSAGE, onMessage);
    socket.on(SOCKET_EVENTS.CHAT_EDIT, onEdit);
    socket.on(SOCKET_EVENTS.CHAT_DELETE, onDelete);
    socket.on(SOCKET_EVENTS.CHAT_REACTION_ADD, onReactionAdd);
    socket.on(SOCKET_EVENTS.CHAT_REACTION_REMOVE, onReactionRemove);
    socket.on(SOCKET_EVENTS.CHAT_TYPING_START, onTypingStart);
    socket.on(SOCKET_EVENTS.CHAT_TYPING_STOP, onTypingStop);
    socket.on(SOCKET_EVENTS.CHAT_READ_RECEIPT, onReadReceipt);

    return () => {
      socket.off(SOCKET_EVENTS.CHAT_MESSAGE, onMessage);
      socket.off(SOCKET_EVENTS.CHAT_EDIT, onEdit);
      socket.off(SOCKET_EVENTS.CHAT_DELETE, onDelete);
      socket.off(SOCKET_EVENTS.CHAT_REACTION_ADD, onReactionAdd);
      socket.off(SOCKET_EVENTS.CHAT_REACTION_REMOVE, onReactionRemove);
      socket.off(SOCKET_EVENTS.CHAT_TYPING_START, onTypingStart);
      socket.off(SOCKET_EVENTS.CHAT_TYPING_STOP, onTypingStop);
      socket.off(SOCKET_EVENTS.CHAT_READ_RECEIPT, onReadReceipt);
    };
  }, [roomId, addMessage, editMessage, deleteMessage, addReaction, removeReaction, setTyping, incrementUnread, resetUnread, markRead]);

  // Outbound actions
  const sendMessage = async (content: string) => {
    await socketManager.emitWithAck(SOCKET_EVENTS.CHAT_SEND, { roomId, content });
  };

  const edit = async (messageId: string, newContent: string) => {
    await socketManager.emitWithAck(SOCKET_EVENTS.CHAT_EDIT, { messageId, content: newContent });
  };

  const remove = async (messageId: string) => {
    await socketManager.emitWithAck(SOCKET_EVENTS.CHAT_DELETE, { messageId });
  };

  const react = async (messageId: string, emoji: string) => {
    await socketManager.emitWithAck(SOCKET_EVENTS.CHAT_REACTION_ADD, { messageId, emoji });
  };

  const unreact = async (messageId: string, emoji: string) => {
    await socketManager.emitWithAck(SOCKET_EVENTS.CHAT_REACTION_REMOVE, { messageId, emoji });
  };

  const markReadReceipt = async (lastReadMessageId: string) => {
    await socketManager.emitWithAck(SOCKET_EVENTS.CHAT_READ_RECEIPT, { roomId, lastReadMessageId });
  };

  const startTyping = async () => {
    await socketManager.emitWithAck(SOCKET_EVENTS.CHAT_TYPING_START, { roomId });
  };
  const stopTyping = async () => {
    await socketManager.emitWithAck(SOCKET_EVENTS.CHAT_TYPING_STOP, { roomId });
  };

  return {
    sendMessage,
    edit,
    remove,
    react,
    unreact,
    markReadReceipt,
    startTyping,
    stopTyping,
  };
};
