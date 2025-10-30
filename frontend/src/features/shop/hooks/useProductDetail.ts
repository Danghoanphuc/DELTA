// features/shop/hooks/useProductDetail.ts
import { useState, useEffect, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { PrinterProduct } from "@/types/product";
import { PrinterProfile } from "@/types/printerProfile";
import api from "@/shared/lib/axios";
import { toast } from "sonner";
import { useCartStore } from "@/stores/useCartStore";

interface ProductWithPrinter extends PrinterProduct {
  printerInfo?: PrinterProfile;
}

export const useProductDetail = () => {
  const { id: productId } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const { addToCart, isInCart } = useCartStore();

  const [product, setProduct] = useState<ProductWithPrinter | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedPriceIndex, setSelectedPriceIndex] = useState(0);
  const [isAddingToCart, setIsAddingToCart] = useState(false);
  const [customization, setCustomization] = useState({
    notes: "",
    fileUrl: "",
  });

  // Fetch product
  useEffect(() => {
    const fetchProduct = async () => {
      if (!productId) return;
      setLoading(true);
      try {
        const res = await api.get(`/products/${productId}`);
        if (!res.data?.data?.product) {
          throw new Error("Product data not found");
        }
        const fetchedProduct = res.data.data.product as ProductWithPrinter;
        setProduct(fetchedProduct);
        if (fetchedProduct.pricing && fetchedProduct.pricing.length > 0) {
          setSelectedQuantity(fetchedProduct.pricing[0].minQuantity || 1);
        }
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

  // Update price tier based on quantity
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

  // Memos
  const currentPricePerUnit = useMemo(
    () => product?.pricing[selectedPriceIndex]?.pricePerUnit ?? 0,
    [product, selectedPriceIndex]
  );
  const minQuantity = useMemo(
    () => product?.pricing[0]?.minQuantity || 1,
    [product]
  );
  const inCart = useMemo(
    () => (product ? isInCart(product._id) : false),
    [product, isInCart]
  );

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
      toast.success("Đã thêm vào giỏ hàng!");
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
  };
};
