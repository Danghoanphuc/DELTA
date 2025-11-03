// frontend/src/features/printer/add-product-flow/index.tsx
// ✅ PHIÊN BẢN MODULE HÓA - Kết hợp ưu điểm Flow A & Flow B

import { Button } from "@/shared/components/ui/button";
import { ArrowLeft, Loader2 } from "lucide-react";
import { Card, CardHeader, CardTitle } from "@/shared/components/ui/card";
import { useAddProductFlow } from "./useAddProductFlow";
import { Step1_CategorySelect } from "./Step1_CategorySelect";
import { Step2_BasicInfoForm } from "./Step2_BasicInfoForm";
import { Step3_AssetUpload } from "./Step3_AssetUpload";
import { RightSidebarPreview } from "./RightSidebarPreview";

interface AddProductFlowProps {
  onFormClose: () => void;
  onProductAdded: () => void;
}

export function AddProductFlow({
  onFormClose,
  onProductAdded,
}: AddProductFlowProps) {
  // ✅ HOOK TRUNG TÂM: Tất cả logic đều từ đây
  const {
    register,
    handleSubmit,
    errors,
    onSubmit,
    isSubmitting,
    selectedCategory,
    defaultAssets,
    customAssets,
    isUploadingAssets,
    previewImages,
    handleCategoryChange,
    handleUploadCustomAssets,
    handleImageChange,
    handleEditInStudio,
    CATEGORIES,
  } = useAddProductFlow(onProductAdded);

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* HEADER */}
      <Card className="border-none shadow-sm bg-white">
        <CardHeader className="flex flex-row items-center gap-4 space-y-0 border-b">
          <Button
            variant="ghost"
            size="icon"
            onClick={onFormClose}
            type="button"
          >
            <ArrowLeft />
          </Button>
          <CardTitle>Thêm sản phẩm mới</CardTitle>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* LEFT: FORM (2/3) */}
        <div className="lg:col-span-2 space-y-6">
          {/* STEP 1: CHỌN DANH MỤC */}
          <Step1_CategorySelect
            categories={CATEGORIES}
            selectedCategory={selectedCategory}
            onCategoryChange={handleCategoryChange}
          />

          {selectedCategory && (
            <>
              {/* STEP 2: THÔNG TIN CƠ BẢN */}
              <Step2_BasicInfoForm register={register} errors={errors} />

              {/* STEP 3: UPLOAD ASSETS & IMAGES */}
              <Step3_AssetUpload
                selectedCategory={selectedCategory}
                isUploadingAssets={isUploadingAssets}
                previewImages={previewImages}
                onUploadCustomAssets={handleUploadCustomAssets}
                onImageChange={handleImageChange}
              />
            </>
          )}
        </div>

        {/* RIGHT: 3D PREVIEW (1/3) */}
        <div className="lg:col-span-1">
          <RightSidebarPreview
            selectedCategory={selectedCategory}
            defaultAssets={defaultAssets}
            customAssets={customAssets}
            onEditInStudio={handleEditInStudio}
          />
        </div>
      </div>

      {/* SUBMIT BUTTON */}
      <div className="flex justify-end gap-4 pt-6 border-t">
        <Button
          type="button"
          variant="outline"
          onClick={onFormClose}
          disabled={isSubmitting}
        >
          Hủy
        </Button>
        <Button
          type="submit"
          className="bg-gradient-to-r from-orange-400 to-red-500"
          disabled={isSubmitting || !selectedCategory}
        >
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 animate-spin" />
              Đang tạo...
            </>
          ) : (
            "Tạo sản phẩm"
          )}
        </Button>
      </div>
    </form>
  );
}
