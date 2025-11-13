// apps/customer-frontend/src/features/customer/pages/CheckoutConfirmationPage.tsx
// ✅ GĐ 5.R3: Trang mới để xử lý redirect từ VNPay

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
    Logger.debug(`[VNPAY-Return] Quay về cho Order ID: ${masterOrderId}`);
    Logger.debug(
      "[VNPAY-Return] Query Params:",
      Object.fromEntries(searchParams)
    );

    // Lấy các params quan trọng từ VNPay
    const vnp_ResponseCode = searchParams.get("vnp_ResponseCode");
    const vnp_TxnRef = searchParams.get("vnp_TxnRef");

    // 1. Kiểm tra mã giao dịch
    if (vnp_TxnRef !== masterOrderId) {
      Logger.error("[VNPAY-Return] Lỗi: masterOrderId không khớp vnp_TxnRef!");
      setStatus("failed");
      setMessage("Lỗi bảo mật: Mã đơn hàng không khớp.");
      return;
    }

    // (Trong tương lai, chúng ta nên gọi API backend /api/orders/verify/:masterOrderId
    // để kiểm tra trạng thái PAID trong DB thay vì chỉ dựa vào URL)

    // 2. Kiểm tra mã phản hồi
    if (vnp_ResponseCode === "00") {
      // Thành công
      Logger.info("[VNPAY-Return] Thanh toán THÀNH CÔNG (00).");
      setStatus("success");
      setMessage("Thanh toán thành công! Đơn hàng của bạn đang được xử lý.");
      // Xóa giỏ hàng
      clearCart();
    } else if (vnp_ResponseCode === "24") {
      // Khách hàng hủy giao dịch
      Logger.warn("[VNPAY-Return] Khách hàng hủy giao dịch (24).");
      setStatus("failed");
      setMessage("Giao dịch đã bị hủy. Vui lòng thử lại.");
    } else {
      // Các lỗi khác
      Logger.error(
        `[VNPAY-Return] Thanh toán THẤT BẠI (Code: ${vnp_ResponseCode})`
      );
      setStatus("failed");
      setMessage(
        `Thanh toán thất bại. (Mã lỗi: ${vnp_ResponseCode}). Vui lòng liên hệ hỗ trợ.`
      );
    }
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
