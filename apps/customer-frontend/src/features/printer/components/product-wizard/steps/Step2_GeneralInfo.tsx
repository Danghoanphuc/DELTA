// src/features/printer/components/product-wizard/steps/Step2_GeneralInfo.tsx
// ✅ ĐÃ SỬA: onValidate() -> onValidate={() => onValidate(3, ...)}

import { Control, useFormContext, useWatch } from "react-hook-form";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { ProductWizardFormValues } from "@/features/printer/schemas/productWizardSchema";
import { Edit3 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { Badge } from "@/shared/components/ui/badge";
import { printzCategories } from "@/data/categories.data";
import { toLegacyCategory } from "@/features/printer/utils/categoryMapping";
// ✨ SMART PIPELINE: AI-powered components
import { SmartTextarea } from "@/shared/components/ui/SmartTextarea";
import { SmartTagInput } from "@/shared/components/ui/SmartTagInput";

interface StepProps {
  control: Control<ProductWizardFormValues>;
  isExpanded: boolean;
  onExpand: () => void;
  onValidate: () => void; // ✅ Sửa: Hàm onValidate giờ được truyền từ hook
}

export function Step2_GeneralInfo({
  control,
  isExpanded,
  onExpand,
  onValidate,
}: StepProps) {
  const isDisabled = !isExpanded;
  const formContext = useFormContext<ProductWizardFormValues>();
  const categoryDisplayValue = useWatch({
    control,
    name: "categoryDisplay",
  });
  const subcategoryValue = useWatch({
    control,
    name: "subcategory",
  });

  // ✨ SMART PIPELINE: Watch values for AI context
  const productName = useWatch({ control, name: "name" });
  const assetId = useWatch({ control, name: "assetId" });

  const selectedCategory =
    printzCategories.find((cat) => cat.value === categoryDisplayValue) ?? null;
  const selectedSubcategory =
    selectedCategory?.subcategories.find(
      (sub) => sub.value === subcategoryValue
    ) ?? null;

  return (
    <Card
      onClick={onExpand}
      className={isDisabled ? "bg-gray-50" : "cursor-pointer"}
    >
      <CardHeader>
        <CardTitle
          className={`flex items-center gap-2 ${
            isDisabled ? "text-gray-400" : ""
          }`}
        >
          <Edit3 className={isDisabled ? "text-gray-400" : "text-purple-600"} />
          Bước 2: Thông tin chung
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
          <FormField
            control={control}
            name="name"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tên sản phẩm *</FormLabel>
                <FormControl>
                  <Input placeholder="VD: In Ly sứ cao cấp 12oz" {...field} />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          <FormField
            control={control}
            name="categoryDisplay"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Danh mục PrintZ *</FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    formContext?.setValue("category", toLegacyCategory(value));
                    formContext?.setValue("subcategory", "");
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-12">
                      <SelectValue placeholder="Chọn danh mục đang hiển thị ở trang /app" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent className="max-h-[320px]">
                    {printzCategories.map((category) => (
                      <SelectItem
                        key={category.value}
                        value={category.value}
                        className="py-3"
                      >
                        <div className="flex flex-col text-left">
                          <span className="font-medium text-slate-900">
                            {category.label}
                          </span>
                          {category.description && (
                            <span className="text-xs text-slate-500 line-clamp-2">
                              {category.description}
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
          {selectedCategory && (
            <>
              <FormField
                control={control}
                name="subcategory"
                render={({ field }) => (
                  <FormItem>
                    <FormLabel>Phân loại sản phẩm</FormLabel>
                    <Select
                      disabled={!selectedCategory.subcategories.length}
                      value={field.value}
                      onValueChange={(value) => field.onChange(value)}
                    >
                      <FormControl>
                        <SelectTrigger className="h-12">
                          <SelectValue placeholder="Chọn loại sản phẩm cụ thể" />
                        </SelectTrigger>
                      </FormControl>
                      <SelectContent className="max-h-[320px]">
                        {selectedCategory.subcategories
                          .filter((sub) => sub.value && sub.value.trim() !== "")
                          .map((sub) => (
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
          {/* ✨ SMART PIPELINE: AI-powered description */}
          <FormField
            control={control}
            name="description"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Mô tả sản phẩm</FormLabel>
                <FormControl>
                  <SmartTextarea
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Mô tả chi tiết về sản phẩm..."
                    productName={productName}
                    category={categoryDisplayValue}
                    assetName={assetId}
                    intent="description"
                    showAIButton={true}
                    minRows={4}
                    maxRows={12}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* ✨ SMART PIPELINE: AI-powered tags */}
          <FormField
            control={control}
            name="tags"
            render={({ field }) => (
              <FormItem>
                <FormLabel>Tags (từ khóa)</FormLabel>
                <FormControl>
                  <SmartTagInput
                    tags={field.value || []}
                    onChange={field.onChange}
                    maxTags={10}
                    placeholder="Nhập tag và nhấn Enter..."
                    productName={productName}
                    category={categoryDisplayValue}
                    showAIButton={true}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />
          {/* ✅ SỬA: Gọi hàm onValidate (đã được bọc logic) */}
          <Button type="button" onClick={onValidate}>
            Tiếp tục (Qua Bước 3)
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
