// src/features/shop/pages/ProductDetailPage.tsx

import React, { useMemo, lazy, Suspense, useState, useEffect } from "react";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { toast } from "sonner";
import { Breadcrumb } from "@/shared/components/ui/breadcrumb";
import { useProductDetail } from "../hooks/useProductDetail";
import { useNavigate } from "react-router-dom";
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";

// (Imports components con)
import { ProductInfo } from "../components/ProductInfo";
import { ProductCustomization } from "../components/ProductCustomization";
import { ProductPurchase } from "../components/ProductPurchase";
import { ProductImageGallery } from "../components/ProductImageGallery";
import { ProductDetailFooter } from "../components/ProductDetailFooter";
import { ProductPurchaseSheet } from "../components/details/ProductPurchaseSheet";
import { DesignMethodModal } from "../components/DesignMethodModal";
// ✅ SỬA LỖI TS2307: Sửa lại đường dẫn import cho SectionSkeleton
import { SectionSkeleton } from "../components/details/SectionSkeleton";
import { ProductDetailSkeleton } from "@/shared/components/ui/skeleton";

// (Các import động)
// ... (giữ nguyên) ...
const ProductSpecsSection = lazy(
  () => import("../components/details/ProductSpecsSection")
);
const PrinterProfileSection = lazy(
  () => import("../components/details/PrinterProfileSection")
);

// (Component LoadingScreen, ErrorScreen giữ nguyên)
const LoadingScreen = () => <ProductDetailSkeleton />;

const ErrorScreen = ({ message }: { message: string }) => (
  <div className="flex h-[calc(100vh-4rem)] flex-col items-center justify-center gap-4 p-4 text-center">
    <h2 className="text-xl font-semibold text-red-600">
      Không thể tải sản phẩm
    </h2>
    <p className="text-muted-foreground">{message}</p>
    <Button onClick={() => window.location.reload()}>
      <ArrowLeft className="mr-2 h-4 w-4" />
      Thử lại
    </Button>
  </div>
);

