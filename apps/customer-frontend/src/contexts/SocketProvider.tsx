// apps/customer-frontend/src/contexts/SocketProvider.tsx
// ✅ FIXED: Join User Room to receive Realtime Messages & Notifications

import React, {
  createContext,
  useContext,
  useEffect,
  useState,
  useRef,
} from "react";
import { io, Socket } from "socket.io-client";
import { useAuthStore } from "@/stores/useAuthStore";

interface SocketContextType {
  socket: Socket | null;
  isConnected: boolean;
}

const SocketContext = createContext<SocketContextType>({
  socket: null,
  isConnected: false,
});

export const useSocket = () => useContext(SocketContext);

export const SocketProvider: React.FC<{ children: React.ReactNode }> = ({
  children,
}) => {
  const [socket, setSocket] = useState<Socket | null>(null);
  const [isConnected, setIsConnected] = useState(false);
  const { accessToken, user } = useAuthStore();

  const socketRef = useRef<Socket | null>(null);

  useEffect(() => {
    // Chỉ kết nối khi có Token và User ID
    if (!accessToken || !user) {
      if (socketRef.current) {
        console.log("[Socket] Disconnecting due to logout...");
        socketRef.current.disconnect();
        socketRef.current = null;
        setSocket(null);
        setIsConnected(false);
      }
      return;
    }

    // Singleton Socket Instance
    if (!socketRef.current) {
      // Lấy URL từ env hoặc fallback local
      const SOCKET_URL =
        import.meta.env.VITE_SOCKET_URL ||
        import.meta.env.VITE_API_URL ||
        "http://localhost:5000"; // Đổi port 8000 hay 5000 tùy backend của bạn

      console.log("[Socket] Initializing connection to:", SOCKET_URL);

      socketRef.current = io(SOCKET_URL, {
        auth: { token: accessToken },
        transports: ["websocket"],
        reconnection: true,
        reconnectionAttempts: 10,
        reconnectionDelay: 1000,
      });

      const socketInstance = socketRef.current;

      socketInstance.on("connect", () => {
        console.log("✅ [Socket] Connected ID:", socketInstance.id);
        setIsConnected(true);

        // 🔥 QUAN TRỌNG: Join room riêng của user để nhận tin nhắn cá nhân
        // Backend emit tới recipientId, nên socket phải join room có tên là userId
        socketInstance.emit("join_user_room", user._id);
      });

      socketInstance.on("disconnect", (reason) => {
        console.warn("❌ [Socket] Disconnected:", reason);
        setIsConnected(false);
      });

      socketInstance.on("connect_error", (err) => {
        console.error("⚠️ [Socket] Connection Error:", err.message);
      });

      setSocket(socketInstance);
    } else {
      // Update token nếu thay đổi
      socketRef.current.auth = { token: accessToken };
    }

    // Xử lý Background Throttling (Khi tab bị ẩn/hiện)
    const handleVisibilityChange = () => {
      if (document.visibilityState === "visible" && socketRef.current) {
        if (!socketRef.current.connected) {
          console.log("🔄 [Socket] Tab active, reconnecting...");
          socketRef.current.connect();
        }
      }
    };

    document.addEventListener("visibilitychange", handleVisibilityChange);

    return () => {
      document.removeEventListener("visibilitychange", handleVisibilityChange);
    };
  }, [accessToken, user]);

  return (
    <SocketContext.Provider value={{ socket, isConnected }}>
      {children}
    </SocketContext.Provider>
  );
};
