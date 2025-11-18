// apps/customer-frontend/src/features/customer/pages/CheckoutConfirmationPage.tsx
// ✅ Trang xác nhận kết quả thanh toán (MoMo/Stripe/COD)

import React, { useEffect, useState } from "react";
import { useParams, useSearchParams, useNavigate } from "react-router-dom";
import { useCartStore } from "@/stores/useCartStore";
import { Logger } from "@/shared/utils/logger.util";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { CheckCircle2, XCircle, Loader2 } from "lucide-react";

// (FIXME: Cần tạo 1 service (ví dụ: orderService) để gọi API
// xác nhận đơn hàng, nhưng hiện tại ta dựa vào query params)

const CheckoutConfirmationPage: React.FC = () => {
  const { masterOrderId } = useParams<{ masterOrderId: string }>();
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const clearCart = useCartStore((state) => state.clearCart);

  // State
  const [status, setStatus] = useState<
    "loading" | "success" | "failed" | "pending"
  >("loading");
  const [message, setMessage] = useState("Đang xác thực thanh toán...");

  useEffect(() => {
    Logger.debug(`[PAY-Return] Quay về cho Order ID: ${masterOrderId}`);
    Logger.debug("[PAY-Return] Query Params:", Object.fromEntries(searchParams));

    const orderId = searchParams.get("orderId"); // MoMo
    const resultCode = searchParams.get("resultCode"); // MoMo: '0' = success

    if (orderId && masterOrderId && orderId !== masterOrderId) {
      Logger.error("[PAY-Return] Lỗi: orderId không khớp masterOrderId!");
      setStatus("failed");
      setMessage("Lỗi xác thực đơn hàng.");
      return;
    }

    if (resultCode === "0") {
      Logger.info("[PAY-Return] Thanh toán THÀNH CÔNG.");
      setStatus("success");
      setMessage("Thanh toán thành công! Đơn hàng của bạn đang được xử lý.");
      clearCart();
      return;
    }

    if (resultCode === "49") {
      Logger.warn("[PAY-Return] Khách hàng hủy giao dịch (49)");
      setStatus("failed");
      setMessage("Giao dịch đã bị hủy. Vui lòng thử lại.");
      return;
    }

    // Không có resultCode (ví dụ redirect qua BE về trang my-orders)
    setStatus("success");
    setMessage("Nếu đơn hàng chưa hiển thị, vui lòng tải lại trang hoặc kiểm tra email.");
  }, [masterOrderId, searchParams, clearCart]);

  const renderIcon = () => {
    if (status === "loading") {
      return <Loader2 className="h-16 w-16 animate-spin text-blue-500" />;
    }
    if (status === "success") {
      return <CheckCircle2 className="h-16 w-16 text-green-500" />;
    }
    if (status === "failed") {
      return <XCircle className="h-16 w-16 text-red-500" />;
    }
    return null;
  };

  return (
    <div className="container mx-auto flex min-h-[60vh] items-center justify-center p-4 py-12">
      <Card className="w-full max-w-lg">
        <CardHeader>
          <CardTitle className="text-center text-2xl">
            Kết quả Thanh toán
          </CardTitle>
        </CardHeader>
        <CardContent className="flex flex-col items-center gap-6 text-center">
          {renderIcon()}
          <p className="text-lg font-medium">{message}</p>
          <p className="text-sm text-muted-foreground">
            Mã đơn hàng của bạn: {masterOrderId}
          </p>

          {status === "success" && (
            <Button onClick={() => navigate(`/my-orders/${masterOrderId}`)}>
              Xem Chi tiết Đơn hàng
            </Button>
          )}

          {status === "failed" && (
            <Button variant="outline" onClick={() => navigate("/checkout")}>
              Thử lại Thanh toán
            </Button>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default CheckoutConfirmationPage;
