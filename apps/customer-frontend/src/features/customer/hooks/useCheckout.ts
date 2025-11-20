import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { toast } from 'sonner';
import axiosClient from '@/shared/lib/axios';
import { useCartStore } from '@/stores/useCartStore';

interface CheckoutData {
  shippingAddress: any;
  billingAddress?: any;
  paymentMethod: 'stripe' | 'momo' | 'cod';
}

export const useCheckout = () => {
  const [isProcessing, setIsProcessing] = useState(false);
  const navigate = useNavigate();
  const clearCart = useCartStore((state) => state.clearCart);

  const createOrderAndPaymentIntent = async (cartId: string) => {
    try {
      const response = await axiosClient.post('/checkout/create-payment-intent', {
        cartId,
      });
      // ✅ Backend returns: { success: true, data: { clientSecret, masterOrderId, ... } }
      const result = response.data.data || response.data;
      return {
        clientSecret: result.clientSecret,
        masterOrderId: result.masterOrderId,
      };
    } catch (error: any) {
      throw new Error(error.response?.data?.message || 'Failed to create payment intent');
    }
  };

  const processCheckout = async (checkoutData: CheckoutData) => {
    setIsProcessing(true);
    try {
      const response = await axiosClient.post('/checkout/process', checkoutData);
      
      // ✅ Backend returns: { success: true, data: { masterOrderId, ... } }
      const result = response.data.data || response.data;
      
      if (response.data.success) {
        toast.success('Đặt hàng thành công!');
        
        // ✅ Clear cart for COD immediately (backend already cleared it)
        if (checkoutData.paymentMethod === 'cod') {
          try {
            await clearCart();
          } catch (error) {
            console.warn('Failed to sync cart clear with backend:', error);
          }
        }
        
        // Navigate based on payment method
        if (checkoutData.paymentMethod === 'momo' && result.paymentUrl) {
          window.location.href = result.paymentUrl;
        } else {
          navigate(`/checkout/confirmation/${result.masterOrderId}`);
        }
      }
      
      return result;
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
