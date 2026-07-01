// src/components/ChatPanel.tsx
import React, { useState, useEffect, useRef } from 'react';
import { useChatStore } from '@/stores/chat.store';
import { usePresenceStore } from '@/stores/presence.store';
import { useChat } from '@/hooks/useChat';
import { SOCKET_EVENTS } from '@/sockets/events';
import '@/styles/chat.module.css';

export const ChatPanel: React.FC<{ roomId: string }> = ({ roomId }) => {
  const { sendMessage, edit, remove, react, unreact, startTyping, stopTyping, markReadReceipt } = useChat(roomId);
  const messages = useChatStore((s) => s.messages);
  const typingUsers = useChatStore((s) => s.typingUsers);
  const unreadCount = useChatStore((s) => s.unreadCount);
  const [input, setInput] = useState('');
  const [editingId, setEditingId] = useState<string | null>(null);
  const typingTimeout = useRef<NodeJS.Timeout | null>(null);

  // Debounced typing indicator (300ms)
  useEffect(() => {
    if (input.length > 0) {
      startTyping();
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
      typingTimeout.current = setTimeout(() => {
        stopTyping();
      }, 300);
    } else {
      stopTyping();
    }
    return () => {
      if (typingTimeout.current) clearTimeout(typingTimeout.current);
    };
  }, [input, startTyping, stopTyping]);

  const handleSend = async () => {
    if (!input.trim()) return;
    if (editingId) {
      await edit(editingId, input.trim());
      setEditingId(null);
    } else {
      await sendMessage(input.trim());
    }
    setInput('');
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter' && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleEdit = (msgId: string, current: string) => {
    setEditingId(msgId);
    setInput(current);
  };

  const handleDelete = async (msgId: string) => {
    await remove(msgId);
  };

  const handleReact = async (msgId: string, emoji: string) => {
    await react(msgId, emoji);
  };

  const handleUnreact = async (msgId: string, emoji: string) => {
    await unreact(msgId, emoji);
  };

  // Mark all messages as read when the panel becomes visible
  useEffect(() => {
    if (messages.length) {
      const lastMsgId = messages[messages.length - 1].id;
      markReadReceipt(lastMsgId);
    }
  }, [messages, markReadReceipt]);

  return (
    <div className="chat-panel glass">
      <header className="chat-header">
        <h2>Room {roomId}</h2>
        {unreadCount > 0 && <span className="unread-badge">{unreadCount}</span>}
      </header>
      <ul className="message-list">
        {messages.map((msg) => (
          <li key={msg.id} className="message-item">
            <div className="message-meta">
              <strong>{msg.sender.username}</strong>
              <span className="timestamp">{new Date(msg.createdAt).toLocaleTimeString()}</span>
            </div>
            <div className="message-content">{msg.content}</div>
            <div className="message-actions">
              <button onClick={() => handleEdit(msg.id, msg.content)}>Edit</button>
              <button onClick={() => handleDelete(msg.id)}>Delete</button>
              <button onClick={() => handleReact(msg.id, '👍')}>👍</button>
              <button onClick={() => handleUnreact(msg.id, '👍')}>👎</button>
            </div>
          </li>
        ))}
      </ul>
      {typingUsers.length > 0 && (
        <div className="typing-indicator">
          {typingUsers.map((uid) => (
            <span key={uid}>{uid} is typing...</span>
          ))}
        </div>
      )}
      <footer className="chat-input">
        <textarea
          rows={2}
          value={input}
          placeholder="Type a message…"
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={handleKeyDown}
        />
        <button onClick={handleSend}>{editingId ? 'Update' : 'Send'}</button>
      </footer>
    </div>
  );
};
