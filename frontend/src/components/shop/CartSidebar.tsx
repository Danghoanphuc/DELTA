// frontend/src/components/shop/CartSidebar.tsx (ĐÃ SỬA)

import { useEffect, useState } from "react"; // Thêm useState nếu cần disable nút
import { X, ShoppingBag, Trash2, Plus, Minus } from "lucide-react";
import { Button } from "@/components/ui/button";
import { ScrollArea } from "@/components/ui/scroll-area";
import { useCartStore } from "@/stores/useCartStore";
import { Link } from "react-router-dom";

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

  // State để disable nút +/- cụ thể khi đang cập nhật
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);

  useEffect(() => {
    // Chỉ fetch khi mở và chưa có cart
    if (isOpen && !cart) {
      fetchCart();
    }
  }, [isOpen, cart, fetchCart]); // Thêm cart và fetchCart vào dependency array

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  const handleQuantityChange = async (cartItemId: string, delta: number) => {
    const item = cart?.items.find((i) => i._id === cartItemId);
    if (!item || updatingItemId === cartItemId) return; // Không cho click khi đang update item này

    const newQuantity = item.quantity + delta;
    if (newQuantity < 1) return;

    setUpdatingItemId(cartItemId); // Đánh dấu item đang được cập nhật
    try {
      await updateCartItem(cartItemId, newQuantity);
      // Optimistic update đã xảy ra trong store, UI đã cập nhật
    } catch (err) {
      // Lỗi đã được xử lý trong store
    } finally {
      setUpdatingItemId(null); // Hoàn tất cập nhật
    }
  };

  const handleRemove = async (cartItemId: string) => {
    if (updatingItemId === cartItemId) return; // Không cho xoá khi đang update

    setUpdatingItemId(cartItemId); // Đánh dấu item đang được cập nhật (xoá)
    try {
      await removeFromCart(cartItemId);
    } catch (err) {
      // Lỗi đã được xử lý trong store
    } finally {
      setUpdatingItemId(null); // Hoàn tất
    }
  };

  // --- KHẮC PHỤC LOGIC LOADING ---
  // Chỉ hiển thị loading overlay khi đang fetch lần đầu (cart chưa có hoặc rỗng)
  const showInitialLoading = isLoading && (!cart || cart.items.length === 0);

  return (
    <>
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
              Giỏ hàng ({getCartItemCount()})
            </h2>
          </div>
          <Button variant="ghost" size="icon" onClick={onClose}>
            <X size={20} />
          </Button>
        </div>

        {/* Loading (Chỉ khi fetch lần đầu) */}
        {showInitialLoading && ( // <--- SỬA ĐIỀU KIỆN Ở ĐÂY
          <div className="flex-1 flex items-center justify-center">
            <div className="text-gray-500">Đang tải giỏ hàng...</div>
          </div>
        )}

        {/* Empty Cart */}
        {/* Sửa điều kiện: Không loading VÀ (ko có cart HOẶC cart rỗng) */}
        {!isLoading && (!cart || cart.items.length === 0) && (
          <div className="flex-1 flex flex-col items-center justify-center p-8 text-center">
            <ShoppingBag size={64} className="text-gray-300 mb-4" />
            <h3 className="font-semibold text-gray-700 mb-2">Giỏ hàng trống</h3>
            <p className="text-sm text-gray-500 mb-4">
              Hãy thêm sản phẩm vào giỏ hàng của bạn
            </p>
            <Button onClick={onClose} asChild>
              <Link to="/shop">Khám phá sản phẩm</Link>
            </Button>
          </div>
        )}

        {/* Cart Items */}
        {/* Sửa điều kiện: Có cart VÀ cart không rỗng (ko cần check isLoading nữa) */}
        {cart && cart.items.length > 0 && (
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
                      }`} // Làm mờ nhẹ khi update
                    >
                      {/* Product Image */}
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

                      {/* Product Info */}
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-sm line-clamp-2 mb-1">
                          {item.product?.name}
                        </h4>
                        <p className="text-xs text-gray-500 mb-2">
                          {formatPrice(item.selectedPrice?.pricePerUnit || 0)} x{" "}
                          {item.quantity}
                        </p>

                        {/* Quantity Controls */}
                        <div className="flex items-center gap-2">
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => handleQuantityChange(item._id, -1)}
                            // Disable khi đang update item này HOẶC số lượng là 1
                            disabled={isUpdatingThisItem || item.quantity <= 1}
                          >
                            <Minus size={14} />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">
                            {isUpdatingThisItem ? "..." : item.quantity}{" "}
                            {/* Hiển thị '...' khi update */}
                          </span>
                          <Button
                            size="icon"
                            variant="outline"
                            className="h-7 w-7"
                            onClick={() => handleQuantityChange(item._id, 1)}
                            disabled={isUpdatingThisItem} // Disable khi đang update item này
                          >
                            <Plus size={14} />
                          </Button>

                          {/* Remove Button */}
                          <Button
                            size="icon"
                            variant="ghost"
                            className="h-7 w-7 text-red-600 hover:text-red-700 hover:bg-red-50 ml-auto"
                            onClick={() => handleRemove(item._id)}
                            disabled={isUpdatingThisItem} // Disable khi đang update item này
                          >
                            <Trash2 size={14} />
                          </Button>
                        </div>
                      </div>

                      {/* Subtotal */}
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

            {/* Footer - Total & Checkout */}
            <div className="border-t p-4 space-y-3">
              {/* Total */}
              <div className="flex items-center justify-between text-lg font-bold">
                <span>Tổng cộng:</span>
                <span className="text-blue-600">
                  {formatPrice(getCartTotal())}
                </span>
              </div>

              {/* Checkout Button */}
              <Button
                className="w-full bg-blue-600 hover:bg-blue-700"
                size="lg"
                asChild
                onClick={onClose}
                // Disable nút checkout nếu đang có item nào đó update
                disabled={!!updatingItemId}
              >
                <Link to="/checkout">Thanh toán</Link>
              </Button>

              {/* Continue Shopping */}
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
