// apps/customer-frontend/src/components/NotificationListener.tsx
import { useEffect, useRef } from "react";
import { useSocket } from "@/contexts/SocketProvider";
import { toast } from "sonner";
import { useAuthStore } from "@/stores/useAuthStore";
import { useQueryClient } from "@tanstack/react-query";

/**
 * NotificationListener - Global component to handle real-time notifications
 * 
 * Features:
 * - Listens for printer:new_order events (for printers)
 * - Listens for customer:order_update events (for customers)
 * - Plays notification sound (optional)
 * - Shows toast notifications
 * - Can be extended to update global state/cache
 */
export function NotificationListener() {
  const { socket, isConnected } = useSocket();
  const user = useAuthStore((state) => state.user);
  const queryClient = useQueryClient();
  const audioRef = useRef<HTMLAudioElement | null>(null);

  // Initialize notification sound
  useEffect(() => {
    // Create a simple beep sound using Web Audio API instead of loading a file
    // This avoids the "no supported sources" error
    audioRef.current = null; // We'll use Web Audio API instead
  }, []);

  const playNotificationSound = () => {
    try {
      // Use Web Audio API to generate a simple notification beep
      const audioContext = new (window.AudioContext || (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800; // Frequency in Hz
      oscillator.type = 'sine';

      gainNode.gain.setValueAtTime(0.3, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(0.01, audioContext.currentTime + 0.5);

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.5);
    } catch (err) {
      console.error("Error playing sound:", err);
    }
  };

  useEffect(() => {
    if (!socket || !isConnected) {
      console.log("[NotificationListener] Socket not connected, skipping setup");
      return;
    }

    console.log("[NotificationListener] Setting up event listeners...");

    // ============================================
    // PRINTER NOTIFICATIONS
    // ============================================

    /**
     * Event: printer:new_order
     * Trigger: New order created that includes this printer
     */
    const handleNewOrder = (data: any) => {
      console.log("[NotificationListener] 🔔 New Order:", data);

      // Play sound
      playNotificationSound();

      // Show toast notification
      toast.success(`🔔 Ting! Đơn hàng mới #${data.orderNumber}`, {
        description: `${data.customerName} • ${data.itemsCount} sản phẩm • ${data.totalQuantity} chiếc • 💰 ${data.printerPayout?.toLocaleString("vi-VN")} đ`,
        duration: 8000,
      });

      // Optional: Trigger data refetch or update global state
      // queryClient.invalidateQueries(['printer-orders']);
    };

    /**
     * Event: printer:order_update
     * Trigger: Order status changed (payment confirmed, cancelled, etc.)
     */
    const handlePrinterOrderUpdate = (data: any) => {
      console.log("[NotificationListener] 📝 Order Update (Printer):", data);

      let title = "Đơn hàng cập nhật";
      let description = `Đơn hàng #${data.orderNumber} đã được cập nhật`;

      if (data.paymentStatus === "paid") {
        title = "✅ Thanh toán thành công";
        description = `Đơn hàng #${data.orderNumber} đã được thanh toán. Bắt đầu xử lý!`;
        playNotificationSound();
        toast.success(title, { description, duration: 6000 });
      } else if (data.masterStatus === "cancelled") {
        title = "❌ Đơn hàng bị hủy";
        description = `Đơn hàng #${data.orderNumber} đã bị hủy bởi khách hàng`;
        toast.error(title, { description, duration: 6000 });
      } else {
        toast.info(title, { description, duration: 6000 });
      }
    };

    // ============================================
    // SOCIAL / CONNECTION NOTIFICATIONS
    // ============================================

    /**
     * Event: connection:request
     * Trigger: Someone sent you a friend request
     */
    const handleConnectionRequest = (data: any) => {
      console.log("[NotificationListener] 🤝 Connection Request:", data);
      
      playNotificationSound();
      
      toast.info(`🤝 Lời mời kết bạn mới`, {
        description: `${data.requester?.displayName || data.requester?.username} muốn kết bạn với bạn`,
        duration: 8000,
      });

      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    };

    /**
     * Event: connection:accepted
     * Trigger: Someone accepted your friend request
     */
    const handleConnectionAccepted = (data: any) => {
      console.log("[NotificationListener] ✅ Connection Accepted:", data);
      
      playNotificationSound();
      
      toast.success(`✅ Kết bạn thành công`, {
        description: `${data.acceptedBy?.displayName || data.acceptedBy?.username} đã chấp nhận lời mời kết bạn của bạn`,
        duration: 6000,
      });

      // Invalidate queries to refresh UI
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["sentRequests"] });
      queryClient.invalidateQueries({ queryKey: ["connectionStatus"] });
      queryClient.invalidateQueries({ queryKey: ["notifications", "unread-count"] });
    };

    // ============================================
    // CUSTOMER NOTIFICATIONS
    // ============================================

    /**
     * Event: customer:order_created
     * Trigger: Customer's order was successfully created
     */
    const handleOrderCreated = (data: any) => {
      console.log("[NotificationListener] 🎉 Order Created:", data);

      toast.success("🎉 Đơn hàng đã được tạo", {
        description: `#${data.orderNumber} • ${data.totalItems} sản phẩm • ${data.totalAmount?.toLocaleString("vi-VN")} đ • Chờ xác nhận thanh toán...`,
        duration: 6000,
      });

      // ✅ Refetch notification count (notification was saved to DB)
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
    };

    /**
     * Event: customer:order_update
     * Trigger: Order status changed (confirmed, shipped, completed, etc.)
     */
    const handleOrderUpdate = (data: any) => {
      console.log("[NotificationListener] 📦 Order Update:", data);

      let title = "Đơn hàng cập nhật";
      let description = `Đơn hàng #${data.orderNumber}`;

      // Determine notification content based on status
      if (data.changes?.paymentStatus?.newValue === "paid") {
        title = "✅ Thanh toán thành công";
        description = `Đơn hàng #${data.orderNumber} đã được thanh toán`;
        playNotificationSound();
        toast.success(title, { description, duration: 6000 });
      } else if (data.changes?.masterStatus?.newValue === "processing") {
        title = "⚙️ Đang xử lý";
        description = `Đơn hàng #${data.orderNumber} đang được xử lý`;
        toast.info(title, { description, duration: 6000 });
      } else if (data.changes?.masterStatus?.newValue === "shipping") {
        title = "🚚 Đang giao hàng";
        description = `Đơn hàng #${data.orderNumber} đang trên đường giao đến bạn`;
        playNotificationSound();
        toast.info(title, { description, duration: 6000 });
      } else if (data.changes?.masterStatus?.newValue === "completed") {
        title = "🎉 Hoàn thành";
        description = `Đơn hàng #${data.orderNumber} đã được giao thành công`;
        playNotificationSound();
        toast.success(title, { description, duration: 6000 });
      } else if (data.changes?.masterStatus?.newValue === "cancelled") {
        title = "❌ Đã hủy";
        description = `Đơn hàng #${data.orderNumber} đã bị hủy`;
        toast.error(title, { description, duration: 6000 });
      } else {
        // Show printer status changes if available
        if (data.changes?.printerStatuses && data.changes.printerStatuses.length > 0) {
          const printerStatus = data.changes.printerStatuses[0];
          description += ` • 📋 ${printerStatus.printerBusinessName}: ${printerStatus.status}`;
        }
        toast.info(title, { description, duration: 6000 });
      }

      // ✅ Refetch notification count (notification was saved to DB)
      queryClient.invalidateQueries({ queryKey: ["notifications"] });
      
      // Optional: Trigger data refetch
      // queryClient.invalidateQueries(['customer-orders']);
    };

    // ============================================
    // REGISTER EVENT LISTENERS
    // ============================================

    // Printer events
    socket.on("printer:new_order", handleNewOrder);
    socket.on("printer:order_update", handlePrinterOrderUpdate);

    // Customer events
    socket.on("customer:order_created", handleOrderCreated);
    socket.on("customer:order_update", handleOrderUpdate);

    // Social / Connection events
    socket.on("connection:request", handleConnectionRequest);
    socket.on("connection:accepted", handleConnectionAccepted);

    console.log("[NotificationListener] ✅ Event listeners registered");

    // Cleanup on unmount
    return () => {
      console.log("[NotificationListener] Cleaning up event listeners...");
      socket.off("printer:new_order", handleNewOrder);
      socket.off("printer:order_update", handlePrinterOrderUpdate);
      socket.off("customer:order_created", handleOrderCreated);
      socket.off("customer:order_update", handleOrderUpdate);
      socket.off("connection:request", handleConnectionRequest);
      socket.off("connection:accepted", handleConnectionAccepted);
    };
  }, [socket, isConnected, toast, user]);

  // This component doesn't render anything
  return null;
}

