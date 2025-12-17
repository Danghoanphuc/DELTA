// frontend/src/components/shop/CartSidebar.tsx (✅ RE-STYLED: AN NAM CURATOR)

import { useEffect, useState } from "react";
import {
  X,
  Plus,
  Minus,
  Loader2,
  AlertCircle,
  Gem,
  PackageOpen,
  ArrowRight,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { NativeScrollArea as ScrollArea } from "@/shared/components/ui/NativeScrollArea";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { LoginPopup } from "@/features/auth/components/LoginPopup";
import { getGuestCart } from "@/shared/lib/guestCart";
import { Link, useNavigate } from "react-router-dom";
import { toast } from "@/shared/utils/toast";
import { cn } from "@/shared/lib/utils";

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
    isCheckoutValidating,
    validateCheckout,
    getValidationError,
    clearValidationErrors,
  } = useCartStore();

  const { accessToken } = useAuthStore();
  const [showLoginPopup, setShowLoginPopup] = useState(false);
  const [updatingItemId, setUpdatingItemId] = useState<string | null>(null);
  const [isHardChecking, setIsHardChecking] = useState(false);
  const [editingQuantities, setEditingQuantities] = useState<
    Record<string, string>
  >({});
  const navigate = useNavigate();

  useEffect(() => {
    if (isOpen && accessToken && !cart) {
      fetchCart();
    }
  }, [isOpen, accessToken, cart, fetchCart]);

  useEffect(() => {
    if (cart?.items) {
      clearValidationErrors();
    }
  }, [cart?.items, clearValidationErrors]);

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
    if (!accessToken) {
      toast.info("Vui lòng đăng nhập để quản lý bộ sưu tập");
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
      toast.info("Vui lòng đăng nhập để quản lý bộ sưu tập");
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

  const handleHardCheckout = async () => {
    if (isHardChecking || !!updatingItemId) return;
    setIsHardChecking(true);
    try {
      const isValid = await validateCheckout();
      if (isValid) {
        onClose();
        navigate("/checkout");
      }
    } catch (error) {
      toast.error("Đã có lỗi bất ngờ. Vui lòng thử lại.");
    } finally {
      setIsHardChecking(false);
    }
  };

  const showInitialLoading = isLoading && !cart && isOpen && !!accessToken;
  const guestCart = !accessToken ? getGuestCart() : null;
  const displayItemCount = getCartItemCount(!!accessToken);

  return (
    <>
      <LoginPopup
        isOpen={showLoginPopup}
        onClose={() => setShowLoginPopup(false)}
        message="Vui lòng đăng nhập để xác nhận quyền sở hữu tác phẩm"
      />

      {/* Backdrop with smooth fade + blur */}
      <div
        className={cn(
          "fixed inset-0 z-40 transition-all duration-500",
          isOpen
            ? "bg-stone-900/60 backdrop-blur-sm opacity-100"
            : "bg-stone-900/0 backdrop-blur-none opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Sidebar Container with bounce effect */}
      <div
        className={cn(
          "fixed top-0 right-0 h-full w-full sm:w-[450px] bg-[#F9F8F6] shadow-2xl z-50 flex flex-col border-l border-stone-200 transition-all duration-500",
          isOpen
            ? "translate-x-0 scale-100 opacity-100"
            : "translate-x-[120%] scale-95 opacity-0"
        )}
        style={{
          transitionTimingFunction: isOpen
            ? "cubic-bezier(0.34, 1.56, 0.64, 1)" // Bounce effect
            : "cubic-bezier(0.4, 0, 1, 1)", // Smooth exit
        }}
      >
        {/* Decorative Texture */}
        <div className="absolute inset-0 opacity-[0.05] pointer-events-none bg-[url('https://grainy-gradients.vercel.app/noise.svg')] mix-blend-multiply z-0"></div>

        {/* --- HEADER --- */}
        <div
          className={cn(
            "relative z-10 flex items-center justify-between px-6 py-5 border-b border-stone-200 bg-white/80 backdrop-blur-md transition-all duration-500",
            isOpen && "animate-in fade-in slide-in-from-top-4"
          )}
          style={{
            animationDelay: "100ms",
            animationDuration: "500ms",
            animationFillMode: "backwards",
          }}
        >
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-amber-50 rounded-full flex items-center justify-center border border-amber-100">
              <Gem size={18} className="text-amber-800" />
            </div>
            <div>
              <h2 className="font-serif font-bold text-xl text-stone-900 leading-none">
                Túi Giám Tuyển
              </h2>
              <p className="text-[10px] font-mono uppercase tracking-widest text-stone-500 mt-1">
                {displayItemCount} Tác phẩm
              </p>
            </div>
          </div>
          <Button
            variant="ghost"
            size="icon"
            onClick={onClose}
            className="hover:bg-stone-100 rounded-full text-stone-500"
          >
            <X size={20} />
          </Button>
        </div>

        {/* --- LOADING STATE --- */}
        {(showInitialLoading || (isCheckoutValidating && !isHardChecking)) && (
          <div className="flex-1 flex flex-col items-center justify-center relative z-10">
            <Loader2 className="w-8 h-8 animate-spin text-amber-800 mb-2" />
            <p className="text-sm font-serif text-stone-500 italic">
              Đang kiểm kê vật phẩm...
            </p>
          </div>
        )}

        {/* --- EMPTY STATE (Heritage Style) --- */}
        {!showInitialLoading &&
          !guestCart?.items.length &&
          (!cart || cart.items.length === 0) && (
            <div className="flex-1 flex flex-col items-center justify-center p-8 text-center relative z-10">
              <div className="mb-6 relative animate-in zoom-in-50 fade-in duration-700">
                <div className="absolute inset-0 bg-amber-100 rounded-full blur-2xl opacity-40 animate-pulse"></div>
                <PackageOpen
                  size={80}
                  strokeWidth={0.8}
                  className="text-stone-300 relative z-10"
                />
              </div>

              <h3 className="font-serif text-xl font-bold text-stone-800 mb-2">
                Chưa có vật phẩm nào
              </h3>
              <p className="text-sm text-stone-500 mb-8 leading-relaxed max-w-xs font-light">
                "Một bộ sưu tập bắt đầu từ niềm cảm hứng. Hãy dạo quanh phòng
                trưng bày để chọn những tác phẩm ưng ý."
              </p>

              <Button
                onClick={onClose}
                className="bg-stone-900 text-[#F9F8F6] hover:bg-amber-900 shadow-lg rounded-sm h-12 px-8 text-xs font-bold uppercase tracking-widest transition-all"
                asChild
              >
                <Link to="/shop">Khám phá Bộ sưu tập</Link>
              </Button>
            </div>
          )}

        {/* --- GUEST CART (Chưa đăng nhập) --- */}
        {!accessToken && guestCart && guestCart.items.length > 0 && (
          <>
            <ScrollArea className="flex-1 p-6 relative z-10">
              <div className="bg-amber-50 border border-amber-200/60 p-4 mb-6 rounded-sm">
                <p className="text-xs text-amber-900 font-medium flex gap-2">
                  <AlertCircle size={16} />
                  Bạn đang xem bộ sưu tập tạm thời. Vui lòng đăng nhập để lưu
                  trữ.
                </p>
              </div>
              <div className="space-y-4">
                {guestCart.items.map((item, index) => (
                  <div
                    key={index}
                    className="flex gap-4 p-4 bg-white border border-stone-100 shadow-sm rounded-sm"
                  >
                    <div className="w-16 h-16 bg-stone-100 flex items-center justify-center text-stone-300 rounded-sm">
                      <Gem size={24} strokeWidth={1} />
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="font-serif font-bold text-stone-900 text-sm mb-1 truncate">
                        Vật phẩm #{item.productId.substring(0, 6)}...
                      </p>
                      <p className="text-xs text-stone-500 mb-2">
                        Số lượng: {item.quantity}
                      </p>
                      <p className="text-[10px] uppercase tracking-wide text-stone-400">
                        Đăng nhập để xem chi tiết
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </ScrollArea>
            <div className="p-6 bg-white border-t border-stone-200 relative z-10 space-y-3 shadow-[0_-10px_40px_rgba(0,0,0,0.02)]">
              <p className="text-xs text-stone-500 text-center italic font-serif">
                Đăng nhập để xem báo giá chi tiết
              </p>
              <Button
                className="w-full bg-stone-900 hover:bg-amber-900 text-white rounded-sm h-12 font-bold uppercase tracking-widest text-xs"
                onClick={handleGuestCheckoutClick}
              >
                Đăng nhập & Thẩm định
              </Button>
              <Button
                variant="outline"
                className="w-full border-stone-300 text-stone-600 hover:text-stone-900 hover:border-stone-900 rounded-sm h-12 text-xs uppercase tracking-widest font-bold"
                onClick={onClose}
                asChild
              >
                <Link to="/shop">Tiếp tục xem</Link>
              </Button>
            </div>
          </>
        )}

        {/* --- AUTH CART (Đã đăng nhập) --- */}
        {accessToken && cart && cart.items.length > 0 && (
          <>
            <ScrollArea className="flex-1 p-6 relative z-10">
              <div className="space-y-5">
                {cart.items.map((item, index) => {
                  const isUpdatingThisItem = updatingItemId === item._id;
                  const product = item.product;
                  const validationError = getValidationError(item._id);

                  return (
                    <div
                      key={item._id}
                      className={cn(
                        "flex gap-4 p-4 bg-white border border-stone-100 shadow-sm rounded-sm transition-all hover:shadow-md hover:border-amber-200",
                        isUpdatingThisItem && "opacity-60 pointer-events-none",
                        validationError && "border-red-300 bg-red-50/10",
                        // Stagger animation
                        isOpen && "animate-in fade-in slide-in-from-right-4"
                      )}
                      style={{
                        animationDelay: `${index * 50}ms`,
                        animationDuration: "400ms",
                        animationFillMode: "backwards",
                      }}
                    >
                      {/* Image Thumbnail */}
                      <div className="w-20 h-20 bg-stone-100 flex-shrink-0 overflow-hidden rounded-sm border border-stone-200">
                        <img
                          src={
                            product?.images?.[0]?.url ||
                            "/placeholder-product.jpg"
                          }
                          alt={product?.name}
                          className="w-full h-full object-cover mix-blend-multiply"
                        />
                      </div>

                      <div className="flex-1 min-w-0 flex flex-col justify-between">
                        <div>
                          <div className="flex justify-between items-start gap-2">
                            <h4 className="font-serif font-bold text-stone-900 text-sm line-clamp-2 leading-snug">
                              {product?.name}
                            </h4>
                            <button
                              onClick={() => handleRemove(item._id)}
                              className="text-stone-400 hover:text-red-600 transition-colors -mt-1"
                              disabled={isUpdatingThisItem}
                            >
                              <X size={14} />
                            </button>
                          </div>

                          {/* Error Message */}
                          {validationError && (
                            <div className="flex items-start gap-1.5 text-[10px] text-red-600 mt-1.5 font-medium">
                              <AlertCircle
                                size={12}
                                className="flex-shrink-0 mt-0.5"
                              />
                              <p>{validationError}</p>
                            </div>
                          )}
                        </div>

                        <div className="flex items-end justify-between mt-2">
                          <div className="flex flex-col">
                            <p className="text-[10px] text-stone-400 uppercase tracking-wider mb-1">
                              Đơn giá
                            </p>
                            <p className="text-xs font-medium text-stone-600">
                              {formatPrice(
                                item.selectedPrice?.pricePerUnit || 0
                              )}
                            </p>
                          </div>

                          {/* Quantity Control */}
                          <div className="flex items-center border border-stone-200 rounded-sm bg-white h-8">
                            <button
                              className="w-8 h-full flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors disabled:opacity-50"
                              onClick={() => handleQuantityChange(item._id, -1)}
                              disabled={
                                isUpdatingThisItem || item.quantity <= 1
                              }
                            >
                              <Minus size={12} />
                            </button>

                            <div className="w-10 h-full border-l border-r border-stone-100">
                              {isUpdatingThisItem ? (
                                <div className="w-full h-full flex items-center justify-center">
                                  <Loader2 className="w-3 h-3 animate-spin text-stone-400" />
                                </div>
                              ) : (
                                <Input
                                  type="number"
                                  min="1"
                                  value={
                                    editingQuantities[item._id] ?? item.quantity
                                  }
                                  onChange={(e) => {
                                    setEditingQuantities((prev) => ({
                                      ...prev,
                                      [item._id]: e.target.value,
                                    }));
                                  }}
                                  onBlur={(e) => {
                                    const newQty = Math.max(
                                      1,
                                      parseInt(e.target.value) || 1
                                    );
                                    const delta = newQty - item.quantity;
                                    if (delta !== 0) {
                                      handleQuantityChange(item._id, delta);
                                    }
                                    setEditingQuantities((prev) => {
                                      const updated = { ...prev };
                                      delete updated[item._id];
                                      return updated;
                                    });
                                  }}
                                  onKeyDown={(e) => {
                                    if (e.key === "Enter")
                                      e.currentTarget.blur();
                                  }}
                                  className="w-full h-full text-center text-xs font-bold border-none shadow-none focus-visible:ring-0 px-0 bg-transparent"
                                />
                              )}
                            </div>

                            <button
                              className="w-8 h-full flex items-center justify-center text-stone-500 hover:text-stone-900 hover:bg-stone-50 transition-colors disabled:opacity-50"
                              onClick={() => handleQuantityChange(item._id, 1)}
                              disabled={isUpdatingThisItem}
                            >
                              <Plus size={12} />
                            </button>
                          </div>
                        </div>
                      </div>
                    </div>
                  );
                })}
              </div>
            </ScrollArea>

            {/* --- FOOTER --- */}
            <div
              className={cn(
                "bg-white border-t border-stone-200 p-6 relative z-10 space-y-4 shadow-[0_-10px_40px_rgba(0,0,0,0.02)] transition-all duration-500",
                isOpen && "animate-in fade-in slide-in-from-bottom-4"
              )}
              style={{
                animationDelay: "200ms",
                animationDuration: "500ms",
                animationFillMode: "backwards",
              }}
            >
              <div className="flex items-center justify-between">
                <span className="font-serif text-lg font-bold text-stone-900">
                  Tổng tạm tính
                </span>
                <div className="text-right">
                  <span className="block font-mono text-xl font-bold text-amber-800">
                    {formatPrice(getCartTotal())}
                  </span>
                  <span className="text-[10px] text-stone-400 uppercase tracking-wider">
                    (Chưa bao gồm VAT & Phí vận chuyển)
                  </span>
                </div>
              </div>

              <div className="grid gap-3">
                <Button
                  className="w-full bg-stone-900 hover:bg-amber-900 text-white rounded-sm h-14 font-bold uppercase tracking-[0.15em] text-xs shadow-lg transition-all"
                  onClick={handleHardCheckout}
                  disabled={
                    !!updatingItemId || isHardChecking || isCheckoutValidating
                  }
                >
                  {isHardChecking ? (
                    <>
                      <Loader2 className="w-4 h-4 animate-spin mr-2" />
                      Đang thẩm định...
                    </>
                  ) : (
                    <span className="flex items-center">
                      Tiến hành Đặt hàng{" "}
                      <ArrowRight size={16} className="ml-2" />
                    </span>
                  )}
                </Button>

                <Button
                  variant="outline"
                  className="w-full border-stone-300 text-stone-600 hover:text-stone-900 hover:border-stone-900 rounded-sm h-12 text-xs uppercase tracking-widest font-bold"
                  onClick={onClose}
                  asChild
                >
                  <Link to="/shop">Chọn thêm tác phẩm</Link>
                </Button>
              </div>
            </div>
          </>
        )}
      </div>
    </>
  );
}
