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
    const response = await axiosClient.post('/payment/vnpay/create', {
      cartId,
      shippingAddress,
    });
    
    return {
      paymentUrl: response.data.paymentUrl,
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
