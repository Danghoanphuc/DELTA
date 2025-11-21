// apps/customer-frontend/src/components/NotificationListener.tsx
// ✅ FIXED: Centralized Notification Handler (Toast + Audio + Refresh)

import { useEffect, useRef, useCallback } from "react";
import { useSocket } from "@/contexts/SocketProvider";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";
import { useNavigate, useLocation } from "react-router-dom";
import { UserPlus, MessageCircle, Package, Bell } from "lucide-react";

export function NotificationListener() {
  const { socket, isConnected } = useSocket();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const navigate = useNavigate();
  const location = useLocation();
  const audioContextRef = useRef<AudioContext | null>(null);

  // 1. Init Audio Context (Giữ nguyên logic của bạn)
  useEffect(() => {
    try {
      const AudioContextClass =
        window.AudioContext || (window as any).webkitAudioContext;
      if (AudioContextClass) {
        audioContextRef.current = new AudioContextClass();
      }
    } catch (e) {
      console.error("AudioContext not supported");
    }
  }, []);

  // 2. Hàm phát âm thanh (Unlock Audio Context khi cần)
  const playNotificationSound = useCallback(async () => {
    try {
      if (!audioContextRef.current) return;
      const ctx = audioContextRef.current;
      if (ctx.state === "suspended") await ctx.resume();

      const oscillator = ctx.createOscillator();
      const gainNode = ctx.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(ctx.destination);

      // Âm thanh 'Ding' dễ chịu hơn (Sine wave)
      oscillator.frequency.setValueAtTime(880, ctx.currentTime);
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.1, ctx.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.001, ctx.currentTime + 0.5);

      oscillator.start(ctx.currentTime);
      oscillator.stop(ctx.currentTime + 0.5);
    } catch (err) {
      console.warn("Audio play failed", err);
    }
  }, []);

  // 3. Hàm Refresh dữ liệu toàn cục
  const forceRefresh = useCallback(() => {
    console.log("🔄 Refreshing App Data...");
    // Invalidate tất cả các query liên quan
    queryClient.invalidateQueries({ queryKey: ["notifications"] }); // Cập nhật chuông & list
    queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
    queryClient.invalidateQueries({ queryKey: ["friends"] });
    queryClient.invalidateQueries({ queryKey: ["connectionStatus"] });
    queryClient.invalidateQueries({ queryKey: ["socialConversations"] }); // Cập nhật list chat bên trái
  }, [queryClient]);

  // 4. Xử lý điều hướng khi click vào Toast
  const handleToastClick = useCallback(
    (data: any) => {
      const { type, data: payload } = data;

      if (type === "message") {
        navigate(`/messages?conversationId=${payload.conversationId}`);
      } else if (type === "connection_request") {
        navigate("/friends?tab=pending");
      } else if (type.includes("order")) {
        navigate(
          payload.orderId ? `/customer/orders/${payload.orderId}` : "/orders"
        );
      } else {
        navigate("/notifications");
      }
    },
    [navigate]
  );

  useEffect(() => {
    if (!socket || !isConnected) return;

    // ✅ HANDLER CHUNG CHO SỰ KIỆN 'notification' TỪ BACKEND
    const handleGeneralNotification = (data: any) => {
      // data structure: { title, message, type, data: {...} }

      // Case đặc biệt: Nếu đang ở trang chat với đúng người gửi -> Không hiện Toast, chỉ play sound nhẹ
      if (data.type === "message" && location.pathname.includes("/messages")) {
        const currentParams = new URLSearchParams(location.search);
        if (currentParams.get("conversationId") === data.data?.conversationId) {
          return; // Đang chat thì thôi
        }
      }

      playNotificationSound();
      forceRefresh();

      // Render Rich Toast tùy theo loại
      const Icon = getIconByType(data.type);

      toast(data.title, {
        description: data.message,
        icon: <Icon className="w-5 h-5 text-blue-600" />,
        action: {
          label: "Xem",
          onClick: () => handleToastClick(data),
        },
        duration: 4000,
      });
    };

    // Các handler legacy (nếu backend còn bắn events cũ)
    const handleConnectionRequest = (data: any) => {
      handleGeneralNotification({
        type: "connection_request",
        title: "🤝 Lời mời kết bạn",
        message: `${data.requester?.displayName || "Ai đó"} muốn kết bạn`,
        data: {},
      });
    };

    const handleConnectionAccepted = (data: any) => {
      handleGeneralNotification({
        type: "connection_accepted",
        title: "✅ Đã là bạn bè!",
        message: `${data.acceptedBy?.displayName} đã đồng ý.`,
        data: { conversationId: data.conversationId },
      });
    };

    // Lắng nghe sự kiện
    socket.on("notification", handleGeneralNotification); // 🔥 QUAN TRỌNG NHẤT
    socket.on("connection:request", handleConnectionRequest);
    socket.on("connection:accepted", handleConnectionAccepted);

    return () => {
      socket.off("notification", handleGeneralNotification);
      socket.off("connection:request", handleConnectionRequest);
      socket.off("connection:accepted", handleConnectionAccepted);
    };
  }, [
    socket,
    isConnected,
    user,
    location,
    playNotificationSound,
    forceRefresh,
    handleToastClick,
  ]);

  return null;
}

// Helper chọn icon
function getIconByType(type: string) {
  if (type === "message") return MessageCircle;
  if (type.includes("connection")) return UserPlus;
  if (type.includes("order")) return Package;
  return Bell;
}
