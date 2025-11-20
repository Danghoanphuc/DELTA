// features/shop/hooks/useProductDetail.ts
// ✅ BÀN GIAO: Gỡ bỏ toast.success trùng lặp

import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Product, PrinterProduct } from "../../../types/product";
import { PrinterProfile } from "../../../types/printerProfile";
import api from "../../../shared/lib/axios";
import { toast } from "sonner";
import { useCartStore } from "../../../stores/useCartStore";
import { useAuthStore } from "../../../stores/useAuthStore";
// (Import Logger - nếu Phúc đã tạo file logger.util.ts)
// import { Logger } from "@/shared/utils/logger.util";

interface ProductWithPrinter extends Product {
  printerInfo?: PrinterProfile;
}

export const useProductDetail = () => {
  // ✅ SỬA: Hỗ trợ cả /products/:id và /product/:slug
  const params = useParams<{ id?: string; slug?: string }>();
  const productId = params.id || params.slug; // Lấy id hoặc slug
  const navigate = useNavigate();
  const { addToCart, isInCart, cart } = useCartStore(); // ✅ Thêm cart để track changes
  const { user, accessToken } = useAuthStore();
  const isAuthenticated = !!user && !!accessToken;

  const [product, setProduct] = useState<ProductWithPrinter | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedPriceIndex, setSelectedPriceIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [customization, setCustomization] = useState({
    notes: "",
    fileUrl: "",
  });

  // Fetch product (giữ nguyên)
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      setLoading(true);
      try {
        const res = await api.get(`/products/${productId}`);
        if (!res.data?.data) { // Kiểm tra xem res.data.data có tồn tại không
          throw new Error("Product data not found");
        }
        const fetchedProduct = res.data.data as ProductWithPrinter; // Gán trực tiếp res.data.data
        
        setProduct(fetchedProduct);
        // ✅ Bắt đầu từ minQuantity để đảm bảo valid, nhưng nếu minQuantity quá lớn thì dùng 1
        const minQty = fetchedProduct.pricing?.[0]?.minQuantity || 1;
        const defaultQty = minQty <= 10 ? minQty : 1; // Nếu minQty > 10, cho phép user bắt đầu từ 1
        setSelectedQuantity(defaultQty);
      } catch (err: any) {
        console.error("❌ Error fetching product:", err);
        toast.error("Không thể tải thông tin sản phẩm");
        navigate("/shop");
      } finally {
        setLoading(false);
      }
    };
    fetchProduct();
  }, [productId, navigate]);

  // Update price tier based on quantity (giữ nguyên)
  useEffect(() => {
    if (!product?.pricing) return;
    let bestTierIndex = 0;
    for (let i = 0; i < product.pricing.length; i++) {
      if (selectedQuantity >= product.pricing[i].minQuantity) {
        if (
          product.pricing[i].minQuantity >=
          product.pricing[bestTierIndex].minQuantity
        ) {
          bestTierIndex = i;
        }
      }
    }
    setSelectedPriceIndex(bestTierIndex);
  }, [selectedQuantity, product?.pricing]);

  // (Memos giữ nguyên)
  const currentPricePerUnit = useMemo(
    () => product?.pricing[selectedPriceIndex]?.pricePerUnit ?? 0,
    [product, selectedPriceIndex]
  );
  const minQuantity = useMemo(
    () => product?.pricing[0]?.minQuantity || 1,
    [product]
  );
  const inCart = useMemo(
    () => (product ? isInCart(product._id, isAuthenticated) : false),
    [product, isInCart, isAuthenticated, cart] // ✅ Thêm cart để re-compute khi cart thay đổi
  );
  const isCustomizable = useMemo(() => {
    return !!(
      product &&
      product.assets &&
      product.assets.surfaces &&
      product.assets.surfaces.length > 0
    );
  }, [product]);

  // Handlers
  const handleAddToCart = async () => {
    if (!product || isAddingToCart || inCart) return;
    setIsAddingToCart(true);
    try {
      await addToCart({
        productId: product._id,
        quantity: selectedQuantity,
        selectedPriceIndex: selectedPriceIndex,
        customization: customization,
      });
      // ✅ GỠ BỎ TOAST TẠI ĐÂY
      // toast.success("Đã thêm vào giỏ hàng!");
    } catch (err) {
      toast.error("Thêm vào giỏ hàng thất bại");
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
    product,
    loading,
    customization,
    setCustomization,
    selectedQuantity,
    setSelectedQuantity,
    minQuantity,
    currentPricePerUnit,
    inCart,
    isAddingToCart,
    handleAddToCart,
    formatPrice,
    navigate,
    isCustomizable,
  };
};
