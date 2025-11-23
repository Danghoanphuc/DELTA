// src/features/printer/components/product-wizard/steps/Step5_Publish.tsx
import { Control } from "react-hook-form";
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
  FormDescription,
} from "@/shared/components/ui/form";
import { Switch } from "@/shared/components/ui/switch";
import { ProductWizardFormValues } from "@/features/printer/schemas/productWizardSchema";
import { CheckCircle, Store } from "lucide-react";

interface StepProps {
  control: Control<ProductWizardFormValues>;
  isExpanded: boolean;
  onExpand: () => void;
}

export function Step5_Publish({ control, isExpanded, onExpand }: StepProps) {
  const isDisabled = !isExpanded;

  return (
    <Card
      onClick={!isExpanded ? onExpand : undefined}
      className={isDisabled ? "bg-gray-50" : "cursor-pointer border-2 hover:border-orange-200 transition-colors"}
    >
      <CardHeader>
        <CardTitle
          className={`flex items-center gap-2 ${
            isDisabled ? "text-gray-400" : "text-green-600"
          }`}
        >
          {isDisabled ? (
             <CheckCircle className="text-gray-400" />
          ) : (
             <Store className="text-orange-500" />
          )}
          Bước 5: Đăng bán & Hoàn tất
        </CardTitle>
      </CardHeader>
      
      {isExpanded && (
        <CardContent className="animate-in slide-in-from-top-2 duration-300">
          {/* Sử dụng FormField tiêu chuẩn của RHF để tránh infinite loop */}
          <FormField
            control={control}
            name="isActive"
            render={({ field }) => (
              <FormItem className="flex flex-row items-center justify-between rounded-lg border p-4 shadow-sm bg-white">
                <div className="space-y-0.5 pr-4">
                  <FormLabel className="text-base font-semibold text-gray-900">
                    Đăng bán ngay lập tức
                  </FormLabel>
                  <FormDescription className="text-sm text-gray-500">
                    Nếu bật, sản phẩm sẽ hiển thị ngay trên cửa hàng của bạn sau khi tạo. 
                    <br/>Nếu tắt, sản phẩm sẽ ở trạng thái "Nháp" (Ẩn).
                  </FormDescription>
                </div>
                
                <FormControl>
                  <Switch
                    checked={field.value}
                    onCheckedChange={field.onChange}
                    className="data-[state=checked]:bg-green-600"
                  />
                </FormControl>
              </FormItem>
            )}
          />
          
          <div className="mt-6 p-4 bg-blue-50 text-blue-700 text-sm rounded-lg flex gap-2 items-start">
            <CheckCircle className="w-5 h-5 shrink-0 mt-0.5" />
            <div>
              <strong>Sẵn sàng để tạo!</strong>
              <p className="mt-1 text-blue-600/90">
                Vui lòng kiểm tra lại thông tin ở các bước trước. Nhấn nút <strong>"Hoàn tất & Tạo sản phẩm"</strong> ở góc phải màn hình (hoặc cuối form) để lưu lại.
              </p>
            </div>
          </div>
        </CardContent>
      )}
    </Card>
  );
}