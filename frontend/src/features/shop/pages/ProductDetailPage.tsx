// src/features/shop/pages/ProductDetailPage.tsx
// (Phiên bản "AND" logic + Carousel + Header Nổi)

import React, { useMemo, lazy, Suspense, useState } from "react";
import { Sidebar } from "@/components/Sidebar";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, Loader2, Image as ImageIcon, Box } from "lucide-react";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";
// ✅ BƯỚC 1: Import thêm store để lấy count
import { useCartStore } from "@/stores/useCartStore";
import { useAuthStore } from "@/stores/useAuthStore";

// Hooks
import { useProductDetail } from "../hooks/useProductDetail";
import { SurfaceDefinition } from "@/features/editor/hooks/use3DInteraction";

// Components (Cụm 1 - Tải ngay)
import { ProductInfo } from "../components/ProductInfo";
import { ProductCustomization } from "../components/ProductCustomization";
import { ProductPurchase } from "../components/ProductPurchase";
import { PrinterInfoCard } from "../components/PrinterInfoCard";
import ProductViewer3D from "@/features/editor/components/ProductViewer3D";
import { ProductImageGallery } from "../components/ProductImageGallery";

// Footer và Sheet
import { ProductDetailFooter } from "../components/ProductDetailFooter";
import { ProductPurchaseSheet } from "../components/details/ProductPurchaseSheet";

// ✅ BƯỚC 2: Import Header di động MỚI và CartSidebar
import { ProductDetailMobileHeader } from "../components/details/ProductDetailMobileHeader";
import { CartSidebar } from "@/features/shop/pages/CartSidebar";

// Components (Cụm 2 - Tải động)
import { LazyLoadSection } from "@/shared/components/ui/LazyLoadSection";
import { SectionSkeleton } from "../components/details/SectionSkeleton";

// (Các import động giữ nguyên)
const ProductSpecsSection = lazy(
  () => import("../components/details/ProductSpecsSection")
);
const PrinterProfileSection = lazy(
  () => import("../components/details/PrinterProfileSection")
);

// (Skeleton...)
const LoadingScreen = () => (
  <div className="flex h-screen items-center justify-center">
    <Loader2 className="w-12 h-12 animate-spin text-blue-600" />
  </div>
);

export function ProductDetailPage() {
  const {
    product,
    loading: shopLoading,
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
  } = useProductDetail();

  // ✅ BƯỚC 3: Thêm state quản lý Cart
  const [isCartOpen, setIsCartOpen] = useState(false);
  const { getCartItemCount } = useCartStore();
  const { accessToken } = useAuthStore();
  const cartItemCount = getCartItemCount(!!accessToken);

  // (State cho Bottom Sheet - giữ nguyên)
  const [isSheetOpen, setIsSheetOpen] = useState(false);
  const [sheetMode, setSheetMode] = useState<"cart" | "buy">("cart");

  const isLoading = shopLoading;

  // (surfaceMapping, handleStartEditing, handleBuyNow, handleOpenSheet... giữ nguyên)
  const surfaceMapping = useMemo((): SurfaceDefinition[] => {
    if (!product?.assets?.surfaces) return [];
    return product.assets.surfaces.map((s: any) => ({
      materialName: s.materialName,
      surfaceKey: s.surfaceKey,
      artboardSize: { width: 1024, height: 1024 },
    }));
  }, [product]);

  const handleStartEditing = () => {
    if (!product?.assets?.modelUrl) {
      toast.error("Lỗi: Sản phẩm này không hỗ trợ 3D.");
      return;
    }
    navigate(`/design-editor?productId=${product._id}`);
  };

  const handleBuyNow = async () => {
    if (!inCart) {
      await handleAddToCart();
    }
    if (!useCartStore.getState().isLoading) {
      navigate("/checkout");
    }
  };

  const handleOpenSheet = (mode: "cart" | "buy") => {
    setSheetMode(mode);
    setIsSheetOpen(true);
  };

  if (isLoading || !product) {
    return <LoadingScreen />;
  }

  // *** PANEL BÊN PHẢI (DESKTOP) - LOGIC "AND" ***
  const ShopPanel = (
    <div className="lg:sticky lg:top-24 space-y-4">
      <ProductInfo
        product={product}
        currentPricePerUnit={currentPricePerUnit}
        formatPrice={formatPrice}
      />
      {product.printerInfo && (
        <PrinterInfoCard printerInfo={product.printerInfo} />
      )}

      {/* 1. Luồng Mua (Luôn hiển thị) */}
      <ProductPurchase
        minQuantity={minQuantity}
        selectedQuantity={selectedQuantity}
        onQuantityChange={setSelectedQuantity}
        onAddToCart={handleAddToCart}
        isAddingToCart={isAddingToCart}
        inCart={inCart}
      />

      {/* 2. Luồng Thiết kế (Chỉ hiển thị NẾU là Phôi) */}
      {isCustomizable && (
        <ProductCustomization
          product={product}
          customization={customization}
          onCustomizationChange={(field: any, value: any) =>
            setCustomization((prev: any) => ({ ...prev, [field]: value }))
          }
          onStartEditing={handleStartEditing}
        />
      )}
    </div>
  );

  return (
    <div className="min-h-screen bg-gray-50">
      {/* === SIDDEBAR / HEADER === */}
      <Sidebar />
      {/* ✅ BƯỚC 4: Thêm Header Mobile MỚI */}
      <ProductDetailMobileHeader
        cartItemCount={cartItemCount}
        onBackClick={() => navigate(-1)}
        onCartClick={() => setIsCartOpen(true)}
      />

      {/* === NỘI DUNG CHÍNH === */}
      {/* ✅ SỬA: Đổi pt-4 (desktop) và pt-16 (mobile) */}
      <div className="lg:ml-20 pt-16 lg:pt-6 pb-24 lg:pb-6">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          {/* ✅ BƯỚC 5: Ẩn nút "Quay lại" cũ trên di động (chỉ giữ cho desktop) */}
          <Button
            variant="ghost"
            onClick={() => navigate(-1)}
            className="mb-4 hidden lg:inline-flex"
          >
            <ArrowLeft size={18} className="mr-2" />
            Quay lại
          </Button>

          {/* === CỤM 1: ABOVE THE FOLD (Tải ngay) === */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">
            {/* (Cột Trái (Visual)) */}
            <div className="lg:col-span-3 relative z-10">
              <ProductImageGallery
                images={product.images}
                name={product.name}
              />
            </div>

            {/* Cột Phải (Action) */}
            <div className="lg:col-span-2 relative z-20">
              {ShopPanel} {/* Panel Desktop */}
            </div>
          </div>
          {/* === KẾT THÚC CỤM 1 === */}

          {/* === CỤM 2: LANDING PAGE SECTIONS (Lazy Load) === */}
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
          {/* === KẾT THÚC CỤM 2 === */}
        </div>
      </div>

      {/* === FOOTER DI ĐỘNG (THÔNG MINH) === */}
      <ProductDetailFooter
        isCustomizable={isCustomizable}
        onOpenSheet={handleOpenSheet}
        onStartEditing={handleStartEditing}
      />

      {/* === BOTTOM SHEET (ẨN) === */}
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
        currentPricePerUnit={currentPricePerUnit}
      />

      {/* ✅ BƯỚC 6: Thêm CartSidebar (để nút header hoạt động) */}
      <CartSidebar isOpen={isCartOpen} onClose={() => setIsCartOpen(false)} />
    </div>
  );
}
