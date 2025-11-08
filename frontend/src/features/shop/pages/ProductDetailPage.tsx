// src/features/shop/pages/ProductDetailPage.tsx
// ✅ PHIÊN BẢN TÁI CẤU TRÚC: Đã loại bỏ logic 'isEditing' và trình editor "hybrid".
// Giờ đây trang này chỉ làm nhiệm vụ "Mua sắm".

import React, { useMemo } from "react"; // ❌ Gỡ bỏ useState
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, Loader2, Image as ImageIcon, Box } from "lucide-react"; // ❌ Gỡ bỏ X
import { Skeleton } from "@/shared/components/ui/skeleton";
import { toast } from "sonner";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/shared/components/ui/tabs";
import { cn } from "@/shared/lib/utils";

// Logic (❌ Gỡ bỏ useDesignEditor)
import { useProductDetail } from "../hooks/useProductDetail";
import { DesignSurface } from "@/types/product";
import { Product } from "@/types/product";

// Components
import { ProductInfo } from "../components/ProductInfo";
import { ProductCustomization } from "../components/ProductCustomization";
import { ProductPurchase } from "../components/ProductPurchase";
import { PrinterInfoCard } from "../components/PrinterInfoCard";
// ❌ Gỡ bỏ EditingPanel

// Editor Components (❌ Gỡ bỏ EditorToolbar)
import ProductViewer3D from "@/features/editor/components/ProductViewer3D";
import { ProductImageGallery } from "../components/ProductImageGallery";
import { SurfaceDefinition } from "@/features/editor/hooks/use3DInteraction";

// (Skeleton giữ nguyên)
const DetailPageSkeleton = () => (
  // ... (Không thay đổi)
  <div className="min-h-screen bg-gray-50">
    <Sidebar /> <MobileNav />
    <div className="lg:ml-20 pt-16 lg:pt-0">
      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <Skeleton className="h-8 w-32 mb-4" />
        <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">
          <div className="lg:col-span-3 space-y-4">
            <Skeleton className="aspect-square w-full rounded-lg" />
          </div>
          <div className="lg:col-span-2 space-y-4">
            <Skeleton className="h-10 w-1/2" />{" "}
            <Skeleton className="h-6 w-1/3" />
            <Skeleton className="h-24 w-full rounded-lg" />
            <Skeleton className="h-12 w-full rounded-lg" />
          </div>
        </div>
      </div>
    </div>
  </div>
);

// (ShopPanel giữ nguyên)
const ShopPanel = ({
  product,
  currentPricePerUnit,
  formatPrice,
  customization,
  setCustomization,
  isCustomizable,
  onStartEditing,
  minQuantity,
  selectedQuantity,
  setSelectedQuantity,
  onAddToCart,
  isAddingToCart,
  inCart,
}: any) => (
  <div className="lg:sticky lg:top-24 space-y-4">
    <ProductInfo
      product={product}
      currentPricePerUnit={currentPricePerUnit}
      formatPrice={formatPrice}
    />
    {product.printerInfo && (
      <PrinterInfoCard printerInfo={product.printerInfo} />
    )}

    {isCustomizable ? (
      <ProductCustomization
        product={product}
        customization={customization}
        onCustomizationChange={(field: string, value: string) =>
          setCustomization((prev: any) => ({ ...prev, [field]: value }))
        }
        isCustomizable={isCustomizable}
        onStartEditing={onStartEditing} // Prop này vẫn được giữ
      />
    ) : (
      <ProductPurchase
        minQuantity={minQuantity}
        selectedQuantity={selectedQuantity}
        onQuantityChange={setSelectedQuantity}
        onAddToCart={onAddToCart}
        isAddingToCart={isAddingToCart}
        inCart={inCart}
      />
    )}
  </div>
);

