// apps/customer-frontend/src/services/checkoutService.ts
// ✅ GĐ 5.R3 (FIX): Sửa lỗi import từ "protectedApi" thành "api"

// SỬA LỖI: Đổi import { protectedApi } thành import api
import api from "@/shared/lib/axios";
import { Logger } from "@/shared/utils/logger.util";

// Kiểu dữ liệu cho payload (giả định, Phúc có thể mở rộng)
interface ICheckoutPayload {
  cartItems: any[]; // (FIXME: Dùng type ICartItem)
  shippingAddress: any; // (FIXME: Dùng type IAddress)
}

// Kiểu trả về của Stripe
interface IStripeIntentResponse {
  clientSecret: string;
  masterOrderId: string;
  totalAmount: number;
}

// Kiểu trả về của VNPay
interface IVnPayUrlResponse {
  paymentUrl: string;
  masterOrderId: string;
  totalAmount: number;
}

/**
 * Gọi API backend để tạo Stripe Payment Intent (cho thanh toán quốc tế)
 */
const createStripePaymentIntent = async (
  payload: ICheckoutPayload
): Promise<IStripeIntentResponse> => {
  try {
    Logger.debug("[CheckoutSvc-FE] Đang gọi API (Stripe)...", payload);
    // SỬA LỖI: Đổi protectedApi.post thành api.post
    const response = await api.post(
      "/checkout/stripe/create-payment-intent",
      payload
    );
    Logger.debug("[CheckoutSvc-FE] Nhận client secret:", response.data.data);
    return response.data.data;
  } catch (error) {
    Logger.error("[CheckoutSvc-FE] Lỗi khi tạo Stripe Payment Intent:", error);
    throw error;
  }
};

/**
 * Gọi API backend để tạo URL thanh toán VNPay (cho thanh toán nội địa)
 */
const createVnPayUrl = async (
  payload: ICheckoutPayload
): Promise<IVnPayUrlResponse> => {
  try {
    Logger.debug("[CheckoutSvc-FE] Đang gọi API (VNPay)...", payload);
    // SỬA LỖI: Đổi protectedApi.post thành api.post
    const response = await api.post(
      "/checkout/vnpay/create-payment-url",
      payload
    );
    Logger.debug("[CheckoutSvc-FE] Nhận VNPay URL:", response.data.data);
    return response.data.data;
  } catch (error) {
    Logger.error("[CheckoutSvc-FE] Lỗi khi tạo VNPay URL:", error);
    throw error;
  }
};

export const checkoutService = {
  createStripePaymentIntent,
  createVnPayUrl,
};
