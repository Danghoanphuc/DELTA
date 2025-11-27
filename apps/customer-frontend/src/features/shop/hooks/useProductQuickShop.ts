// apps/customer-frontend/src/features/shop/hooks/useProductQuickShop.ts
import { useState, useEffect, useMemo } from "react";
// ✅ SỬA LỖI: Import đúng type Product từ @/types/product
import { Product } from "@/types/product";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";
import { toast } from "@/shared/utils/toast";

export const useProductQuickShop = () => {
  const { addToCart, isInCart, cart } = useCartStore(); // ✅ Thêm cart để track changes
  // ✅ SỬA LỖI: Lấy đúng state từ useAuthStore
  const isAuthenticated = useAuthStore((state) => !!state.accessToken);

  // State cho sản phẩm đang được "mua nhanh"
  const [quickShopProduct, setQuickShopProduct] = useState<Product | null>(
    null
  );
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"cart" | "buy">("cart");

  // State cho logic giá/số lượng (tương tự useProductDetail)
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedPriceIndex, setSelectedPriceIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);

  // Memos
  const minQuantity = useMemo(
    // ✅ SỬA LỖI: Dùng pricing (thay vì pricing[0])
    () => quickShopProduct?.pricing?.[0]?.minQuantity || 1,
    [quickShopProduct]
  );

  const currentPricePerUnit = useMemo(
    () => quickShopProduct?.pricing[selectedPriceIndex]?.pricePerUnit ?? 0,
    [quickShopProduct, selectedPriceIndex]
  );

  const inCart = useMemo(
    () =>
      quickShopProduct
        ? isInCart(quickShopProduct._id, isAuthenticated)
        : false,
    [quickShopProduct, isInCart, isAuthenticated, cart] // ✅ Thêm cart để re-compute khi cart thay đổi
  );

  // Tự động chọn bậc giá khi số lượng thay đổi
  useEffect(() => {
    if (!quickShopProduct?.pricing) return;
    let bestTierIndex = 0;
    for (let i = 0; i < quickShopProduct.pricing.length; i++) {
      if (selectedQuantity >= quickShopProduct.pricing[i].minQuantity) {
        if (
          quickShopProduct.pricing[i].minQuantity >=
          quickShopProduct.pricing[bestTierIndex].minQuantity
        ) {
          bestTierIndex = i;
        }
      }
    }
    setSelectedPriceIndex(bestTierIndex);
  }, [selectedQuantity, quickShopProduct?.pricing]);

  // Hàm mở
  const openQuickShop = (product: Product, mode: "cart" | "buy") => {
    setQuickShopProduct(product);
    // ✅ SỬA LỖI: Dùng pricing (thay vì pricing[0])
    setSelectedQuantity(product.pricing?.[0]?.minQuantity || 1); // Reset số lượng
    setSelectedPriceIndex(0); // Reset bậc giá
    setSheetMode(mode);
    setIsSheetOpen(true);
  };

  // Hàm đóng
  const closeQuickShop = () => {
    setIsSheetOpen(false);
    // (Delay việc clear data để animation đóng mượt hơn)
    setTimeout(() => setQuickShopProduct(null), 300);
  };

  // Hàm xử lý "Thêm vào giỏ"
  // ✅ SỬA LỖI TS1345: Hàm này phải trả về boolean
  const handleQuickShopAddToCart = async (): Promise<boolean> => {
    if (!quickShopProduct || isAddingToCart) return false;

    setIsAddingToCart(true);
    try {
      // ✅ SỬA LỖI: Dùng payload object theo định nghĩa của useCartStore
      await addToCart({
        productId: quickShopProduct._id,
        quantity: selectedQuantity,
        selectedPriceIndex: selectedPriceIndex,
        // customization: {}, // (Không có tùy chỉnh cho luồng này)
      });
      // (toast đã có trong useCartStore)
      closeQuickShop();
      return true; // ✅ TRẢ VỀ TRUE KHI THÀNH CÔNG
    } catch (err) {
      toast.error("Thêm vào giỏ hàng thất bại");
      return false; // ✅ TRẢ VỀ FALSE KHI THẤT BẠI
    } finally {
      setIsAddingToCart(false);
    }
  };

  const formatPrice = (price: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(price);
  };

  return {
    isSheetOpen,
    sheetMode,
    quickShopProduct,
    openQuickShop,
    closeQuickShop,
    // Props cho Sheet
    isAddingToCart,
    inCart,
    minQuantity,
    selectedQuantity,
    setSelectedQuantity,
    currentPricePerUnit,
    handleQuickShopAddToCart, // Bây giờ đã trả về boolean
    formatPrice,
  };
};
