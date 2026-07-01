import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/auth.store";

export class SocketManager {
  private static instance: SocketManager;
  private socket: Socket | null = null;
  private connectionPromise: Promise<Socket> | null = null;
  private heartbeatInterval: NodeJS.Timeout | null = null;

  private constructor() {}

  public static getInstance(): SocketManager {
    if (!SocketManager.instance) {
      SocketManager.instance = new SocketManager();
    }
    return SocketManager.instance;
  }

  public async connect(): Promise<Socket> {
    if (this.socket?.connected) {
      return this.socket;
    }

    if (this.connectionPromise) {
      return this.connectionPromise;
    }

    this.connectionPromise = new Promise((resolve, reject) => {
      const { token } = useAuthStore.getState();
      
      if (!token) {
        reject(new Error("Cannot connect socket without auth token"));
        return;
      }

      this.socket = io(process.env.NEXT_PUBLIC_API_URL || "http://localhost:3001", {
        auth: { token },
        transports: ["websocket"],
        reconnection: true,
        reconnectionDelay: 1000,
        reconnectionDelayMax: 5000,
        reconnectionAttempts: Infinity,
      });

      this.socket.on("connect", () => {
        console.log("[Socket.IO] Connected", this.socket?.id);
        this.startHeartbeat();
        resolve(this.socket!);
      });

      this.socket.on("connect_error", (error) => {
        console.error("[Socket.IO] Connection Error:", error.message);
        if (error.message.includes("UNAUTHORIZED")) {
          // Token expired or invalid
          useAuthStore.getState().logout();
        }
        reject(error);
      });

      this.socket.on("disconnect", (reason) => {
        console.log("[Socket.IO] Disconnected:", reason);
        this.stopHeartbeat();
      });
    });

    return this.connectionPromise;
  }

  public getSocket(): Socket | null {
    return this.socket;
  }

  public disconnect() {
    if (this.socket) {
      this.socket.disconnect();
      this.socket = null;
    }
    this.connectionPromise = null;
    this.stopHeartbeat();
  }

  private startHeartbeat() {
    this.stopHeartbeat();
    this.heartbeatInterval = setInterval(() => {
      if (this.socket?.connected) {
        this.socket.emit("PING");
      }
    }, 10000); // Send heartbeat every 10 seconds
  }

  private stopHeartbeat() {
    if (this.heartbeatInterval) {
      clearInterval(this.heartbeatInterval);
      this.heartbeatInterval = null;
    }
  }

  // Wrapper for emission with ack promise
  public async emitWithAck<T = any>(event: string, payload: any): Promise<T> {
    const socket = await this.connect();
    return new Promise((resolve, reject) => {
      // Setup timeout for acknowledgment
      const timeoutId = setTimeout(() => {
        reject(new Error(`Socket emit timeout for event ${event}`));
      }, 5000);

      socket.emit(event, payload, (response: any) => {
        clearTimeout(timeoutId);
        if (response?.success) {
          resolve(response.details || response.data);
        } else {
          reject(new Error(response?.message || "Socket operation failed"));
        }
      });
    });
  }
}

export const socketManager = SocketManager.getInstance();
