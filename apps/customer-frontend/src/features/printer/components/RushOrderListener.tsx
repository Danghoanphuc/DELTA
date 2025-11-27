// apps/customer-frontend/src/features/printer/components/RushOrderListener.tsx
import { useEffect } from "react";
import { useSocket } from "@/contexts/SocketProvider";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "@/shared/utils/toast";
import { Zap, ArrowRight } from "lucide-react";
import { useNavigate } from "react-router-dom";

/**
 * Component lắng nghe sự kiện rush order từ Backend
 * Hiển thị thông báo và phát âm thanh khi có đơn hàng gấp mới
 */
export const RushOrderListener = () => {
  const { pusher, isConnected } = useSocket(); // ✅ FIX: Dùng pusher thay vì socket
  const { user } = useAuthStore();
  const navigate = useNavigate();

  useEffect(() => {
    if (!pusher || !isConnected || !user) {
      console.log("[RushOrderListener] Pusher chưa kết nối, bỏ qua listener");
      return;
    }

    // ✅ FIX: Subscribe vào public channel của printer (hoặc private-user nếu backend emit từ đó)
    // Note: Backend có thể emit từ public-printer-{printerId} hoặc private-user-{userId}
    // Tạm thời dùng private-user channel vì backend có thể emit từ đó
    const channelName = `private-user-${user._id}`;
    const channel = pusher.subscribe(channelName);

    console.log("[RushOrderListener] Đang lắng nghe sự kiện printer:new_rush_order");

    // ✅ Lắng nghe sự kiện từ Backend
    const handleNewRushOrder = (data: any) => {
      console.log("🔥 [RushOrderListener] CÓ ĐƠN GẤP MỚI:", data);

      // 1. Phát âm thanh thông báo (nếu có file audio)
      try {
        // Tạo audio element động (không cần file thật, dùng Web Audio API)
        const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
        const oscillator = audioContext.createOscillator();
        const gainNode = audioContext.createGain();

        oscillator.connect(gainNode);
        gainNode.connect(audioContext.destination);

        oscillator.frequency.value = 800; // Tần số cao để tạo tiếng "ting"
        oscillator.type = "sine";
        gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
        gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.2);

        oscillator.start(audioContext.currentTime);
        oscillator.stop(audioContext.currentTime + 0.2);
      } catch (error) {
        console.warn("[RushOrderListener] Không thể phát âm thanh:", error);
      }

      // 2. Hiển thị toast notification với thông tin đơn hàng
      const deadlineDate = data.requiredDeadline
        ? new Date(data.requiredDeadline)
        : null;
      const deadlineText = deadlineDate
        ? deadlineDate.toLocaleTimeString("vi-VN", {
            hour: "2-digit",
            minute: "2-digit",
          })
        : "N/A";

      toast.info("🔥 CÓ ĐƠN HÀNG HỎA TỐC MỚI!", {
        description: `Đơn #${data.orderNumber || "N/A"}: ${data.productName || "Sản phẩm"} - ${data.quantity || 1} cái. Giao trước: ${deadlineText}`,
        duration: 10000, // Hiện 10 giây
        icon: <Zap className="w-5 h-5 text-orange-500 animate-pulse" />,
        action: {
          label: "Xem ngay",
          onClick: () => {
            if (data.orderId) {
              navigate(`/printer/orders/${data.orderId}`);
            } else {
              navigate("/printer/dashboard?tab=orders");
            }
          },
        },
        className: "border-2 border-orange-500",
      });
    };

    // ✅ FIX: Bind Pusher event thay vì socket.on()
    channel.bind("printer:new_rush_order", handleNewRushOrder);

    // Cleanup khi unmount
    return () => {
      console.log("[RushOrderListener] Cleanup: Gỡ listener");
      channel.unbind("printer:new_rush_order", handleNewRushOrder);
      pusher.unsubscribe(channelName);
    };
  }, [pusher, isConnected, user, navigate]);

  // Component không render gì
  return null;
};

