"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { socketManager } from "@/lib/socket/SocketManager";
import { useAuthStore } from "@/stores/auth.store";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocketContext = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      socketManager.connect().then((s) => {
        setSocket(s);
        setIsConnected(s.connected);

        s.on("connect", () => setIsConnected(true));
        s.on("disconnect", () => setIsConnected(false));
      }).catch(console.error);
    } else {
      socketManager.disconnect();
      setSocket(null);
      setIsConnected(false);
    }

    return () => {
      // Don't disconnect on unmount, we want the socket to persist across routes
      // socketManager.disconnect();
    };
  }, [isAuthenticated]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
