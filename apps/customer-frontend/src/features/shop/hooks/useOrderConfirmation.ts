// features/shop/hooks/useOrderConfirmation.ts
import { useEffect, useState } from "react";
import { useParams, useNavigate, useSearchParams } from "react-router-dom";
import { Order } from "@/types/order";
import api from "@/shared/lib/axios";
import { toast } from "@/shared/utils/toast";

export const useOrderConfirmation = () => {
  const { orderId: orderIdFromParams } = useParams<{ orderId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const [order, setOrder] = useState<Order | null>(null);
  const [loading, setLoading] = useState(true);
  const [showAnimation, setShowAnimation] = useState(false);
  const [copiedOrderNumber, setCopiedOrderNumber] = useState(false);

  useEffect(() => {
    const fetchOrder = async () => {
      // Lấy orderId từ param hoặc từ VNPay query (vnp_TxnRef)
      const orderId = orderIdFromParams || searchParams.get("orderId") || searchParams.get("vnp_TxnRef") || "";
      if (!orderId) {
        navigate("/");
        return;
      }
      try {
        const res = await api.get(`/orders/${orderId}`);
        setOrder(res.data?.order || res.data?.data?.order);
        setTimeout(() => setShowAnimation(true), 100);
      } catch (err: any) {
        toast.error("Không thể tải thông tin đơn hàng");
        navigate("/shop");
      } finally {
        setLoading(false);
      }
    };
    fetchOrder();
  }, [orderIdFromParams, searchParams, navigate]);

  const handleCopyOrderNumber = () => {
    if (order?.orderNumber) {
      navigator.clipboard.writeText(order.orderNumber);
      setCopiedOrderNumber(true);
      toast.success("Đã sao chép mã đơn hàng!");
      setTimeout(() => setCopiedOrderNumber(false), 2000);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const getEstimatedDelivery = () => {
    if (!order) return "";
    const orderDate = new Date(order.createdAt);
    const minDays = 3;
    const maxDays = 5;
    const minDate = new Date(orderDate);
    const maxDate = new Date(orderDate);
    minDate.setDate(minDate.getDate() + minDays);
    maxDate.setDate(maxDate.getDate() + maxDays);

    return `${minDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    })} - ${maxDate.toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    })}`;
  };

  const estimatedDelivery = getEstimatedDelivery();

  return {
    order,
    loading,
    showAnimation,
    copiedOrderNumber,
    estimatedDelivery,
    handleCopyOrderNumber,
    formatPrice,
  };
};
