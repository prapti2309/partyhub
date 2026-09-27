"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import { Socket } from "socket.io-client";
import { socketManager } from "@/lib/socket/SocketManager";
import { useAuthStore } from "@/stores/auth.store";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
  emitEvent: (event: string, payload: any) => Promise<any>;
}

const SocketContext = createContext<SocketContextType | undefined>(undefined);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const isAuthenticated = useAuthStore((state) => state.isAuthenticated);

  useEffect(() => {
    if (isAuthenticated) {
      socketManager
        .connect()
        .then((s) => {
          setSocket(s);
          setIsConnected(s.connected);

          s.on("connect", () => setIsConnected(true));
          s.on("disconnect", () => setIsConnected(false));
        })
        .catch((err) => {
          console.warn("[SocketContext] Socket connection error:", err.message);
        });
    } else {
      socketManager.disconnect();
      setSocket(null);
      setIsConnected(false);
    }

    return () => {
      // Intentionally not disconnecting on unmount to allow persistence across routes
    };
  }, [isAuthenticated]);

  const emitEvent = async (event: string, payload: any) => {
    return socketManager.emitWithAck(event, payload);
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
