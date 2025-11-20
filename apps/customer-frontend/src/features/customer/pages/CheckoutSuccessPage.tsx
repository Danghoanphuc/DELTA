import React, { useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { useCartStore } from '@/stores/useCartStore';

const CheckoutSuccessPage = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const clearCart = useCartStore((state) => state.clearCart);
  
  useEffect(() => {
    // ✅ Clear cart IMMEDIATELY when payment succeeds
    const handleSuccess = async () => {
      try {
        await clearCart();
        console.log('[CheckoutSuccess] Cart cleared successfully');
      } catch (error) {
        console.warn('[CheckoutSuccess] Failed to clear cart:', error);
      }

      // Get orderId from URL params (PayOS returns this in returnUrl)
      const orderId = searchParams.get('orderId');
      
      if (orderId) {
        // Redirect to order confirmation page
        navigate(`/checkout/confirmation/${orderId}`, { replace: true });
      } else {
        // If no orderId, redirect to orders page after a delay
        setTimeout(() => {
          navigate('/orders', { replace: true });
        }, 3000);
      }
    };

    handleSuccess();
  }, [navigate, searchParams, clearCart]);

  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-50">
      <div className="p-8 bg-white rounded-lg shadow-md text-center max-w-md w-full">
        <div className="w-16 h-16 bg-green-100 rounded-full flex items-center justify-center mx-auto mb-4 animate-bounce">
          <svg className="w-8 h-8 text-green-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M5 13l4 4L19 7"></path>
          </svg>
        </div>
        <h1 className="text-2xl font-bold text-green-600 mb-4">Thanh toán thành công!</h1>
        <p className="mb-6 text-gray-600">Đang chuyển đến trang xác nhận đơn hàng...</p>
        <div className="flex items-center justify-center">
          <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
        </div>
      </div>
    </div>
  );
};

export default CheckoutSuccessPage;

