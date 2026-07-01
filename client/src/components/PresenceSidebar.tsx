// src/components/PresenceSidebar.tsx
import React, { useEffect } from 'react';
import { usePresenceStore, PresenceStatus } from '@/stores/presence.store';
import '@/styles/presence.module.css';

const statusColors: Record<PresenceStatus, string> = {
  online: '#4caf50',
  offline: '#9e9e9e',
  away: '#ff9800',
  idle: '#ff9800',
  busy: '#f44336',
  invisible: '#607d8b',
};

export const PresenceSidebar: React.FC<{ roomId: string }> = ({ roomId }) => {
  const participants = usePresenceStore((s) => s.participants);
  const updateParticipant = usePresenceStore((s) => s.updateParticipant);
  const removeParticipant = usePresenceStore((s) => s.removeParticipant);

  // In a real app, we would subscribe to presence events via the socket.
  // For now, we simply expose the store – socket integration is handled in useChat.

  useEffect(() => {
    // placeholder for potential side‑effects when roomId changes
  }, [roomId]);

  return (
    <aside className="presence-sidebar glass">
      <header className="presence-header">
        <h3>Participants</h3>
      </header>
      <ul className="presence-list">
        {Object.values(participants).map((p) => (
          <li key={p.userId} className="presence-item">
            <span
              className="status-dot"
              style={{ backgroundColor: statusColors[p.status] }}
            />
            <img
              src={p.avatar ?? '/default-avatar.png'}
              alt={p.username}
              className="avatar"
            />
            <span className="username">{p.username ?? p.userId}</span>
          </li>
        ))}
      </ul>
    </aside>
  );
};