export function ProductDetailPage() {
  // ❌ Gỡ bỏ state 'isEditing'
  // ❌ Gỡ bỏ hook 'useDesignEditor'

  // (Gọi hook 'useProductDetail' giữ nguyên)
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

  // (Logic isLoading giữ nguyên)
  const isLoading = shopLoading;

  // ✅ SỬA: 'surfaceMapping' vẫn cần cho ProductViewer3D (chế độ chỉ xem)
  const surfaceMapping = useMemo((): SurfaceDefinition[] => {
    if (!product?.assets?.surfaces) return [];
    return product.assets.surfaces.map((s: DesignSurface) => ({
      materialName: s.materialName,
      surfaceKey: s.surfaceKey,
      artboardSize: { width: 1024, height: 1024 }, // Tạm thời
    }));
  }, [product]);

  // ✅ SỬA: 'handleStartEditing' giờ sẽ điều hướng (navigate)
  const handleStartEditing = () => {
    if (!product?.assets?.modelUrl) {
      toast.error("Lỗi: Sản phẩm này không hỗ trợ 3D.");
      return;
    }
    // Điều hướng đến trang Editor chuyên dụng
    navigate(`/design-editor?productId=${product._id}`);
  };

  // ❌ Gỡ bỏ 'handleExitEditing'

  // === RENDER ===
  if (isLoading) {
    return <DetailPageSkeleton />;
  }
  if (!product) {
    // ... (fallback giữ nguyên)
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Không tìm thấy sản phẩm.</p>
      </div>
    );
  }

  // === RENDER TRANG SHOP (Đã đơn giản hóa) ===
  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <MobileNav />

      {/* ✅ SỬA: Đã giảm padding-bottom (pb-24 -> pb-8) như đã bàn */}
      <div className="lg:ml-20 pt-4 lg:pt-6 pb-8 lg:pb-6">
        <div className="max-w-7xl mx-auto px-4 md:px-6">
          <Button
            variant="ghost"
            onClick={() => navigate(-1)} // ✅ SỬA: Luôn là navigate(-1)
            className="mb-4"
          >
            <ArrowLeft size={18} className="mr-2" />
            Quay lại
          </Button>

          {/* === BỐ CỤC CỐ ĐỊNH (Không còn 'isEditing') === */}
          <div className="grid grid-cols-1 lg:grid-cols-5 gap-6 lg:gap-10">
            {/* ❌ Gỡ bỏ: Vùng Toolbar bên trái */}

            {/* --- VÙNG TRUNG TÂM: Tabs (3D vs 2D) --- */}
            {/* ✅ SỬA: Layout cố định, không còn 'isEditing' */}
            <div className="lg:col-span-3 relative z-10">
              <Tabs defaultValue="3d-mockup" className="w-full">
                <TabsList className="grid w-full grid-cols-2">
                  <TabsTrigger value="3d-mockup">
                    <Box size={16} className="mr-2" />
                    Mockup 3D
                  </TabsTrigger>
                  <TabsTrigger value="gallery">
                    <ImageIcon size={16} className="mr-2" />
                    Thư viện Ảnh
                  </TabsTrigger>
                </TabsList>

                {/* Tab 1: 3D Viewer (Chế độ chỉ xem) */}
                <TabsContent value="3d-mockup" className="mt-4">
                  <div className="aspect-square w-full rounded-lg overflow-hidden bg-gray-100 border shadow-inner sticky top-24">
                    {product.assets.modelUrl ? (
                      <ProductViewer3D
                        modelUrl={product.assets.modelUrl}
                        onModelLoaded={() => {}} // ❌ Gỡ bỏ setIsModelLoaded
                        decals={[]} // ❌ Luôn rỗng (chỉ xem)
                        surfaceMapping={surfaceMapping}
                        onDrop={() => {}} // ❌ Không làm gì cả
                        onDecalSelect={() => {}} // ❌ Không làm gì cả
                        onDecalUpdate={() => {}} // ❌ Không làm gì cả
                        selectedDecalId={null}
                        gizmoMode={"translate"}
                        isSnapping={false}
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-gray-500">
                        (Sản phẩm không hỗ trợ 3D)
                      </div>
                    )}
                    {/* ❌ Gỡ bỏ logic 'isModelLoaded' phức tạp */}
                  </div>
                </TabsContent>

                {/* Tab 2: 2D Gallery */}
                <TabsContent value="gallery" className="mt-4">
                  <ProductImageGallery
                    images={product.images}
                    name={product.name}
                  />
                </TabsContent>
              </Tabs>
            </div>

            {/* --- VÙNG BÊN PHẢI: Shop Panel --- */}
            {/* ✅ SỬA: Layout cố định, luôn render ShopPanel */}
            <div className="lg:col-span-2 relative z-20">
              <ShopPanel
                product={product}
                currentPricePerUnit={currentPricePerUnit}
                formatPrice={formatPrice}
                customization={customization}
                setCustomization={setCustomization}
                isCustomizable={isCustomizable}
                onStartEditing={handleStartEditing} // ✅ Truyền hàm navigate mới
                minQuantity={minQuantity}
                selectedQuantity={selectedQuantity}
                setSelectedQuantity={setSelectedQuantity}
                onAddToCart={handleAddToCart}
                isAddingToCart={isAddingToCart}
                inCart={inCart}
              />
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
