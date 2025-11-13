// apps/customer-frontend/src/features/customer/components/PaymentForm.tsx
import { useState } from "react";
import {
  PaymentElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/shared/components/ui/button";
import { Loader2, Lock } from "lucide-react";
import { toast } from "sonner";
import { useCartStore } from "@/stores/useCartStore"; // Import để xóa giỏ hàng

interface PaymentFormProps {
  masterOrderId: string;
  clientUrl: string; // Lấy từ .env
}

export function PaymentForm({ masterOrderId, clientUrl }: PaymentFormProps) {
  const stripe = useStripe();
  const elements = useElements();
  const clearCart = useCartStore((s) => s.clearCart); // Lấy hàm xóa giỏ hàng

  const [isLoading, setIsLoading] = useState(false);
  const [errorMessage, setErrorMessage] = useState<string | null>(null);

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!stripe || !elements) {
      // Stripe.js chưa load
      return;
    }

    setIsLoading(true);
    setErrorMessage(null);

    // URL mà Stripe sẽ redirect người dùng đến SAU KHI thanh toán thành công
    // Đây chính là trang OrderConfirmationPage
    const return_url = `${clientUrl}/order-confirmation/${masterOrderId}`;

    try {
      // (Xóa giỏ hàng ngay trước khi xác nhận thanh toán)
      // Backend đã xóa, nhưng chúng ta xóa cả ở state
      await clearCart();

      const { error } = await stripe.confirmPayment({
        elements,
        confirmParams: {
          return_url: return_url,
        },
      });

      // Lỗi này CHỈ xảy ra nếu có lỗi phía client (vd: thẻ không hợp lệ)
      // Nếu thành công, người dùng sẽ bị ĐIỀU HƯỚNG đi, code dưới đây không chạy
      if (error.type === "card_error" || error.type === "validation_error") {
        setErrorMessage(error.message || "Lỗi thẻ không hợp lệ.");
        toast.error(error.message || "Lỗi thẻ không hợp lệ.");
      } else {
        setErrorMessage("Đã xảy ra lỗi không mong muốn.");
        toast.error("Đã xảy ra lỗi không mong muốn.");
      }
    } catch (submitError: any) {
      setErrorMessage(submitError.message);
      toast.error(submitError.message);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <form id="payment-form" onSubmit={handleSubmit}>
      <div className="space-y-6">
        {/* Stripe Payment Element (Form thẻ, Apple Pay, Google Pay...) */}
        <PaymentElement id="payment-element" />

        {errorMessage && (
          <div className="text-sm text-red-600" id="payment-message">
            {errorMessage}
          </div>
        )}

        <Button
          disabled={isLoading || !stripe || !elements}
          id="submit"
          className="w-full bg-green-600 hover:bg-green-700"
          size="lg"
        >
          {isLoading ? (
            <Loader2 className="w-5 h-5 animate-spin" />
          ) : (
            <>
              <Lock size={18} className="mr-2" />
              Thanh toán ngay
            </>
          )}
        </Button>
      </div>
    </form>
  );
}
