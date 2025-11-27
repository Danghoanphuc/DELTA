// apps/customer-frontend/src/contexts/SocketProvider.tsx
// ✅ Pusher Provider - Thay thế Socket.io

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import Pusher from "pusher-js";
import { useAuthStore } from "@/stores/useAuthStore";

interface SocketContextType {
  pusher: Pusher | null;
  isConnected: boolean;
  // ✅ Tương thích ngược: Giữ socket property để code cũ vẫn chạy
  socket: {
    socket: Pusher | null;
  } | null;
}

const SocketContext = createContext<SocketContextType | null>(null);

export const useSocket = () => {
  const context = useContext(SocketContext);
  if (!context) {
    throw new Error("useSocket must be used within SocketProvider");
  }
  return context;
};

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [pusher, setPusher] = useState<Pusher | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { user, accessToken } = useAuthStore(); // ✅ Lấy token từ store thay vì localStorage
  const pusherRef = useRef<Pusher | null>(null);

  useEffect(() => {
    if (!user || !accessToken) {
      if (pusherRef.current) {
        console.log("[Pusher] Disconnecting due to logout or missing token...");
        pusherRef.current.disconnect();
        pusherRef.current = null;
        setPusher(null);
        setIsConnected(false);
      }
      return;
    }

    // ✅ Reinitialize Pusher khi token thay đổi
    if (pusherRef.current) {
      console.log("[Pusher] Token changed, reinitializing...");
      pusherRef.current.disconnect();
      pusherRef.current = null;
    }

    const PUSHER_KEY = import.meta.env.VITE_PUSHER_KEY;
    const PUSHER_CLUSTER = import.meta.env.VITE_PUSHER_CLUSTER || "ap1";

    if (!PUSHER_KEY) {
      console.error("[Pusher] VITE_PUSHER_KEY is missing");
      return;
    }

    console.log("[Pusher] Initializing connection...");

    const API_URL = import.meta.env.VITE_API_URL || "http://localhost:8000";

    // ✅ Auth endpoint cho private channels - dùng token từ store
    pusherRef.current = new Pusher(PUSHER_KEY, {
      cluster: PUSHER_CLUSTER,
      authEndpoint: `${API_URL}/api/auth/pusher/auth`,
      auth: {
        headers: {
          Authorization: `Bearer ${accessToken}`, // ✅ Dùng token từ store
        },
      },
    });

    const pusherInstance = pusherRef.current;

    pusherInstance.connection.bind("connected", () => {
      console.log("✅ [Pusher] Connected");
      setIsConnected(true);
    });

    pusherInstance.connection.bind("disconnected", () => {
      console.warn("❌ [Pusher] Disconnected");
      setIsConnected(false);
    });

    pusherInstance.connection.bind("error", (err: any) => {
      console.error("⚠️ [Pusher] Connection Error:", err);
      setIsConnected(false);
    });

    // ✅ Handle subscription errors (JWT expired, etc.)
    pusherInstance.connection.bind("state_change", (states: any) => {
      console.log(`[Pusher] State changed: ${states.previous} -> ${states.current}`);
      if (states.current === "connected") {
        setIsConnected(true);
      } else if (states.current === "disconnected" || states.current === "failed") {
        setIsConnected(false);
      }
    });

    setPusher(pusherInstance);

    // Cleanup on unmount
    return () => {
      if (pusherRef.current) {
        pusherRef.current.disconnect();
        pusherRef.current = null;
      }
    };
  }, [user, accessToken]); // ✅ Re-run khi token thay đổi

  // ✅ Tương thích ngược: Giữ socket property để code cũ vẫn chạy
  const socketCompatible = pusher ? { socket: pusher } : null;

  return (
    <SocketContext.Provider value={{ pusher, isConnected, socket: socketCompatible }}>
      {children}
    </SocketContext.Provider>
  );
};
