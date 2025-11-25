// src/features/printer/components/product-wizard/steps/Step2_GeneralInfo.tsx

import { useState } from "react";
import { Control, useFormContext, useWatch } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Button } from "@/shared/components/ui/button";
import { ProductWizardFormValues } from "@/features/printer/schemas/productWizardSchema";
import { ArrowRight, Sparkles, Text, Tag, Layers, Bot } from "lucide-react";
import { printzCategories } from "@/data/categories.data";
import { toLegacyCategory } from "@/features/printer/utils/categoryMapping";
import { SmartTextarea } from "@/shared/components/ui/SmartTextarea";
import { SmartTagInput } from "@/shared/components/ui/SmartTagInput";
import { cn } from "@/shared/lib/utils";

interface StepProps {
  control: Control<ProductWizardFormValues>;
  isExpanded: boolean;
  onExpand: () => void;
  onValidate: () => void;
}

export function Step2_GeneralInfo({
  control,
  onValidate,
}: StepProps) {
  const formContext = useFormContext<ProductWizardFormValues>();
  const categoryDisplayValue = useWatch({ control, name: "categoryDisplay" });
  const subcategoryValue = useWatch({ control, name: "subcategory" });
  
  // AI Context
  const productName = useWatch({ control, name: "name" });
  const assetId = useWatch({ control, name: "assetId" });

  const selectedCategory = printzCategories.find((cat) => cat.value === categoryDisplayValue);

  // State giả lập loading cho nút AI mới
  const [isAiGenerating, setIsAiGenerating] = useState(false);

  const handleAiGenerate = () => {
    setIsAiGenerating(true);
    // Giả lập hành động gọi API
    setTimeout(() => setIsAiGenerating(false), 1500);
  };

  return (
    <div className="flex flex-col h-full animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* --- HEADER: Clean & Minimal --- */}
      <div className="mb-8">
        <h3 className="text-xl font-bold text-slate-900 flex items-center gap-2">
          <span className="w-8 h-8 rounded-lg bg-slate-100 flex items-center justify-center text-slate-500">
            <Text size={18} />
          </span>
          Thông tin định danh
        </h3>
        <p className="text-sm text-slate-500 mt-1 ml-10">
          Thiết lập tên, phân loại và nội dung hiển thị cho sản phẩm.
        </p>
      </div>

      {/* --- FORM CONTENT --- */}
      <div className="space-y-8 flex-1">
        
        {/* 1. Tên Sản Phẩm (Style Input Lớn) */}
        <FormField
          control={control}
          name="name"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-slate-700 ml-1">
                Tên sản phẩm (SKU Name) <span className="text-red-500">*</span>
              </FormLabel>
              <FormControl>
                <div className="relative group">
                  <Input 
                    placeholder="VD: Card Visit Giấy Mỹ Thuật (Hộp 100 cái)" 
                    className="h-12 pl-4 pr-10 text-base bg-white border-slate-200 rounded-xl focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all shadow-sm"
                    {...field} 
                  />
                  {/* AI Suggest Button (Icon nhỏ gọn trong input) */}
                  <button 
                    type="button"
                    onClick={handleAiGenerate}
                    className="absolute right-3 top-1/2 -translate-y-1/2 text-slate-300 hover:text-blue-600 transition-colors p-1 rounded-md hover:bg-blue-50"
                    title="Gợi ý tên chuẩn SEO"
                  >
                    <Sparkles size={16} className={cn(isAiGenerating && "animate-spin text-blue-500")} />
                  </button>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 2. Phân Loại (Grid 2 Cột) */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <FormField
            control={control}
            name="categoryDisplay"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
                  <Layers size={14} className="text-slate-400" /> Danh mục chính
                </FormLabel>
                <Select
                  onValueChange={(value) => {
                    field.onChange(value);
                    formContext?.setValue("category", toLegacyCategory(value));
                    formContext?.setValue("subcategory", "");
                  }}
                  value={field.value}
                >
                  <FormControl>
                    <SelectTrigger className="h-11 bg-white border-slate-200 rounded-xl focus:ring-4 focus:ring-slate-100">
                      <SelectValue placeholder="Chọn danh mục..." />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {printzCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />

          <FormField
            control={control}
            name="subcategory"
            render={({ field }) => (
              <FormItem>
                <FormLabel className="text-sm font-semibold text-slate-700 ml-1">
                  Loại chi tiết
                </FormLabel>
                <Select
                  disabled={!selectedCategory?.subcategories.length}
                  value={field.value}
                  onValueChange={field.onChange}
                >
                  <FormControl>
                    <SelectTrigger className="h-11 bg-white border-slate-200 rounded-xl focus:ring-4 focus:ring-slate-100">
                      <SelectValue placeholder="---" />
                    </SelectTrigger>
                  </FormControl>
                  <SelectContent>
                    {selectedCategory?.subcategories.map((sub) => (
                      <SelectItem key={sub.value} value={sub.value}>
                        {sub.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
                <FormMessage />
              </FormItem>
            )}
          />
        </div>

        {/* 3. Mô Tả (AI Integration - Thiết kế lại) */}
        <FormField
          control={control}
          name="description"
          render={({ field }) => (
            <FormItem>
              <div className="flex justify-between items-end mb-2">
                <FormLabel className="text-sm font-semibold text-slate-700 ml-1">Mô tả chi tiết</FormLabel>
                {/* Nút ASK ZIN MỚI: Đẹp hơn, clean hơn */}
                <Button
                  type="button"
                  variant="ghost"
                  size="sm"
                  onClick={handleAiGenerate}
                  className="h-7 px-3 text-xs font-medium text-purple-600 bg-purple-50 hover:bg-purple-100 hover:text-purple-700 rounded-full border border-purple-100 transition-all flex items-center gap-1.5"
                >
                  {isAiGenerating ? (
                    <><Sparkles size={12} className="animate-spin" /> Đang viết...</>
                  ) : (
                    <><Bot size={14} /> Ask Zin</>
                  )}
                </Button>
              </div>
              <FormControl>
                <div className="relative shadow-sm rounded-xl overflow-hidden border border-slate-200 focus-within:border-purple-500 focus-within:ring-4 focus-within:ring-purple-500/10 transition-all">
                  <SmartTextarea
                    value={field.value || ""}
                    onChange={field.onChange}
                    placeholder="Mô tả về chất liệu, công nghệ in, ưu điểm nổi bật của sản phẩm..."
                    productName={productName}
                    category={categoryDisplayValue}
                    assetName={assetId}
                    intent="description"
                    showAIButton={false} // ❌ Ẩn nút mặc định xấu xí
                    minRows={6}
                    className="border-0 focus-visible:ring-0 resize-y bg-white text-base"
                  />
                  {/* Decor góc dưới */}
                  <div className="absolute bottom-2 right-2 pointer-events-none">
                    <Sparkles size={12} className="text-purple-200" />
                  </div>
                </div>
              </FormControl>
              <FormMessage />
            </FormItem>
          )}
        />

        {/* 4. Tags (Giao diện Tag Input sạch) */}
        <FormField
          control={control}
          name="tags"
          render={({ field }) => (
            <FormItem>
              <FormLabel className="text-sm font-semibold text-slate-700 ml-1 flex items-center gap-2">
                <Tag size={14} className="text-slate-400" /> Từ khóa (Tags)
              </FormLabel>
              <FormControl>
                <div className="bg-white border border-slate-200 rounded-xl p-1 focus-within:border-blue-500 focus-within:ring-4 focus-within:ring-blue-500/10 transition-all">
                  <SmartTagInput
                    tags={field.value || []}
                    onChange={field.onChange}
                    maxTags={10}
                    placeholder="Nhập tag và nhấn Enter..."
                    productName={productName}
                    category={categoryDisplayValue}
                    showAIButton={false} // Ẩn nút AI mặc định
                  />
                </div>
              </FormControl>
              <div className="flex items-center gap-2 mt-2 ml-1">
                <span className="text-[10px] text-slate-400 uppercase font-bold tracking-wider">Gợi ý:</span>
                <div className="flex flex-wrap gap-1">
                  {['in nhanh', 'giá rẻ', 'thiết kế'].map(tag => (
                    <button 
                      key={tag} 
                      type="button"
                      onClick={() => {
                        const currentTags = field.value || [];
                        if (!currentTags.includes(tag)) field.onChange([...currentTags, tag]);
                      }}
                      className="text-[10px] px-2 py-0.5 bg-slate-100 text-slate-500 rounded-full hover:bg-slate-200 transition-colors"
                    >
                      + {tag}
                    </button>
                  ))}
                </div>
              </div>
              <FormMessage />
            </FormItem>
          )}
        />
      </div>

      {/* --- FOOTER ACTION --- */}
      <div className="mt-8 flex justify-end pt-6 border-t border-slate-100">
        <Button 
          type="button" 
          onClick={onValidate}
          size="lg"
          className="bg-slate-900 hover:bg-black text-white font-medium px-8 rounded-xl shadow-lg shadow-slate-200 transition-all hover:scale-[1.02] active:scale-[0.98]"
        >
          Tiếp tục <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>

    </div>
  );
}