// apps/customer-frontend/src/contexts/SocketProvider.tsx
import React, { createContext, useContext, useEffect, useState } from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/useAuthStore";

interface SocketContextValue {
  socket: Socket | null;
  isConnected: boolean;
  connectionError: string | null;
}

const SocketContext = createContext<SocketContextValue>({
  socket: null,
  isConnected: false,
  connectionError: null,
});

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

interface SocketProviderProps {
  children: React.ReactNode;
}

export function SocketProvider({ children }: SocketProviderProps) {
  const accessToken = useAuthStore((state) => state.accessToken);
  const isAuthenticated = !!accessToken;
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const [connectionError, setConnectionError] = useState<string | null>(null);

  useEffect(() => {
    // Only connect if user is authenticated and has a valid token
    if (!isAuthenticated || !accessToken) {
      // Disconnect if already connected
      if (socket) {
        console.log("[SocketProvider] Disconnecting due to logout...");
        socket.disconnect();
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    console.log("[SocketProvider] Initializing Socket.io connection...");

    // Get server URL from env
    const SOCKET_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

    // Create socket instance
    const newSocket = io(SOCKET_URL, {
      auth: {
        token: accessToken,
      },
      transports: ["websocket", "polling"],
      reconnection: true,
      reconnectionAttempts: 5,
      reconnectionDelay: 1000,
      reconnectionDelayMax: 5000,
      timeout: 20000,
    });

    // Connection event handlers
    newSocket.on("connect", () => {
      console.log("[SocketProvider] ✅ Connected to Socket.io server");
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on("connected", (data) => {
      console.log("[SocketProvider] 🎉 Received welcome message:", data);
    });

    newSocket.on("disconnect", (reason) => {
      console.log("[SocketProvider] ❌ Disconnected:", reason);
      setIsConnected(false);
      
      if (reason === "io server disconnect") {
        // Server disconnected us, try to reconnect
        newSocket.connect();
      }
    });

    newSocket.on("connect_error", (error) => {
      console.error("[SocketProvider] ⚠️ Connection error:", error.message);
      setConnectionError(error.message);
      setIsConnected(false);
    });

    newSocket.on("reconnect", (attemptNumber) => {
      console.log(
        `[SocketProvider] 🔄 Reconnected after ${attemptNumber} attempts`
      );
      setIsConnected(true);
      setConnectionError(null);
    });

    newSocket.on("reconnect_attempt", (attemptNumber) => {
      console.log(
        `[SocketProvider] 🔄 Reconnection attempt #${attemptNumber}...`
      );
    });

    newSocket.on("reconnect_failed", () => {
      console.error(
        "[SocketProvider] ❌ Failed to reconnect after maximum attempts"
      );
      setConnectionError("Failed to reconnect to server");
    });

    // Ping-pong heartbeat (optional)
    const pingInterval = setInterval(() => {
      if (newSocket.connected) {
        newSocket.emit("ping");
      }
    }, 30000); // Every 30 seconds

    newSocket.on("pong", (data) => {
      console.log("[SocketProvider] 💓 Pong received:", data);
    });

    setSocket(newSocket);

    // Cleanup on unmount or when dependencies change
    return () => {
      console.log("[SocketProvider] Cleaning up socket connection...");
      clearInterval(pingInterval);
      
      if (newSocket) {
        newSocket.off("connect");
        newSocket.off("connected");
        newSocket.off("disconnect");
        newSocket.off("connect_error");
        newSocket.off("reconnect");
        newSocket.off("reconnect_attempt");
        newSocket.off("reconnect_failed");
        newSocket.off("pong");
        newSocket.disconnect();
      }
    };
  }, [accessToken, isAuthenticated]);

  const value: SocketContextValue = {
    socket,
    isConnected,
    connectionError,
  };

  return (
    <SocketContext.Provider value={value}>{children}</SocketContext.Provider>
  );
}

