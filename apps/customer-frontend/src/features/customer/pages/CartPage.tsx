import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/useCartStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/shared/components/ui/button';
import { ShippingCalculator } from '../components/ShippingCalculator';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { Trash2, Minus, Plus, ShoppingBag, ArrowRight } from 'lucide-react';
import { toast } from 'sonner';

const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAuthenticated = !!user;
  const [shippingFee, setShippingFee] = useState(0);
  const {
    cart,
    isLoading,
    fetchCart,
    updateCartItem,
    removeFromCart,
    clearCart,
  } = useCartStore();

  useEffect(() => {
    fetchCart();
  }, [fetchCart]);

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await updateCartItem(itemId, quantity);
      toast.success('Cập nhật số lượng thành công');
    } catch (error) {
      toast.error('Không thể cập nhật số lượng');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
      toast.success('Đã xóa sản phẩm khỏi giỏ hàng');
    } catch (error) {
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
      try {
        await clearCart();
        toast.success('Đã xóa toàn bộ giỏ hàng');
      } catch (error) {
        toast.error('Không thể xóa giỏ hàng');
      }
    }
  };

  const handleCheckout = () => {
    if (!isAuthenticated) {
      toast.info('Vui lòng đăng nhập để thanh toán');
      navigate('/signin', { state: { from: '/checkout' } });
      return;
    }
    navigate('/checkout');
  };

  if (isLoading) {
    return (
      <div className="container mx-auto px-4 py-8">
        <div className="animate-pulse space-y-4">
          <div className="h-8 bg-gray-200 rounded w-1/4"></div>
          <div className="h-64 bg-gray-200 rounded"></div>
        </div>
      </div>
    );
  }

  const items = cart?.items || [];
  const totalAmount = cart?.totalAmount || 0;
  const finalTotal = totalAmount + shippingFee;

  if (items.length === 0) {
    return (
      <div className="container mx-auto px-4 py-16">
        <Card className="max-w-md mx-auto text-center">
          <CardContent className="pt-12 pb-8">
            <div className="relative mb-6">
              <ShoppingBag className="mx-auto h-20 w-20 text-gray-300 animate-pulse-slow" />
              <div className="absolute inset-0 flex items-center justify-center">
                <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin" />
              </div>
            </div>
            <h2 className="text-2xl font-bold mb-2 text-gray-800">
              Giỏ hàng trống
            </h2>
            <p className="text-gray-600 mb-8">
              Chưa có sản phẩm nào trong giỏ hàng của bạn. Hãy bắt đầu khám phá
              những sản phẩm tuyệt vời!
            </p>
            <Button asChild size="lg" className="hover-lift">
              <Link to="/shop">Tiếp tục mua sắm</Link>
            </Button>
          </CardContent>
        </Card>
      </div>
    );
  }

  return (
    <div className="container mx-auto px-4 py-8">
      <div className="flex justify-between items-center mb-6">
        <h1 className="text-3xl font-bold">Giỏ hàng ({items.length})</h1>
        <Button variant="outline" onClick={handleClearCart}>
          Xóa tất cả
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        <div className="lg:col-span-2 space-y-4">
          {items.map((item) => (
            <Card key={item._id}>
              <CardContent className="p-4">
                <div className="flex items-center gap-4">
                  <img
                    src={item.product?.images?.[0]?.url || '/placeholder.png'}
                    alt={item.product?.name || 'Product'}
                    className="w-24 h-24 object-cover rounded-lg"
                  />
                  
                  <div className="flex-1">
                    <Link
                      to={`/product/${item.product?.slug || item.productId}`}
                      className="text-lg font-semibold hover:underline"
                    >
                      {item.product?.name || 'Sản phẩm'}
                    </Link>
                    <p className="text-gray-600">
                      {item.product?.printerProfile?.displayName || ''}
                    </p>
                    <p className="text-2xl font-bold mt-2">
                      {(item.subtotal || 0).toLocaleString('vi-VN')}₫
                    </p>
                  </div>

                  <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                    disabled={item.quantity <= 1}
                    className="micro-bounce"
                    aria-label="Giảm số lượng"
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <span className="w-12 text-center font-medium" aria-label={`Số lượng: ${item.quantity}`}>
                    {item.quantity}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="icon"
                    onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                    className="micro-bounce"
                    aria-label="Tăng số lượng"
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                  </div>

                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => handleRemoveItem(item._id)}
                    className="micro-bounce hover:bg-red-50"
                    aria-label={`Xóa ${item.product?.name || "sản phẩm"} khỏi giỏ hàng`}
                  >
                    <Trash2 className="h-5 w-5 text-red-500" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        <div className="lg:col-span-1">
          <Card>
            <CardHeader>
              <CardTitle>Tổng đơn hàng</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Tạm tính</span>
                  <span>{totalAmount.toLocaleString('vi-VN')}₫</span>
                </div>
                <div className="flex justify-between">
                  <span>Phí vận chuyển</span>
                  <span>
                    {shippingFee > 0
                      ? `${shippingFee.toLocaleString('vi-VN')}₫`
                      : 'Tính khi thanh toán'}
                  </span>
                </div>
                <Separator className="my-4" />
                <div className="flex justify-between font-bold text-lg">
                  <span>Tổng cộng</span>
                  <span>{finalTotal.toLocaleString('vi-VN')}₫</span>
                </div>
              </div>
            </CardContent>
            <CardFooter className="flex-col gap-4">
              <ShippingCalculator
                totalAmount={totalAmount}
                onShippingChange={setShippingFee}
              />
              <Button 
                className="w-full" 
                size="lg"
                onClick={handleCheckout}
              >
                Tiến hành thanh toán
                <ArrowRight className="ml-2 h-4 w-4" />
              </Button>
            </CardFooter>
          </Card>
        </div>
      </div>
    </div>
  );
};

export { CartPage };
