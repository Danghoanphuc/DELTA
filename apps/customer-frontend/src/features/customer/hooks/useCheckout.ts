import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axiosClient from '@/shared/lib/axios';

interface CheckoutData {
  shippingAddress: any;
  billingAddress?: any;
  paymentMethod: 'stripe' | 'vnpay' | 'cod';
}

export const useCheckout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();

  const createOrderAndPaymentIntent = async (cartId: string) => {
    try {
      const response = await axiosClient.post('/checkout/create-payment-intent', {
        cartId,
      });
      return {
        clientSecret: response.data.clientSecret,
        masterOrderId: response.data.masterOrderId,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create payment intent');
    }
  };

  const processCheckout = async (checkoutData: CheckoutData) => {
    setIsProcessing(true);
    try {
      const response = await axiosClient.post('/checkout/process', checkoutData);
      
      if (response.data.success) {
        toast.success('Đặt hàng thành công!');
        
        if (checkoutData.paymentMethod === 'vnpay' && response.data.paymentUrl) {
          window.location.href = response.data.paymentUrl;
        } else {
          navigate(`/checkout/confirmation/${response.data.masterOrderId}`);
        }
      }
      
      return response.data;
    } catch (error: any) {
      toast.error('Đặt hàng thất bại', {
        description: error.response?.data?.message || 'Vui lòng thử lại',
      });
      throw error;
    } finally {
      setIsProcessing(false);
    }
  };

  return {
    createOrderAndPaymentIntent,
    processCheckout,
    isProcessing,
  };
};
