// src/features/printer/components/AddProductForm.tsx (ĐÃ CẤU TRÚC LẠI)
// (Giả sử bạn đã tạo các component con này)
// import { TaxonomySelector } from "./form-steps/TaxonomySelector";
// import { GeneralInfoStep } from "./form-steps/GeneralInfoStep";
// import { MetadataStep } from "./form-steps/MetadataStep";
// import { PricingStep } from "./form-steps/PricingStep";
// import { Product3DPreview } from "./form-steps/Product3DPreview";

import { useAddProductForm } from "@/features/printer/hooks/useAddProductForm";
import {
  Form,
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Button } from "@/shared/components/ui/button";
import {
  Card,
  CardHeader,
  CardTitle,
  CardContent,
} from "@/shared/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import {
  ArrowLeft,
  Loader2,
  Package,
} from "lucide-react";
import { Badge } from "@/shared/components/ui/badge";

interface AddProductFormProps {
  onFormClose: () => void;
  onProductAdded: () => void;
}

export function AddProductForm({
  onFormClose,
  onProductAdded,
}: AddProductFormProps) {
  const {
    form,
    isSubmitting,
    selectedCategory,
    selectedSubcategory,
    rootCategories,
    handleCategoryChange,
    handleSubcategoryChange,
    onSubmit,
    onError,
  } = useAddProductForm(onProductAdded);

  const { control, handleSubmit } = form;

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
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Package className="text-blue-600" />
                  Bước 1: Chọn danh mục PrintZ
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <FormField
                  control={control}
                  name="categoryValue"
                  render={({ field }) => (
                    <FormItem>
                      <FormLabel>Danh mục chính *</FormLabel>
                      <Select
                        value={field.value}
                        onValueChange={(value) => {
                          field.onChange(value);
                          handleCategoryChange(value);
                        }}
                      >
                        <FormControl>
                          <SelectTrigger className="h-12">
                            <SelectValue placeholder="Chọn danh mục đang hiển thị ở trang /app" />
                          </SelectTrigger>
                        </FormControl>
                        <SelectContent className="max-h-[320px]">
                          {rootCategories.map((category) => (
                            <SelectItem
                              key={category.value}
                              value={category.value}
                              className="py-3"
                            >
                              <div className="flex flex-col text-left">
                                <span className="font-medium text-slate-900">
                                  {category.label}
                                </span>
                                <span className="text-xs text-slate-500 line-clamp-2">
                                  {category.description}
                                </span>
                              </div>
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                      <FormMessage />
                    </FormItem>
                  )}
                />

                {selectedCategory && (
                  <>
                    <FormField
                      control={control}
                      name="subcategoryValue"
                      render={({ field }) => (
                        <FormItem>
                          <FormLabel>Phân loại sản phẩm</FormLabel>
                          <Select
                            value={field.value}
                            onValueChange={(value) => {
                              field.onChange(value);
                              handleSubcategoryChange(value);
                            }}
                            disabled={selectedCategory.subcategories.length === 0}
                          >
                            <FormControl>
                              <SelectTrigger className="h-12">
                                <SelectValue placeholder="Chọn loại sản phẩm cụ thể" />
                              </SelectTrigger>
                            </FormControl>
                            <SelectContent className="max-h-[320px]">
                              {selectedCategory.subcategories.map((sub) => (
                                <SelectItem key={sub.value} value={sub.value}>
                                  <div className="flex flex-col text-left">
                                    <span className="font-medium text-slate-900">
                                      {sub.label}
                                    </span>
                                    {sub.description && (
                                      <span className="text-xs text-slate-500">
                                        {sub.description}
                                      </span>
                                    )}
                                    {sub.productCount && (
                                      <span className="text-[10px] text-slate-400">
                                        {sub.productCount.toLocaleString()} sản phẩm
                                      </span>
                                    )}
                                  </div>
                                </SelectItem>
                              ))}
                            </SelectContent>
                          </Select>
                          <FormMessage />
                        </FormItem>
                      )}
                    />

                    <div className="rounded-2xl border border-slate-100 bg-slate-50/60 p-4 space-y-3">
                      <div className="flex items-start justify-between gap-4">
                        <div>
                          <p className="font-semibold text-slate-900">
                            {selectedCategory.label}
                          </p>
                          {selectedCategory.description && (
                            <p className="text-xs text-slate-500 mt-1">
                              {selectedCategory.description}
                            </p>
                          )}
                        </div>
                        {typeof selectedCategory.printerCount === "number" && (
                          <span className="text-xs text-slate-500 whitespace-nowrap">
                            {selectedCategory.printerCount} nhà in
                          </span>
                        )}
                      </div>
                      {selectedSubcategory && (
                        <p className="text-xs text-slate-600">
                          Đang chọn:{" "}
                          <span className="font-semibold">
                            {selectedSubcategory.label}
                          </span>
                        </p>
                      )}
                      {selectedCategory.useCases?.length > 0 && (
                        <div className="flex flex-wrap gap-2">
                          {selectedCategory.useCases.slice(0, 4).map((useCase) => (
                            <Badge
                              key={useCase.searchTerm}
                              variant="secondary"
                              className="bg-white text-slate-700 border border-slate-200"
                            >
                              {useCase.emoji} {useCase.label}
                            </Badge>
                          ))}
                        </div>
                      )}
                    </div>
                  </>
                )}
              </CardContent>
            </Card>

            {selectedCategory && (
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
            disabled={isSubmitting || !selectedCategory}
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
