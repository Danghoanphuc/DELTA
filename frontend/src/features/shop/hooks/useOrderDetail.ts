// features/shop/hooks/useOrderDetail.ts
import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Order, OrderStatus } from "@/types/order";
import { useAuthStore } from "@/stores/useAuthStore";
import api from "@/shared/lib/axios";
import { toast } from "sonner";
import {
  Clock,
  CheckCircle,
  Truck,
  XCircle,
  Package,
  CreditCard,
} from "lucide-react";

export const useOrderDetail = () => {
  const { orderId } = useParams<{ orderId: string }>();
  const navigate = useNavigate();
  const { user } = useAuthStore();

  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);

  const isPrinter = user?.role === "printer";

  useEffect(() => {
    const fetchOrder = async () => {
      if (!orderId) return;
      setLoading(true);
      try {
        const endpoint = isPrinter
          ? `/orders/printer/${orderId}`
          : `/orders/${orderId}`;
        const res = await api.get(endpoint);
        setOrder(res.data?.order || res.data?.data?.order);
      } catch (err: any) {
        toast.error("Không thể tải thông tin đơn hàng");
        navigate(isPrinter ? "/printer/orders" : "/orders");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderId, isPrinter, navigate]);

  // --- Helpers ---
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getStatusConfig = (status: OrderStatus) => {
    const configs: Record<
      OrderStatus,
      { label: string; icon: any; color: string; bgColor: string }
    > = {
      // SỬA LẠI ĐẦY ĐỦ NHƯ SAU:
      pending: {
        label: "Chờ xác nhận",
        icon: Clock,
        color: "text-yellow-600",
        bgColor: "bg-yellow-100",
      },
      confirmed: {
        label: "Đã xác nhận",
        icon: CheckCircle,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
      },
      designing: {
        label: "Đang thiết kế",
        icon: Package,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
      },
      printing: {
        label: "Đang in",
        icon: Package,
        color: "text-indigo-600",
        bgColor: "bg-indigo-100",
      },
      ready: {
        label: "Sẵn sàng giao",
        icon: Package,
        color: "text-cyan-600",
        bgColor: "bg-cyan-100",
      },
      shipping: {
        label: "Đang giao hàng",
        icon: Truck,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
      },
      completed: {
        label: "Hoàn thành",
        icon: CheckCircle,
        color: "text-green-600",
        bgColor: "bg-green-100",
      },
      cancelled: {
        label: "Đã hủy",
        icon: XCircle,
        color: "text-red-600",
        bgColor: "bg-red-100",
      },
      refunded: {
        label: "Đã hoàn tiền",
        icon: CreditCard,
        color: "text-gray-600",
        bgColor: "bg-gray-100",
      },
    };

    return configs[status] || configs.pending; // Đảm bảo có fallback
  };

  return {
    order,
    loading,
    isPrinter,
    navigate,
    formatPrice,
    formatDate,
    getStatusConfig, // Trả về hàm đã sửa
  };
};
