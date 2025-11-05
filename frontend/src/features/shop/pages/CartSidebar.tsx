// frontend/src/components/shop/CartSidebar.tsx (UPDATED FOR GUEST CART)

import { useEffect, useState } from "react";
import { X, ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { NativeScrollArea as ScrollArea } from "@/shared/components/ui/NativeScrollArea";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore"; // ✅ THÊM
import { LoginPopup } from "@/features/auth/components/LoginPopup"; // ✅ THÊM
import { getGuestCart } from "@/shared/lib/guestCart"; // ✅ THÊM
import { Link } from "react-router-dom";
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
  } = useCartStore();

  const { accessToken } = useAuthStore(); // ✅ THÊM
  const [showLoginPopup, setShowLoginPopup] = useState(false); // ✅ THÊM
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  useEffect(() => {
    if (isOpen && accessToken && !cart) {
      fetchCart();
    }
  }, [isOpen, cart, fetchCart, accessToken]);

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  // ✅ THÊM - Handle checkout click cho guest
  const handleCheckoutClick = (e: React.MouseEvent) => {
    if (!accessToken) {
      e.preventDefault();
      setShowLoginPopup(true);
    } else {
      onClose();
    }
  };

  const handleQuantityChange = async (cartItemId: string, delta: number) => {
    if (!accessToken) {
      // Guest user - chưa implement UI cho guest cart update
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

  const showInitialLoading = isLoading && (!cart || cart.items.length === 0);

  // ✅ THÊM - Guest cart display
  const guestCart = !accessToken ? getGuestCart() : null;
  const displayItemCount = getCartItemCount(!!accessToken);

  return (
    <>
      {/* ✅ THÊM LoginPopup */}
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        message="Vui lòng đăng nhập để tiến hành thanh toán"
      />

      {/* Backdrop */}
      {isOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-40 transition-opacity"
          onClick={onClose}
        />
      )}

      {/* Sidebar */}
      <div
        className={`fixed top-0 right-0 h-full w-full sm:w-96 bg-white shadow-2xl z-50 transform transition-transform duration-300 flex flex-col ${
          isOpen ? "translate-x-0" : "translate-x-full"
        }`}
      >
        {/* Header */}
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

        {/* Loading */}
        {showInitialLoading && (
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-500">Đang tải giỏ hàng...</div>
          </div>
        )}

        {/* Empty Cart */}
        {!isLoading &&
          !guestCart?.items.length &&
          (!cart || cart.items.length === 0) && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
              <ShoppingBag size={64} className="text-gray-300 mb-4" />
              <h3 className="font-semibold text-gray-700 mb-2">
                Giỏ hàng trống
              </h3>
              <p className="text-sm text-gray-500 mb-4">
                Hãy thêm sản phẩm vào giỏ hàng của bạn
              </p>
              <Button onClick={onClose} asChild>
                <Link to="/shop">Khám phá sản phẩm</Link>
              </Button>
            </div>
          )}

        {/* ✅ GUEST CART DISPLAY */}
        {!accessToken && guestCart && guestCart.items.length > 0 && (
          <>
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
                onClick={handleCheckoutClick}
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

        {/* AUTHENTICATED USER CART */}
        {accessToken && cart && cart.items.length > 0 && (
          <>
            <ScrollArea className="flex-1 p-4">
              <div className="space-y-4">
                {cart.items.map((item) => {
                  const isUpdatingThisItem = updatingItemId === item._id;
                  return (
                    <div
                      key={item._id}
                      className={`flex gap-3 p-3 bg-gray-50 rounded-lg transition-opacity ${
                        isUpdatingThisItem ? "opacity-70" : ""
                      }`}
                    >
                      <div className="w-20 h-20 rounded-lg overflow-hidden bg-gray-200 flex-shrink-0">
                        <img
                          src={
                            item.product?.images?.[0]?.url ||
                            "/placeholder-product.jpg"
                          }
                          alt={item.product?.name}
                          className="w-full h-full object-cover"
                        />
                      </div>

                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">
                          {item.product?.name}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">
                          {formatPrice(item.selectedPrice?.pricePerUnit || 0)} x{" "}
                          {item.quantity}
                        </p>

                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => handleQuantityChange(item._id, -1)}
                            disabled={isUpdatingThisItem || item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {isUpdatingThisItem ? "..." : item.quantity}
                          </span>
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

            <div className="border-t p-4 space-y-3">
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Tổng cộng:</span>
                <span className="text-blue-600">
                  {formatPrice(getCartTotal())}
                </span>
              </div>

              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
                asChild
                onClick={onClose}
                disabled={!!updatingItemId}
              >
                <Link to="/checkout">Thanh toán</Link>
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
      </div>
    </>
  );
}
