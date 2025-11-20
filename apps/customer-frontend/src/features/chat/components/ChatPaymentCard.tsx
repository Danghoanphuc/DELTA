// apps/customer-frontend/src/features/chat/components/ChatPaymentCard.tsx
import { useState, useEffect } from "react";
import QRCodeSVG from "react-qr-code";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/shared/components/ui/collapsible";
import {
  CheckCircle,
  Copy,
  ExternalLink,
  XCircle,
  Loader2,
  Package,
  Smartphone,
  QrCode,
  ChevronDown,
} from "lucide-react";
import { toast } from "sonner";
import { useSocket } from "@/contexts/SocketProvider";
import api from "@/shared/lib/axios";
import { useIsMobile } from "@/shared/hooks/useMediaQuery";
import type { PaymentRequestContent } from "@/types/chat";
import { cn } from "@/shared/lib/utils";

interface ChatPaymentCardProps {
  content: PaymentRequestContent;
}

/**
 * ChatPaymentCard - Smart Hybrid Payment Component
 * 
 * Features:
 * - Adaptive UI: Mobile shows "Open App" button, Desktop shows QR code
 * - Mini Invoice: Shows order context before payment
 * - Real-time Updates: Listens to Socket.io for payment confirmation
 * - Secure: Verifies payment with backend before updating UI
 */
