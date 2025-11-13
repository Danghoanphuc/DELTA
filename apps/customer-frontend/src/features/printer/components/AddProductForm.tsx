// src/features/printer/components/AddProductForm.tsx (ĐÃ CẤU TRÚC LẠI)
// (Giả sử bạn đã tạo các component con này)
// import { TaxonomySelector } from "./form-steps/TaxonomySelector";
// import { GeneralInfoStep } from "./form-steps/GeneralInfoStep";
// import { MetadataStep } from "./form-steps/MetadataStep";
// import { PricingStep } from "./form-steps/PricingStep";
// import { Product3DPreview } from "./form-steps/Product3DPreview";

import { useAddProductForm } from "@/features/printer/hooks/useAddProductForm";
import { Form } from "@/shared/components/ui/form";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/ui/card";
import {
  ArrowLeft,
  Loader2,
  Package,
  GalleryVertical,
  Square,
  Tally5,
} from "lucide-react";
import ProductViewer3D from "@/features/editor/components/ProductViewer3D";

// ... (Các component con như TaxonomySelector, GeneralInfoStep... sẽ được import ở đây)

interface AddProductFormProps {
  onFormClose: () => void;
  onProductAdded: () => void;
}

// Đây là một component con ví dụ
const TaxonomySelector = ({ categories, onSelect }: any) => (
  <Card>
    <CardHeader>
      <CardTitle>Bước 1: Chọn Phôi</CardTitle>
    </CardHeader>
    {/* ... (Code của Select...)... */}
  </Card>
);

export function AddProductForm({
  onFormClose,
  onProductAdded,
}: AddProductFormProps) {
  const {
    form,
    isSubmitting,
    selectedTaxonomy,
    rootCategories,
    handleTaxonomyChange,
    onSubmit,
    onError,
  } = useAddProductForm(onProductAdded);

  const { control, handleSubmit, watch } = form;
  const watchedDimensions = watch("metadata.dimensions");

  return (
    <Form {...form}>
      <form onSubmit={handleSubmit(onSubmit, onError)} className="space-y-6">
        <Card className="border-none shadow-sm bg-white">
          <CardHeader className="flex flex-row items-center gap-4 space-y-0 border-b">
            <Button variant="ghost" size="icon" onClick={onFormClose}>
              <ArrowLeft />
            </Button>
            <CardTitle>Thêm sản phẩm mới</CardTitle>
          </CardHeader>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* CỘT BÊN TRÁI: FORM */}
          <div className="lg:col-span-2 space-y-6">
            {/* === STEP 1: CHỌN PHÔI === */}
            {/* <TaxonomySelector categories={rootCategories} onSelect={handleTaxonomyChange} /> */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="text-blue-600" />
                  Bước 1: Chọn Phôi (Sản phẩm gốc)
                </CardTitle>
              </CardHeader>
              {/* ... (Code của Select ở đây) ... */}
            </Card>

            {selectedTaxonomy && (
              <>
                {/* === STEP 2: THÔNG TIN CHUNG === */}
                {/* <GeneralInfoStep control={control} /> */}
                <Card>
                  <CardHeader>
                    <CardTitle>Bước 2: Thông tin</CardTitle>
                  </CardHeader>
                  {/* ... (Code của FormField Name/Desc ở đây) ... */}
                </Card>

                {/* === STEP 3: CẤU HÌNH METADATA === */}
                {/* <MetadataStep control={control} taxonomy={selectedTaxonomy} /> */}
                <Card>
                  <CardHeader>
                    <CardTitle>Bước 3: Cấu hình</CardTitle>
                  </CardHeader>
                  {/* ... (Code của FormField Dimensions/Material ở đây) ... */}
                </Card>

                {/* === STEP 4: BẢNG GIÁ === */}
                {/* <PricingStep control={control} /> */}
                <Card>
                  <CardHeader>
                    <CardTitle>Bước 4: Bảng giá</CardTitle>
                  </CardHeader>
                  {/* ... (Code của useFieldArray ở đây) ... */}
                </Card>
              </>
            )}
          </div>

          {/* CỘT BÊN PHẢI: 3D PREVIEW */}
          <div className="lg:col-span-1">
            {/* <Product3DPreview taxonomy={selectedTaxonomy} dimensions={watchedDimensions} /> */}
            <Card className="sticky top-24">
              <CardHeader>
                <CardTitle>Preview 3D</CardTitle>
              </CardHeader>
              <CardContent>
                {/* ... (Code của 3D Viewer ở đây) ... */}
              </CardContent>
            </Card>
          </div>
        </div>

        {/* NÚT SUBMIT */}
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
            disabled={isSubmitting || !selectedTaxonomy}
          >
            {isSubmitting ? (
              <Loader2 className="animate-spin" />
            ) : (
              "Lưu sản phẩm"
            )}
          </Button>
        </div>
      </form>
    </Form>
  );
}
