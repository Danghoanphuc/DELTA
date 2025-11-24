// frontend/src/components/shop/CartSidebar.tsx (✅ ĐÃ SỬA LỖI RACE CONDITION)
// ✅ NÂNG CẤP GĐ 5.4: Tích hợp "Hybrid Validation" (Hard Check + Soft Check)

import { useEffect, useState } from "react";
// ✅ GĐ 5.4: Thêm Loader2, AlertCircle và useNavigate
import {
  X,
  ShoppingBag,
  Trash2,
  Plus,
  Minus,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { NativeScrollArea as ScrollArea } from "@/shared/components/ui/NativeScrollArea";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { LoginPopup } from "@/features/auth/components/LoginPopup";
import { getGuestCart } from "@/shared/lib/guestCart";
import { Link, useNavigate } from "react-router-dom"; // ✅ GĐ 5.4: Thêm useNavigate
import { toast } from "sonner";

interface CartSidebarProps {
  isOpen: boolean;
  onClose: () => void;
}

export function CartSidebar({ isOpen, onClose }: CartSidebarProps) {
  const {
    cart,
    isLoading,
    fetchCart,
    updateCartItem,
    removeFromCart,
    getCartItemCount,
    getCartTotal,
    // --- NÂNG CẤP GĐ 5.4: Thêm state/actions ---
    isCheckoutValidating,
    validateCheckout,
    getValidationError,
    clearValidationErrors,
    // --- KẾT THÚC NÂNG CẤP ---
  } = useCartStore();

  const { accessToken } = useAuthStore();
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [isHardChecking, setIsHardChecking] = useState(false); // ✅ GĐ 5.4: State cho nút "Thanh toán"
  const [editingQuantities, setEditingQuantities] = useState<Record<string, string>>({}); // ✅ Local state để người dùng có thể gõ thoải mái
  const navigate = useNavigate(); // ✅ GĐ 5.4: Hook để điều hướng

  useEffect(() => {
    if (isOpen && accessToken && !cart) {
      fetchCart();
    }
  }, [isOpen, accessToken, cart, fetchCart]);

  // ✅ GĐ 5.4: Xóa lỗi validation khi giỏ hàng thay đổi
  useEffect(() => {
    if (cart?.items) {
      clearValidationErrors();
    }
  }, [cart?.items, clearValidationErrors]);

  // (formatPrice, handleCheckoutClick (cho guest) giữ nguyên)
  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleGuestCheckoutClick = (e: React.MouseEvent) => {
    if (!accessToken) {
      e.preventDefault();
      setShowLoginPopup(true);
    } else {
      onClose();
    }
  };

  const handleQuantityChange = async (cartItemId: string, delta: number) => {
    // (Logic giữ nguyên, store đã tự động clearValidationErrors)
    if (!accessToken) {
      toast.info("Vui lòng đăng nhập để quản lý giỏ hàng");
      return;
    }
    const item = cart?.items.find((i) => i._id === cartItemId);
    if (!item || updatingItemId === cartItemId) return;
    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;
    setUpdatingItemId(cartItemId);
    try {
      await updateCartItem(cartItemId, newQuantity);
    } catch (err) {
      // Error handled in store
    } finally {
      setUpdatingItemId(null);
    }
  };

  const handleRemove = async (cartItemId: string) => {
    // (Logic giữ nguyên, store đã tự động clearValidationErrors)
    if (!accessToken) {
      toast.info("Vui lòng đăng nhập để quản lý giỏ hàng");
      return;
    }
    if (updatingItemId === cartItemId) return;
    setUpdatingItemId(cartItemId);
    try {
      await removeFromCart(cartItemId);
    } catch (err) {
      // Error handled in store
    } finally {
      setUpdatingItemId(null);
    }
  };

  // --- NÂNG CẤP GĐ 5.4: Hàm "HARD CHECK" ---
  const handleHardCheckout = async () => {
    if (isHardChecking || !!updatingItemId) return;
    setIsHardChecking(true);
    try {
      const isValid = await validateCheckout(); // Gọi "Hard Check"
      if (isValid) {
        onClose();
        navigate("/checkout"); // Chỉ điều hướng khi valid
      }
      // Nếu false, store đã toast lỗi, component sẽ re-render
      // và hiển thị lỗi "Soft Check" (validationError) bên dưới
    } catch (error) {
      toast.error("Đã có lỗi bất ngờ. Vui lòng thử lại.");
    } finally {
      setIsHardChecking(false);
    }
  };
  // --- KẾT THÚC NÂNG CẤP ---

  // (showInitialLoading, guestCart, displayItemCount giữ nguyên)
  const showInitialLoading = isLoading && !cart && isOpen && !!accessToken;
  const guestCart = !accessToken ? getGuestCart() : null;
  const displayItemCount = getCartItemCount(!!accessToken);

  return (
    <>
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        message="Vui lòng đăng nhập để tiến hành thanh toán"
      />

      {/* (Backdrop) */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* (Header) */}
        <div className="flex items-center justify-between p-4 border-b">
          <div className="flex items-center gap-2">
            <ShoppingBag size={20} className="text-blue-600" />
            <h2 className="font-semibold text-lg">
              Giỏ hàng ({displayItemCount})
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        {/* (Loading State) */}
        {(showInitialLoading || (isCheckoutValidating && !isHardChecking)) && (
          <div className="flex-1 flex items-center justify-center">
            <Loader2 className="w-6 h-6 animate-spin text-gray-400" />
            <p className="ml-2 text-gray-500">Đang tải giỏ hàng...</p>
          </div>
        )}

       {/* (Empty State - JUICY VERSION) */}
       {!showInitialLoading &&
          !guestCart?.items.length &&
          (!cart || cart.items.length === 0) && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center bg-slate-50/50">
              {/* Ghost Illustration using CSS/Divs or Icon */}
              <div className="relative mb-6 group cursor-pointer">
                  <div className="absolute inset-0 bg-gray-200 blur-xl rounded-full opacity-20 group-hover:opacity-40 transition-opacity"></div>
                  <ShoppingBag size={80} strokeWidth={0.8} className="text-gray-300 relative z-10 group-hover:-translate-y-2 transition-transform duration-500" />
                  {/* Một con nhện nhỏ rơi xuống khi hover */}
                  <div className="absolute top-1/2 left-1/2 w-[1px] h-0 bg-gray-400 group-hover:h-12 transition-all duration-700 ease-out delay-100"></div>
                  <div className="absolute top-1/2 left-1/2 translate-y-12 scale-0 group-hover:scale-100 transition-transform delay-700 text-xs">🕷️</div>
              </div>

              <h3 className="font-bold text-lg text-slate-700 mb-2">
                Giỏ hàng... sạch bách!
              </h3>
              <p className="text-sm text-slate-500 mb-8 leading-relaxed px-4">
                Có vẻ như các sản phẩm đang chơi trốn tìm. Hãy đi bắt chúng về đây!
              </p>
              
              <Button onClick={onClose} className="w-full bg-slate-900 text-white hover:bg-slate-800 shadow-lg shadow-slate-200" size="lg" asChild>
                <Link to="/shop">
                  <Plus size={16} className="mr-2" />
                  Lấp đầy giỏ hàng
                </Link>
              </Button>
            </div>
          )}
        {/* (Guest Cart State) */}
        {!accessToken && guestCart && guestCart.items.length > 0 && (
          <>
            {/* (Giữ nguyên Guest Cart) */}
            <ScrollArea className="flex-1 p-4">
              <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-3 mb-4">
                <p className="text-sm text-yellow-800">
                  ℹ️ Bạn đang xem giỏ hàng tạm thời. Đăng nhập để lưu giỏ hàng
                  và thanh toán.
                </p>
              </div>
              <div className="space-y-4">
                {guestCart.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-3 p-3 bg-gray-50 rounded-lg"
                  >
                    <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                      <div className="w-full h-full flex items-center justify-center text-gray-400">
                        📦
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-medium text-sm mb-1">
                        Product ID: {item.productId.substring(0, 8)}...
                      </p>
                      <p className="text-xs text-gray-500 mb-2">
                        Số lượng: {item.quantity}
                      </p>
                      <p className="text-xs text-gray-400">
                        Đăng nhập để xem chi tiết
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="border-t p-4 space-y-3">
              <p className="text-sm text-gray-600 text-center mb-3">
                Đăng nhập để xem tổng giá và thanh toán
              </p>
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
                onClick={handleGuestCheckoutClick}
              >
                Đăng nhập để thanh toán
              </Button>
              <Button
                variant="outline"
                className="w-full"
                onClick={onClose}
                asChild
              >
                <Link to="/shop">Tiếp tục mua sắm</Link>
              </Button>
            </div>
          </>
        )}

        {/* (Auth Cart State - Đã Hoàn Nguyên) */}
        {accessToken && cart && cart.items.length > 0 && (
          <>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {cart.items.map((item) => {
                  const isUpdatingThisItem = updatingItemId === item._id;
                  const product = item.product;

                  // --- NÂNG CẤP GĐ 5.4: "SOFT CHECK" ---
                  // Lấy lỗi (nếu có) cho item này từ store
                  const validationError = getValidationError(item._id);
                  // --- KẾT THÚC NÂNG CẤP ---

                  return (
                    <div
                      key={item._id}
                      className={`flex gap-3 p-3 bg-gray-50 rounded-lg transition-opacity ${
                        isUpdatingThisItem ? "opacity-70" : ""
                      } ${validationError ? "ring-2 ring-red-300" : ""}`} // ✅ GĐ 5.4: Highlight item lỗi
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        <img
                          src={
                            product?.images?.[0]?.url ||
                            "/placeholder-product.jpg"
                          }
                          alt={product?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">
                          {product?.name}
                        </h4>

                        {/* --- NÂNG CẤP GĐ 5.4: Hiển thị lỗi --- */}
                        {validationError && (
                          <div className="flex items-center gap-1.5 text-xs text-red-600 mb-1.5 font-medium p-1.5 bg-red-50 rounded">
                            <AlertCircle size={14} className="flex-shrink-0" />
                            <p>{validationError}</p>
                          </div>
                        )}
                        {/* --- KẾT THÚC NÂNG CẤP --- */}

                        <p className="text-xs text-gray-500 mb-2">
                          {formatPrice(item.selectedPrice?.pricePerUnit || 0)} x{" "}
                          {item.quantity}
                        </p>

                        <div className="flex items-center gap-2">
                          {/* (Các nút +/-/remove giữ nguyên) */}
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => handleQuantityChange(item._id, -1)}
                            disabled={isUpdatingThisItem || item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </Button>
                          
                          {/* ✅ Thay span bằng Input để người dùng có thể nhập trực tiếp */}
                          {isUpdatingThisItem ? (
                            <div className="w-16 h-7 flex items-center justify-center">
                              <Loader2 className="w-4 h-4 animate-spin" />
                            </div>
                          ) : (
                            <Input
                              type="number"
                              min="1"
                              value={editingQuantities[item._id] ?? item.quantity}
                              onChange={(e) => {
                                // ✅ Chỉ update local state, không call API
                                setEditingQuantities(prev => ({
                                  ...prev,
                                  [item._id]: e.target.value
                                }));
                              }}
                              onBlur={(e) => {
                                const newQty = Math.max(1, parseInt(e.target.value) || 1);
                                const delta = newQty - item.quantity;
                                if (delta !== 0) {
                                  handleQuantityChange(item._id, delta);
                                }
                                // Clear local editing state
                                setEditingQuantities(prev => {
                                  const updated = {...prev};
                                  delete updated[item._id];
                                  return updated;
                                });
                              }}
                              onKeyDown={(e) => {
                                if (e.key === 'Enter') {
                                  e.currentTarget.blur(); // Trigger onBlur
                                }
                              }}
                              className="w-16 h-7 text-center text-sm font-medium p-1"
                              disabled={isUpdatingThisItem}
                            />
                          )}
                          
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => handleQuantityChange(item._id, 1)}
                            disabled={isUpdatingThisItem}
                          >
                            <Plus size={14} />
                          </Button>
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
                            onClick={() => handleRemove(item._id)}
                            disabled={isUpdatingThisItem}
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>

                      <div className="text-right">
                        <p className="font-semibold text-blue-600">
                          {formatPrice(item.subtotal)}
                        </p>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* (Footer) */}
            <div className="border-t p-4 space-y-3">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Tổng cộng:</span>
                <span className="text-blue-600">
                  {formatPrice(getCartTotal())}
                </span>
              </div>

              {/* --- NÂNG CẤP GĐ 5.4: Nút "HARD CHECK" --- */}
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
                onClick={handleHardCheckout}
                disabled={
                  !!updatingItemId || isHardChecking || isCheckoutValidating
                }
              >
                {isHardChecking ? (
                  <Loader2 className="w-5 h-5 animate-spin" />
                ) : (
                  "Thanh toán"
                )}
              </Button>
              {/* --- KẾT THÚC NÂNG CẤP --- */}

              <Button
                variant="outline"
                className="w-full"
                onClick={onClose}
                asChild
              >
                <Link to="/shop">Tiếp tục mua sắm</Link>
              </Button>
            </div>
          </>
        )}
      </div>
    </>
  );
}
