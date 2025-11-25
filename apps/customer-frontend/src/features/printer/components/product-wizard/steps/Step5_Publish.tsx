// src/features/printer/components/product-wizard/steps/Step5_Publish.tsx

import { Control } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormDescription,
} from "@/shared/components/ui/form";
import { Switch } from "@/shared/components/ui/switch";
import { ProductWizardFormValues } from "@/features/printer/schemas/productWizardSchema";
import { Store, CheckCircle2, Rocket, EyeOff } from "lucide-react";
import { cn } from "@/shared/lib/utils";

interface StepProps {
  control: Control<ProductWizardFormValues>;
  isExpanded: boolean;
  onExpand: () => void;
}

export function Step5_Publish({ control }: StepProps) {
  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-dashed border-gray-300">
        <div className="p-2 bg-orange-50 rounded-md border border-orange-100">
          <Store className="w-5 h-5 text-orange-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Hoàn tất & Đăng bán</h3>
          <p className="text-sm text-slate-500">Bước cuối cùng để đưa sản phẩm lên kệ.</p>
        </div>
      </div>

      {/* Main Action Card */}
      <div className="bg-white border border-slate-200 rounded-xl p-1 shadow-sm">
        <FormField
          control={control}
          name="isActive"
          render={({ field }) => (
            <FormItem className="flex flex-row items-start space-x-4 space-y-0 rounded-lg p-5 transition-colors hover:bg-slate-50/50">
              {/* Status Icon Dynamic */}
              <div className={cn(
                "p-3 rounded-full border-4 transition-all duration-300",
                field.value 
                  ? "bg-green-100 border-green-50 text-green-600" 
                  : "bg-slate-100 border-slate-50 text-slate-500"
              )}>
                {field.value ? <Rocket size={24} /> : <EyeOff size={24} />}
              </div>

              <div className="flex-1 space-y-1">
                <FormLabel className="text-base font-bold text-slate-900">
                  {field.value ? "Đăng bán ngay lập tức" : "Lưu nháp (Ẩn sản phẩm)"}
                </FormLabel>
                <FormDescription className="text-slate-500 leading-relaxed">
                  {field.value 
                    ? "Sản phẩm sẽ hiển thị công khai trên sàn PrintZ. Khách hàng có thể tìm kiếm và đặt hàng ngay." 
                    : "Sản phẩm sẽ được lưu vào kho nhưng chưa hiển thị với khách hàng. Bạn có thể đăng bán sau."}
                </FormDescription>
              </div>
              
              <FormControl>
                <Switch
                  checked={field.value}
                  onCheckedChange={field.onChange}
                  className="data-[state=checked]:bg-green-600 scale-110 mt-2"
                />
              </FormControl>
            </FormItem>
          )}
        />
      </div>

      {/* Summary / Checklist (Trang trí) */}
      <div className="bg-blue-50/50 border border-blue-100 rounded-lg p-5 space-y-3">
        <h4 className="font-bold text-blue-800 text-sm flex items-center gap-2">
          <CheckCircle2 size={16} /> Checklist trước khi đăng:
        </h4>
        <ul className="space-y-2 text-sm text-blue-700/80">
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> Kiểm tra kỹ chính tả tên và mô tả sản phẩm.
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> Đảm bảo ảnh sản phẩm sắc nét, không bị vỡ.
          </li>
          <li className="flex items-center gap-2">
            <span className="w-1.5 h-1.5 bg-blue-400 rounded-full" /> Bảng giá đã bao gồm chi phí nguyên vật liệu.
          </li>
        </ul>
      </div>

    </div>
  );
}