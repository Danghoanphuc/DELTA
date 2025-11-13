// src/features/printer/components/product-wizard/steps/Step3_Images.tsx
// ✅ SỬA LỖI: Import 'useEffect'

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
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { ProductWizardFormValues } from "@/features/printer/schemas/productWizardSchema";
import { Image, X } from "lucide-react";

// ✅ SỬA LỖI TẠI ĐÂY: Thêm 'useEffect' vào import
import { useMemo, useEffect } from "react";

interface StepProps {
  control: Control<ProductWizardFormValues>;
  watchedImages: File[];
  isExpanded: boolean;
  onExpand: () => void;
  onValidate: () => void;
}

export function Step3_Images({
  control,
  watchedImages,
  isExpanded,
  onExpand,
  onValidate,
}: StepProps) {
  const isDisabled = !isExpanded;

  // Tạo URL xem trước cho các file đã chọn
  const previewUrls = useMemo(() => {
    // Nếu không có ảnh, trả về mảng rỗng
    if (!watchedImages) {
      return [];
    }
    return watchedImages.map((file) => URL.createObjectURL(file));
  }, [watchedImages]);

  // Clean up URLs khi component unmount
  // (Hàm này là nguyên nhân gây lỗi 'useEffect is not defined')
  useEffect(() => {
    return () => {
      previewUrls.forEach(URL.revokeObjectURL);
    };
  }, [previewUrls]);

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
          <Image className={isDisabled ? "text-gray-400" : "text-cyan-600"} />
          Bước 3: Upload Ảnh Sản Phẩm *
        </CardTitle>
      </CardHeader>
      {isExpanded && (
        <CardContent className="space-y-4">
          <FormField
            control={control}
            name="images"
            render={({ field }) => (
              <FormItem>
                <FormLabel>
                  Tải lên ảnh (Tối thiểu 1, Tối đa 5. Ảnh đầu tiên là ảnh bìa)
                </FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    multiple
                    onChange={(e) => {
                      const files = Array.from(e.target.files || []);
                      field.onChange(files);
                    }}
                  />
                </FormControl>
                <FormMessage />
              </FormItem>
            )}
          />

          {/* Khung xem trước ảnh */}
          {previewUrls.length > 0 && (
            <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative aspect-square">
                  <img
                    src={url}
                    alt={`Preview ${index + 1}`}
                    className="w-full h-full object-cover rounded-lg border"
                  />
                </div>
              ))}
            </div>
          )}

          <Button type="button" onClick={onValidate}>
            Tiếp tục (Qua Bước 4)
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
