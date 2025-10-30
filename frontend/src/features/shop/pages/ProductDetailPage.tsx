// features/shop/pages/ProductDetailPage.tsx
import { Sidebar } from "@/components/Sidebar";
import { MobileNav } from "@/components/MobileNav";
import { Button } from "@/shared/components/ui/button";
import { ArrowLeft } from "lucide-react";

import { useProductDetail } from "../hooks/useProductDetail";
import { ProductImageGallery } from "../components/ProductImageGallery";
import { ProductInfo } from "../components/ProductInfo";
import { ProductCustomization } from "../components/ProductCustomization";
import { ProductPurchase } from "../components/ProductPurchase";
import { PrinterInfoCard } from "../components/PrinterInfoCard";

export function ProductDetailPage() {
  const {
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
  } = useProductDetail();

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Đang tải sản phẩm...</p>
      </div>
    );
  }
  if (!product) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <p>Không tìm thấy sản phẩm.</p>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <Sidebar />
      <MobileNav />

      <div className="lg:ml-20 pt-16 lg:pt-0">
        <div className="max-w-6xl mx-auto p-4 md:p-6">
          <Button variant="ghost" onClick={() => navigate(-1)} className="mb-4">
            <ArrowLeft size={18} className="mr-2" /> Quay lại
          </Button>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6 lg:gap-10">
            {/* Image Section */}
            <ProductImageGallery images={product.images} name={product.name} />

            {/* Details Section */}
            <div>
              <ProductInfo
                product={product}
                currentPricePerUnit={currentPricePerUnit}
                formatPrice={formatPrice}
              />

              <ProductCustomization
                product={product}
                customization={customization}
                onCustomizationChange={(field, value) =>
                  setCustomization((prev) => ({ ...prev, [field]: value }))
                }
              />

              <ProductPurchase
                minQuantity={minQuantity}
                selectedQuantity={selectedQuantity}
                onQuantityChange={setSelectedQuantity}
                onAddToCart={handleAddToCart}
                isAddingToCart={isAddingToCart}
                inCart={inCart}
              />

              {product.printerInfo && (
                <PrinterInfoCard printerInfo={product.printerInfo} />
              )}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