// === Component chính ===
const ProductDetailPage = () => {
  // (Toàn bộ logic component... giữ nguyên như bản vá lỗi trước của tôi)
  const navigate = useNavigate();
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"cart" | "buy">("buy");
  const [isDesignModalOpen, setIsDesignModalOpen] = useState(false);
  const productDetailResult = useProductDetail();
  const product = productDetailResult.product;
  const isLoading = productDetailResult.loading;
  const error = null; // Hook doesn't return error

  // ✅ SỬA: Tách riêng các selector để tránh tạo object mới mỗi lần render
  const isAddingToCart = useCartStore((state) => state.isLoading);
  const addToCart = useCartStore((state) => state.addToCart);
  const isInCart = useCartStore((state) => state.isInCart);
  const cart = useCartStore((state) => state.cart); // ✅ Thêm cart để track changes
  
  const { user } = useAuthStore();
  const isAuthenticated = !!user;

  const [selectedQuantity, setSelectedQuantity] = useState(1);

  const { minQuantity, pricePerUnit, formatPrice } = useMemo(() => {
    const minQty = product?.pricing?.[0]?.minQuantity || 1;
    const formatPriceFn = (price: number) =>
      new Intl.NumberFormat("vi-VN", {
        style: "currency",
        currency: "VND",
      }).format(price);

    let price = 0;
    if (product?.pricing && product.pricing.length > 0) {
      const matchingTier = product.pricing
        .slice()
        .reverse()
        .find((tier) => selectedQuantity >= tier.minQuantity);
      if (matchingTier) {
        price = matchingTier.pricePerUnit;
      } else {
        price = product.pricing[0].pricePerUnit;
      }
    }
    return {
      minQuantity: minQty,
      pricePerUnit: price,
      formatPrice: formatPriceFn,
    };
  }, [product, selectedQuantity]);

  useEffect(() => {
    if (product) {
      // ✅ Bắt đầu từ minQuantity để đảm bảo valid, nhưng nếu minQuantity quá lớn thì dùng 1
      const minQty = product.pricing?.[0]?.minQuantity || 1;
      const defaultQty = minQty <= 10 ? minQty : 1; // Nếu minQty > 10, cho phép user bắt đầu từ 1
      setSelectedQuantity(defaultQty);
    }
  }, [product]);

  const inCart = useMemo(() => {
    if (!product) return false;
    return isInCart(product._id, isAuthenticated);
  }, [product, isInCart, isAuthenticated, cart]); // ✅ Thêm cart để re-compute khi cart thay đổi

  const isCustomizable =
    product?.customization?.allowFileUpload ||
    product?.customization?.hasDesignService;

  const handleOpenSheet = (mode: "cart" | "buy") => {
    setSheetMode(mode);
    setIsSheetOpen(true);
  };

  const handleStartEditing = () => {
    if (!product) {
      toast.error("Không tìm thấy thông tin sản phẩm");
      return;
    }

    // ✅ VALIDATION: Kiểm tra điều kiện để vào Editor
    // 1. Kiểm tra product có hỗ trợ design service
    if (!product.customization?.hasDesignService) {
      toast.error(
        "Sản phẩm này không hỗ trợ chỉnh sửa 3D. Vui lòng chọn sản phẩm khác."
      );
      return;
    }

    // 2. Kiểm tra có 3D model URL
    if (!product.assets?.modelUrl) {
      toast.error(
        "Sản phẩm này chưa có mô hình 3D. Vui lòng liên hệ nhà in để được hỗ trợ."
      );
      return;
    }

    // 3. Kiểm tra có surfaces để thiết kế
    if (!product.assets?.surfaces || product.assets.surfaces.length === 0) {
      toast.error(
        "Sản phẩm này chưa có bề mặt có thể thiết kế. Vui lòng liên hệ nhà in."
      );
      return;
    }

    // Tất cả điều kiện đều OK → Mở modal chọn phương thức thiết kế
    setIsDesignModalOpen(true);
  };

  // Handler khi người dùng chọn upload thiết kế
  const handleUploadDesign = (file: File) => {
    console.log("Upload clicked, file:", file);
    // TODO: Implement file upload logic with useMyDesigns hook
    toast.info(`Đã chọn file: ${file.name}. Tính năng đang được phát triển.`);
    // Future: Navigate to editor with uploaded file
    // navigate(`/design-editor?productId=${product._id}`, { state: { uploadedFile: file } });
  };

  // Handler khi người dùng chọn duyệt mẫu
  const handleBrowseTemplates = () => {
    if (!product) return;
    navigate(`/inspiration?category=${product.category}`);
  };

  // Handler khi người dùng chọn tự thiết kế
  const handleDesignFromScratch = () => {
    if (!product) return;
    navigate(`/design-editor?productId=${product._id}`);
  };

  const handleAddToCart = async () => {
    if (!product) return;
    try {
      // Calculate selected price index based on quantity
      let selectedPriceIndex = 0;
      if (product.pricing && product.pricing.length > 0) {
        for (let i = product.pricing.length - 1; i >= 0; i--) {
          if (selectedQuantity >= product.pricing[i].minQuantity) {
            selectedPriceIndex = i;
            break;
          }
        }
      }
      
      await addToCart({
        productId: product._id,
        quantity: selectedQuantity,
        selectedPriceIndex: selectedPriceIndex,
      });
      toast.success("Đã thêm vào giỏ hàng!");
      setIsSheetOpen(false);
    } catch (err: any) {
      toast.error(err.message || "Thêm vào giỏ hàng thất bại");
    }
  };

  const handleBuyNow = async () => {
    if (!product) return;
    try {
      // Calculate selected price index based on quantity
      let selectedPriceIndex = 0;
      if (product.pricing && product.pricing.length > 0) {
        for (let i = product.pricing.length - 1; i >= 0; i--) {
          if (selectedQuantity >= product.pricing[i].minQuantity) {
            selectedPriceIndex = i;
            break;
          }
        }
      }
      
      await addToCart({
        productId: product._id,
        quantity: selectedQuantity,
        selectedPriceIndex: selectedPriceIndex,
      });
      navigate("/checkout");
    } catch (err: any) {
      toast.error(err.message || "Không thể mua ngay");
    }
  };

  if (isLoading) return <LoadingScreen />;
  if (!product) return <ErrorScreen message="Không tìm thấy sản phẩm." />;

  const ShopPanel = isCustomizable ? (
    <ProductCustomization
      onStartEditing={handleStartEditing}
      onPurchase={() => handleOpenSheet("buy")}
      onAddToCart={handleAddToCart}
      isAddingToCart={isAddingToCart}
      inCart={inCart}
      minQuantity={minQuantity}
      selectedQuantity={selectedQuantity}
      onQuantityChange={setSelectedQuantity}
      pricePerUnit={pricePerUnit}
      formatPrice={formatPrice}
    />
  ) : (
    <ProductPurchase
      isAddingToCart={isAddingToCart}
      inCart={inCart}
      minQuantity={minQuantity}
      selectedQuantity={selectedQuantity}
      onQuantityChange={setSelectedQuantity}
      onAddToCart={handleAddToCart}
      onBuyNow={handleBuyNow}
      pricePerUnit={pricePerUnit}
      formatPrice={formatPrice}
    />
  );

  return (
    <div className="container mx-auto max-w-7xl p-4 md:p-6 lg:p-8 relative">
      <div className="mb-4 flex items-center justify-between">
        <Button
          variant="ghost"
          className="lg:hidden"
          onClick={() => navigate(-1)}
        >
          <ArrowLeft className="mr-2 h-4 w-4" />
          Quay lại
        </Button>
        <Breadcrumb
          items={[
            { label: "Trang chủ", href: "/app" },
            { label: "Cửa hàng", href: "/shop" },
            { label: product.name },
          ]}
          className="hidden lg:flex"
        />
      </div>

      <div className="pb-24">
        {/* Layout mới: Image Gallery + Product Info + Purchase Panel (giống Taobao) */}
        <div className="grid grid-cols-1 lg:grid-cols-12 gap-6">
          {/* Cột 1: Image Gallery (5/12) */}
          <div className="lg:col-span-5">
            <ProductImageGallery images={product.images} name={product.name} />
          </div>

          {/* Cột 2: Product Info + Purchase Panel (7/12) */}
          <div className="lg:col-span-7 space-y-6">
            {/* Product Info */}
            <ProductInfo
              product={product}
              currentPricePerUnit={pricePerUnit}
              formatPrice={formatPrice}
            />

            {/* Purchase Panel */}
            <div className="sticky top-4">{ShopPanel}</div>
          </div>
        </div>

        <div className="mt-12 lg:mt-20">
          <Suspense fallback={<SectionSkeleton height="250px" />}>
            <ProductSpecsSection product={product} />
          </Suspense>
          {product.printerInfo && (
            <Suspense fallback={<SectionSkeleton height="400px" />}>
              <PrinterProfileSection printerInfo={product.printerInfo} />
            </Suspense>
          )}
        </div>
      </div>

      <ProductDetailFooter
        isCustomizable={isCustomizable ?? false}
        onOpenSheet={handleOpenSheet}
        onStartEditing={handleStartEditing}
      />

      <ProductPurchaseSheet
        isOpen={isSheetOpen}
        onClose={() => setIsSheetOpen(false)}
        mode={sheetMode}
        product={product}
        onAddToCart={handleAddToCart}
        onBuyNow={handleBuyNow}
        isAddingToCart={isAddingToCart}
        inCart={inCart}
        minQuantity={minQuantity}
        selectedQuantity={selectedQuantity}
        onQuantityChange={setSelectedQuantity}
        formatPrice={formatPrice}
        currentPricePerUnit={pricePerUnit}
      />

      {/* Design Method Selection Modal */}
      <DesignMethodModal
        isOpen={isDesignModalOpen}
        onClose={() => setIsDesignModalOpen(false)}
        onUploadDesign={handleUploadDesign}
        onBrowseTemplates={handleBrowseTemplates}
        onDesignFromScratch={handleDesignFromScratch}
      />
    </div>
  );
};

export default ProductDetailPage;