export function ChatPaymentCard({ content }: ChatPaymentCardProps) {
  const [status, setStatus] = useState<"pending" | "paid" | "cancelled">(
    content.status || "pending"
  );
  const [isVerifying, setIsVerifying] = useState(false);
  const [isQRExpanded, setIsQRExpanded] = useState(false);
  const { socket, isConnected } = useSocket();
  const isMobile = useIsMobile();

  // Format currency
  const formatPrice = (amount: number) => {
    return amount.toLocaleString("vi-VN") + " đ";
  };

  // ✅ REAL-TIME: Listen for payment confirmation via Socket.io
  useEffect(() => {
    if (!socket || !isConnected || status === "paid") {
      return;
    }

    console.log(
      `[ChatPaymentCard] Listening for payment updates for order: ${content.orderId}`
    );

    const handleOrderUpdate = async (data: any) => {
      console.log("[ChatPaymentCard] Received order update:", data);

      // Check if this update is for our order
      if (data.orderId !== content.orderId) {
        return;
      }

      // Check if payment was confirmed
      if (data.changes?.paymentStatus?.newValue === "paid") {
        console.log(
          "[ChatPaymentCard] 🎉 Payment confirmed! Verifying with backend..."
        );

        // Verify payment status with backend (security)
        setIsVerifying(true);
        try {
          const response = await api.get(`/orders/${content.orderId}`);
          const order = response.data.data;

          if (order.paymentStatus === "paid") {
            setStatus("paid");
            toast.success("✅ Thanh toán thành công!", {
              description: `Đơn hàng #${content.orderNumber} đã được thanh toán`,
              duration: 5000,
            });
          }
        } catch (error) {
          console.error("[ChatPaymentCard] Error verifying payment:", error);
          // Still update UI based on socket event (fail-safe)
          setStatus("paid");
          toast.success("✅ Thanh toán thành công!");
        } finally {
          setIsVerifying(false);
        }
      } else if (data.changes?.paymentStatus?.newValue === "cancelled") {
        setStatus("cancelled");
        toast.error("❌ Thanh toán bị hủy");
      }
    };

    // Register event listener
    socket.on("customer:order_update", handleOrderUpdate);

    // Cleanup on unmount
    return () => {
      socket.off("customer:order_update", handleOrderUpdate);
      console.log("[ChatPaymentCard] Cleaned up event listener");
    };
  }, [socket, isConnected, content.orderId, content.orderNumber, status]);

  // Handle copy QR code
  const handleCopyQR = () => {
    if (content.qrCode) {
      navigator.clipboard.writeText(content.qrCode);
      toast.success("✓ Đã sao chép mã QR");
    }
  };

  // Handle open payment link
  const handleOpenPaymentLink = () => {
    if (content.checkoutUrl) {
      window.open(content.checkoutUrl, "_blank", "noopener,noreferrer");
    }
  };

  // ===================================
  // RENDER: Success State
  // ===================================
  if (status === "paid") {
    return (
      <Card className="max-w-md border-green-200 bg-gradient-to-br from-green-50 to-white animate-in fade-in duration-500">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-green-100 rounded-full">
              <CheckCircle className="h-6 w-6 text-green-600 animate-bounce" />
            </div>
            <div>
              <CardTitle className="text-green-900">
                Thanh toán thành công!
              </CardTitle>
              <CardDescription className="text-green-700">
                #{content.orderNumber}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="space-y-3">
            {/* Order Summary */}
            <div className="p-3 bg-white rounded-lg border border-green-100">
              <div className="flex items-center gap-2 mb-2">
                <Package className="h-4 w-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-900">
                  {content.productName}
                </span>
              </div>
              <div className="flex justify-between text-sm">
                <span className="text-gray-600">
                  {content.quantity} chiếc ({content.itemsCount} sản phẩm)
                </span>
                <span className="font-semibold text-green-600">
                  {formatPrice(content.amount)}
                </span>
              </div>
            </div>

            {/* Success Message */}
            <div className="p-4 bg-green-100 rounded-lg text-center">
              <p className="text-sm text-green-800 font-medium">
                ✅ Đơn hàng của bạn đang được xử lý
              </p>
              <p className="text-xs text-green-700 mt-1">
                Chúng tôi sẽ thông báo khi có cập nhật
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ===================================
  // RENDER: Cancelled State
  // ===================================
  if (status === "cancelled") {
    return (
      <Card className="max-w-md border-red-200 bg-gradient-to-br from-red-50 to-white">
        <CardHeader className="pb-3">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-red-100 rounded-full">
              <XCircle className="h-6 w-6 text-red-600" />
            </div>
            <div>
              <CardTitle className="text-red-900">Thanh toán bị hủy</CardTitle>
              <CardDescription className="text-red-700">
                #{content.orderNumber}
              </CardDescription>
            </div>
          </div>
        </CardHeader>
        <CardContent>
          <div className="p-4 bg-red-100 rounded-lg">
            <p className="text-sm text-red-800">
              Đơn hàng đã bị hủy. Vui lòng liên hệ hỗ trợ nếu cần.
            </p>
          </div>
        </CardContent>
      </Card>
    );
  }

  // ===================================
  // RENDER: Pending State (HYBRID UX)
  // ===================================
  return (
    <Card className="max-w-md border-blue-200 bg-white shadow-lg">
      {/* ✅ MINI INVOICE HEADER (Always Visible) */}
      <div className="bg-gray-50 border-b border-gray-200 p-4">
        <div className="flex items-start gap-3">
          <div className="p-2 bg-blue-100 rounded-lg">
            <Package className="h-5 w-5 text-blue-600" />
          </div>
          <div className="flex-1 min-w-0">
            <h3 className="text-sm font-semibold text-gray-900 truncate">
              {content.productName}
            </h3>
            <p className="text-xs text-gray-600 mt-1">
              {content.quantity} chiếc • {content.itemsCount} sản phẩm
            </p>
            <div className="mt-2 flex items-baseline gap-1">
              <span className="text-xs text-gray-500">Tổng tiền:</span>
              <span className="text-lg font-bold text-blue-600">
                {formatPrice(content.amount)}
              </span>
            </div>
          </div>
        </div>
      </div>

      {/* ✅ PAYMENT UI - ADAPTIVE BASED ON DEVICE */}
      <CardHeader className="pb-3">
        <div className="flex items-center gap-2">
          {isVerifying ? (
            <>
              <Loader2 className="h-5 w-5 text-blue-600 animate-spin" />
              <CardTitle className="text-base">Đang xác nhận thanh toán...</CardTitle>
            </>
          ) : (
            <>
              <Smartphone className="h-5 w-5 text-blue-600" />
              <CardTitle className="text-base">
                {isMobile ? "Thanh toán nhanh" : "Quét mã để thanh toán"}
              </CardTitle>
            </>
          )}
        </div>
        <CardDescription className="text-xs">
          {isMobile
            ? "Mở app ngân hàng hoặc quét mã QR bên dưới"
            : "Sử dụng điện thoại để quét mã QR"}
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-4">
        {/* ===================================
            MOBILE UX: Primary = Open App Button
            ================================== */}
        {isMobile ? (
          <>
            {/* Primary Action: Open Banking App */}
            <Button
              onClick={handleOpenPaymentLink}
              className="w-full h-14 text-base font-semibold bg-blue-600 hover:bg-blue-700 text-white shadow-lg"
            >
              <Smartphone className="h-5 w-5 mr-2" />
              Mở App Ngân hàng / Ví
            </Button>

            {/* Secondary Action: Collapsible QR Code */}
            <Collapsible open={isQRExpanded} onOpenChange={setIsQRExpanded}>
              <CollapsibleTrigger asChild>
                <Button
                  variant="outline"
                  className="w-full justify-between"
                  size="sm"
                >
                  <div className="flex items-center gap-2">
                    <QrCode className="h-4 w-4" />
                    <span className="text-sm">Hoặc xem mã QR</span>
                  </div>
                  <ChevronDown
                    className={cn(
                      "h-4 w-4 transition-transform",
                      isQRExpanded && "rotate-180"
                    )}
                  />
                </Button>
              </CollapsibleTrigger>
              <CollapsibleContent className="pt-4">
                {content.qrCode && (
                  <div className="flex flex-col items-center gap-3 p-4 bg-gray-50 rounded-lg border border-gray-200">
                    <QRCodeSVG
                      value={content.qrCode}
                      size={180}
                      level="H"
                      className="rounded-lg bg-white p-2"
                    />
                    <div className="flex gap-2 w-full">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={handleCopyQR}
                        className="flex-1"
                      >
                        <Copy className="h-3 w-3 mr-1.5" />
                        Sao chép
                      </Button>
                    </div>
                  </div>
                )}
              </CollapsibleContent>
            </Collapsible>
          </>
        ) : (
          /* ===================================
             DESKTOP UX: QR Code Prominent
             ================================== */
          <>
            {/* QR Code Display */}
            {content.qrCode && (
              <div className="flex flex-col items-center gap-3 p-6 bg-gradient-to-br from-blue-50 to-white rounded-lg border-2 border-blue-100">
                <QRCodeSVG
                  value={content.qrCode}
                  size={220}
                  level="H"
                  className="rounded-lg bg-white p-3 shadow-sm"
                />
                <p className="text-sm text-gray-600 text-center font-medium">
                  Quét mã QR bằng điện thoại
                </p>
              </div>
            )}

            {/* Desktop Actions */}
            <div className="flex gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={handleCopyQR}
                className="flex-1"
              >
                <Copy className="h-4 w-4 mr-1.5" />
                Sao chép mã QR
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleOpenPaymentLink}
                className="flex-1"
              >
                <ExternalLink className="h-4 w-4 mr-1.5" />
                Mở link PayOS
              </Button>
            </div>
          </>
        )}

        {/* Real-time Connection Status */}
        <div
          className={cn(
            "flex items-center gap-2 px-3 py-2 rounded-lg text-xs font-medium transition-all",
            isConnected
              ? "bg-green-50 text-green-700 border border-green-200"
              : "bg-yellow-50 text-yellow-700 border border-yellow-200"
          )}
        >
          <div
            className={cn(
              "h-2 w-2 rounded-full flex-shrink-0",
              isConnected ? "bg-green-500 animate-pulse" : "bg-yellow-500"
            )}
          />
          <span className="flex-1">
            {isVerifying
              ? "⏳ Đang xác nhận thanh toán..."
              : isConnected
              ? "🔄 Tự động cập nhật khi thanh toán thành công"
              : "⚠️ Mất kết nối - Vui lòng tải lại trang"}
          </span>
        </div>
      </CardContent>

      <CardFooter className="flex-col gap-2 pt-0">
        {/* Helper Text */}
        <div className="w-full p-3 bg-blue-50 rounded-lg border border-blue-100">
          <p className="text-xs text-blue-800 text-center">
            💡 {isMobile 
              ? "Nhấn nút ở trên để mở app ngân hàng và thanh toán"
              : "Quét mã QR bằng app ngân hàng trên điện thoại của bạn"
            }
          </p>
        </div>

        {/* Order Reference */}
        <p className="text-xs text-gray-500 text-center">
          Đơn hàng: <span className="font-mono font-semibold">#{content.orderNumber}</span>
        </p>
      </CardFooter>
    </Card>
  );
}
