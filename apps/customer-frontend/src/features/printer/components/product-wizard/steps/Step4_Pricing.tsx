// src/features/printer/components/product-wizard/steps/Step4_Pricing.tsx

import { Control, FieldArrayWithId } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { ProductWizardFormValues } from "@/features/printer/schemas/productWizardSchema";
import { DollarSign, Plus, Trash2, TrendingDown, ArrowRight } from "lucide-react";
import { formatPrice } from "@/features/printer/utils/formatters";

interface StepProps {
  control: Control<ProductWizardFormValues>;
  fields: FieldArrayWithId<ProductWizardFormValues, "pricing", "id">[];
  append: (val: { minQuantity: number; pricePerUnit: number }) => void;
  remove: (index: number) => void;
  isExpanded: boolean;
  onExpand: () => void;
  onValidate: () => void;
}

export function Step4_Pricing({
  control,
  fields,
  append,
  remove,
  onValidate,
}: StepProps) {
  
  // Hàm tính % giảm giá so với bậc 1 (để hiển thị gợi ý)
  const getDiscount = (currentPrice: number, basePrice: number) => {
    if (!basePrice || basePrice === 0) return 0;
    const discount = ((basePrice - currentPrice) / basePrice) * 100;
    return Math.max(0, Math.round(discount));
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-dashed border-gray-300">
        <div className="p-2 bg-green-50 rounded-md border border-green-100">
          <DollarSign className="w-5 h-5 text-green-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Cấu hình bảng giá</h3>
          <p className="text-sm text-slate-500">Thiết lập giá theo số lượng (Tier Pricing).</p>
        </div>
      </div>

      {/* Pricing List */}
      <div className="space-y-4">
        {/* Table Header (Giả lập) */}
        <div className="grid grid-cols-12 gap-4 px-4 py-2 bg-slate-100 rounded-t-lg text-xs font-bold text-slate-500 uppercase tracking-wider font-mono">
          <div className="col-span-4">Số lượng (Min)</div>
          <div className="col-span-6">Đơn giá (VNĐ)</div>
          <div className="col-span-2 text-right">Xóa</div>
        </div>

        <div className="space-y-3">
          {fields.map((item, index) => {
            // Lấy giá trị cơ bản để tính discount ảo (chỉ để hiển thị)
            // Lưu ý: Đây là logic UI, dữ liệu thực lấy từ form control
            const isBase = index === 0;
            
            return (
              <div
                key={item.id}
                className="group relative grid grid-cols-12 gap-4 items-start p-4 bg-white border border-slate-200 rounded-lg shadow-sm transition-all hover:border-green-400 hover:shadow-md"
              >
                {/* Cột Số Lượng */}
                <div className="col-span-4">
                  <FormField
                    control={control}
                    name={`pricing.${index}.minQuantity`}
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              className="font-mono font-semibold pl-3 pr-2 h-10 border-slate-200 focus-visible:ring-green-500"
                              {...field}
                              onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                            />
                            <div className="absolute right-3 top-1/2 -translate-y-1/2 text-xs text-slate-400 pointer-events-none">
                              cái
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                </div>

                {/* Cột Đơn Giá */}
                <div className="col-span-6">
                  <FormField
                    control={control}
                    name={`pricing.${index}.pricePerUnit`}
                    render={({ field }) => (
                      <FormItem className="space-y-1">
                        <FormControl>
                          <div className="relative">
                            <Input
                              type="number"
                              className="font-mono font-semibold pl-8 h-10 border-slate-200 focus-visible:ring-green-500 text-green-700"
                              {...field}
                              onChange={(e) => field.onChange(e.target.valueAsNumber || 0)}
                            />
                            <div className="absolute left-3 top-1/2 -translate-y-1/2 text-slate-400 pointer-events-none">
                              ₫
                            </div>
                          </div>
                        </FormControl>
                        <FormMessage className="text-[10px]" />
                      </FormItem>
                    )}
                  />
                  {!isBase && (
                    <div className="flex items-center gap-1 text-[10px] text-green-600 font-medium mt-1 ml-1">
                      <TrendingDown size={10} /> Giá sỉ tốt hơn
                    </div>
                  )}
                </div>

                {/* Cột Action */}
                <div className="col-span-2 flex justify-end pt-1">
                  <Button
                    type="button"
                    variant="ghost"
                    size="icon"
                    onClick={() => remove(index)}
                    disabled={fields.length <= 1}
                    className="text-slate-400 hover:text-red-600 hover:bg-red-50 h-8 w-8"
                  >
                    <Trash2 size={16} />
                  </Button>
                </div>
                
                {/* Connector Line (Trang trí) */}
                {index < fields.length - 1 && (
                  <div className="absolute left-8 -bottom-4 w-0.5 h-4 bg-slate-200 z-0" />
                )}
              </div>
            );
          })}
        </div>

        <Button
          type="button"
          variant="outline"
          onClick={() => append({ minQuantity: 0, pricePerUnit: 0 })}
          className="w-full border-dashed border-slate-300 text-slate-600 hover:border-green-500 hover:text-green-600 hover:bg-green-50 h-12 mt-2"
        >
          <Plus size={16} className="mr-2" /> Thêm mốc số lượng mới
        </Button>
      </div>

      {/* FOOTER ACTION BAR */}
      <div className="mt-8 flex justify-end pt-4 border-t border-gray-100">
        <Button 
          type="button" 
          onClick={onValidate}
          size="lg"
          className="bg-blue-600 hover:bg-blue-700 text-white font-semibold px-8 shadow-lg shadow-blue-100"
        >
          Tiếp tục <ArrowRight className="ml-2 h-4 w-4" />
        </Button>
      </div>
    </div>
  );
}