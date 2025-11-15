import axiosClient from '@/shared/lib/axios';

interface VNPayPaymentData {
  cartId: string;
  shippingAddress: any;
}

export const vnpayCreatePayment = async (
  cartId: string,
  shippingAddress: any
): Promise<{ paymentUrl: string }> => {
  try {
    // ✅ SỬA: Endpoint đúng là /checkout/vnpay/create-payment-url
    const response = await axiosClient.post('/checkout/vnpay/create-payment-url', {
      shippingAddress,
      // Backend sẽ tự động lấy cart từ user, không cần truyền cartId
    });
    
    // Backend trả về: { success: true, data: { paymentUrl, masterOrderId, totalAmount } }
    return {
      paymentUrl: response.data.data.paymentUrl || response.data.paymentUrl,
    };
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Không thể tạo thanh toán VNPay'
    );
  }
};

export const vnpayVerifyPayment = async (queryParams: string) => {
  try {
    const response = await axiosClient.get(`/payment/vnpay/verify?${queryParams}`);
    return response.data;
  } catch (error: any) {
    throw new Error(
      error.response?.data?.message || 'Xác thực thanh toán VNPay thất bại'
    );
  }
};
