// apps/customer-frontend/src/features/customer/pages/CartPage.tsx

import { useEffect, useState, useMemo } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useCartStore } from '@/stores/useCartStore';
import { useAuthStore } from '@/stores/useAuthStore';
import { Button } from '@/shared/components/ui/button';
import { Input } from '@/shared/components/ui/input';
import { ShippingCalculator } from '../components/ShippingCalculator';
import {
  Card,
  CardContent,
  CardFooter,
  CardHeader,
  CardTitle,
} from '@/shared/components/ui/card';
import { Separator } from '@/shared/components/ui/separator';
import { 
  Trash2, Minus, Plus, ShoppingBag, ArrowRight, 
  Truck, ShieldCheck, Gift, ArrowLeft 
} from 'lucide-react';
import { toast } from "@/shared/utils/toast";
import { motion, AnimatePresence } from 'framer-motion';
import { cn } from '@/shared/lib/utils';
import { Progress } from '@/shared/components/ui/progress';

// Cấu hình mức Freeship (Ví dụ: 1 triệu đ)
const FREE_SHIPPING_THRESHOLD = 1000000;

export const CartPage = () => {
  const navigate = useNavigate();
  const { user } = useAuthStore();
  const isAuthenticated = !!user;
  
  const [editingQuantities, setEditingQuantities] = useState<Record<string, string>>({});
  const [shippingFee, setShippingFee] = useState(0);
  const [couponCode, setCouponCode] = useState(""); // UI only
  
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

  // --- Logic Freeship Progress ---
  const totalAmount = cart?.totalAmount || 0;
  const progressPercentage = Math.min(100, (totalAmount / FREE_SHIPPING_THRESHOLD) * 100);
  const remainingForFreeShip = Math.max(0, FREE_SHIPPING_THRESHOLD - totalAmount);
  // -------------------------------

  const handleUpdateQuantity = async (itemId: string, quantity: number) => {
    if (quantity < 1) return;
    try {
      await updateCartItem(itemId, quantity);
    } catch (error) {
      toast.error('Không thể cập nhật số lượng');
    }
  };

  const handleRemoveItem = async (itemId: string) => {
    try {
      await removeFromCart(itemId);
    } catch (error) {
      toast.error('Không thể xóa sản phẩm');
    }
  };

  const handleClearCart = async () => {
    if (window.confirm('Bạn có chắc muốn xóa toàn bộ giỏ hàng?')) {
      try {
        await clearCart();
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

  const items = cart?.items || [];
  const finalTotal = totalAmount + shippingFee;

  // --- EMPTY STATE (JUICY) ---
  if (!isLoading && items.length === 0) {
    return (
      <div className="min-h-[80vh] flex items-center justify-center bg-gray-50/50">
        <div className="text-center p-8 max-w-md animate-in zoom-in-95 duration-500">
          <div className="relative w-32 h-32 mx-auto mb-6">
            <div className="absolute inset-0 bg-blue-100 rounded-full animate-ping opacity-20"></div>
            <div className="relative bg-white p-6 rounded-full shadow-xl border border-blue-50">
               <ShoppingBag className="w-full h-full text-blue-600" strokeWidth={1.5} />
            </div>
          </div>
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Giỏ hàng đang đói bụng!</h2>
          <p className="text-gray-500 mb-8 leading-relaxed">
            Chưa có sản phẩm nào. Hãy lấp đầy nó bằng những ý tưởng thiết kế tuyệt vời của bạn.
          </p>
          <Button asChild size="lg" className="rounded-full px-8 shadow-lg shadow-blue-500/20 hover:shadow-blue-500/30 transition-all">
            <Link to="/shop">
              Khám phá ngay <ArrowRight className="ml-2 w-4 h-4" />
            </Link>
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50/30 pb-20">
      <div className="container mx-auto max-w-7xl px-4 py-8 md:py-12">
        
        {/* Header & Back */}
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-8">
          <div>
             <Button variant="link" asChild className="px-0 text-gray-500 hover:text-blue-600 mb-1">
                <Link to="/shop"><ArrowLeft size={16} className="mr-1" /> Tiếp tục mua sắm</Link>
             </Button>
             <h1 className="text-3xl font-bold text-gray-900 tracking-tight">Giỏ hàng của bạn</h1>
             <p className="text-gray-500 mt-1">{items.length} sản phẩm trong giỏ</p>
          </div>
          
          {items.length > 0 && (
             <Button variant="ghost" onClick={handleClearCart} className="text-red-500 hover:text-red-600 hover:bg-red-50">
               <Trash2 size={16} className="mr-2" /> Làm trống giỏ
             </Button>
          )}
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start">
          
          {/* === LEFT COLUMN: ITEMS LIST (8/12) === */}
          <div className="lg:col-span-8 space-y-6">
            
            {/* 🔥 FEATURE: FREE SHIPPING PROGRESS BAR */}
            <div className="bg-white p-5 rounded-2xl border border-blue-100 shadow-sm">
               <div className="flex items-center gap-3 mb-3">
                  <div className="p-2 bg-blue-100 rounded-full text-blue-600">
                     <Truck size={20} />
                  </div>
                  <div className="flex-1">
                     {remainingForFreeShip > 0 ? (
                       <p className="text-sm font-medium text-gray-700">
                         Mua thêm <span className="text-blue-600 font-bold">{remainingForFreeShip.toLocaleString('vi-VN')}₫</span> để được <span className="text-green-600 font-bold uppercase">Freeship</span>
                       </p>
                     ) : (
                       <p className="text-sm font-bold text-green-600 flex items-center gap-1">
                         🎉 Chúc mừng! Bạn đã được Miễn phí vận chuyển
                       </p>
                     )}
                  </div>
               </div>
               <Progress value={progressPercentage} className="h-2 bg-gray-100" />
            </div>

            {/* ITEMS LIST with Animation */}
            <div className="space-y-4">
              <AnimatePresence mode='popLayout'>
                {items.map((item) => (
                  <motion.div
                    layout
                    key={item._id}
                    initial={{ opacity: 0, y: 20 }}
                    animate={{ opacity: 1, y: 0 }}
                    exit={{ opacity: 0, x: -100, transition: { duration: 0.2 } }}
                    className="group bg-white p-4 sm:p-5 rounded-2xl border border-gray-100 shadow-sm hover:shadow-md transition-all duration-300"
                  >
                    <div className="flex gap-4 sm:gap-6">
                      {/* Image */}
                      <div className="w-24 h-24 sm:w-32 sm:h-32 flex-shrink-0 bg-gray-50 rounded-xl overflow-hidden border border-gray-100 relative">
                        <img
                          src={item.product?.images?.[0]?.url || '/placeholder.png'}
                          alt={item.product?.name}
                          className="w-full h-full object-cover group-hover:scale-105 transition-transform duration-500"
                        />
                      </div>

                      {/* Content */}
                      <div className="flex-1 flex flex-col justify-between py-1">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <div>
                               <Link to={`/product/${item.product?.slug || item.productId}`} className="font-bold text-gray-900 hover:text-blue-600 line-clamp-1 text-lg transition-colors">
                                 {item.product?.name}
                               </Link>
                               <p className="text-sm text-gray-500 mt-1 flex items-center gap-2">
                                 {item.product?.printerProfile?.displayName || 'Printz Partner'}
                                 {/* Badge tùy chỉnh */}
                                 {item.customization && <span className="px-1.5 py-0.5 bg-purple-50 text-purple-700 rounded text-[10px] font-semibold uppercase tracking-wide">Custom</span>}
                               </p>
                            </div>
                            <p className="font-bold text-lg text-blue-600 whitespace-nowrap">
                              {(item.subtotal || 0).toLocaleString('vi-VN')}₫
                            </p>
                          </div>
                        </div>

                        {/* Actions Footer */}
                        <div className="flex items-center justify-between mt-4">
                          {/* Quantity */}
                          <div className="flex items-center bg-gray-50 rounded-lg border border-gray-200 p-1">
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-white hover:shadow-sm"
                              onClick={() => handleUpdateQuantity(item._id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus size={14} />
                            </Button>
                            <Input
                              className="w-12 h-7 border-none bg-transparent text-center p-0 focus-visible:ring-0 font-semibold text-gray-900"
                              value={editingQuantities[item._id] ?? item.quantity}
                              onChange={(e) => setEditingQuantities(prev => ({ ...prev, [item._id]: e.target.value }))}
                              onBlur={(e) => {
                                const newQty = Math.max(1, parseInt(e.target.value) || 1);
                                if (newQty !== item.quantity) handleUpdateQuantity(item._id, newQty);
                                setEditingQuantities(prev => { const updated = {...prev}; delete updated[item._id]; return updated; });
                              }}
                              onKeyDown={(e) => e.key === 'Enter' && e.currentTarget.blur()}
                            />
                            <Button
                              variant="ghost" size="icon" className="h-7 w-7 rounded-md hover:bg-white hover:shadow-sm"
                              onClick={() => handleUpdateQuantity(item._id, item.quantity + 1)}
                            >
                              <Plus size={14} />
                            </Button>
                          </div>

                          {/* Delete */}
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => handleRemoveItem(item._id)}
                            className="text-gray-400 hover:text-red-600 hover:bg-red-50 transition-colors"
                          >
                            <Trash2 size={18} />
                          </Button>
                        </div>
                      </div>
                    </div>
                  </motion.div>
                ))}
              </AnimatePresence>
            </div>
          </div>

          {/* === RIGHT COLUMN: SUMMARY (4/12) - STICKY === */}
          <div className="lg:col-span-4">
            <div className="sticky top-6 space-y-6">
              <Card className="shadow-lg shadow-gray-200/50 border-gray-200 overflow-hidden">
                <CardHeader className="bg-gray-50/50 pb-4">
                  <CardTitle>Tổng đơn hàng</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4 pt-6">
                  <div className="space-y-3">
                    <div className="flex justify-between text-gray-600">
                      <span>Tạm tính</span>
                      <span className="font-medium text-gray-900">{totalAmount.toLocaleString('vi-VN')}₫</span>
                    </div>
                    
                    <ShippingCalculator
                       totalAmount={totalAmount}
                       onShippingChange={setShippingFee}
                    />
                    
                    {/* Coupon Input (UI Only) */}
                    <div className="pt-2">
                       <div className="flex gap-2">
                          <div className="relative flex-1">
                             <Gift className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-4 h-4" />
                             <Input 
                               placeholder="Mã giảm giá" 
                               className="pl-9 bg-gray-50 border-dashed" 
                               value={couponCode}
                               onChange={(e) => setCouponCode(e.target.value)}
                             />
                          </div>
                          <Button variant="outline" disabled={!couponCode}>Áp dụng</Button>
                       </div>
                    </div>
                  </div>
                  
                  <Separator />
                  
                  <div className="flex justify-between items-end">
                    <span className="font-bold text-lg">Tổng cộng</span>
                    <div className="text-right">
                       <span className="block text-2xl font-bold text-blue-600">{finalTotal.toLocaleString('vi-VN')}₫</span>
                       <span className="text-xs text-gray-500">(Đã bao gồm VAT)</span>
                    </div>
                  </div>
                </CardContent>
                
                <CardFooter className="flex-col gap-4 bg-gray-50/30 p-6 pt-2">
                  <Button 
                    className="w-full h-14 text-lg shadow-lg shadow-blue-600/20 hover:shadow-blue-600/30 transition-all" 
                    size="lg"
                    onClick={handleCheckout}
                  >
                    Tiến hành thanh toán <ArrowRight className="ml-2 h-5 w-5" />
                  </Button>
                  
                  {/* Trust Signals */}
                  <div className="grid grid-cols-2 gap-2 w-full text-[10px] text-gray-500 mt-2">
                     <div className="flex items-center justify-center gap-1.5 bg-white p-2 rounded border border-gray-100">
                        <ShieldCheck className="text-green-600 w-4 h-4" /> Bảo mật SSL
                     </div>
                     <div className="flex items-center justify-center gap-1.5 bg-white p-2 rounded border border-gray-100">
                        <Truck className="text-blue-600 w-4 h-4" /> Hoàn tiền lỗi in
                     </div>
                  </div>
                </CardFooter>
              </Card>
              
              {/* Upsell / Support Box */}
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100 text-sm text-blue-800">
                 <p className="font-semibold mb-1">Cần hỗ trợ gấp?</p>
                 <p className="opacity-80">Gọi ngay <span className="font-bold">1900 1234</span> để được tư vấn.</p>
              </div>
            </div>
          </div>

        </div>
      </div>
    </div>
  );
};