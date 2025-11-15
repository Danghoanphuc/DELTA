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
import { toast } from "sonner";

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
            render={({ field }) => {
              const currentFiles = field.value || [];
              
              return (
                <FormItem>
                  <FormLabel>
                    Tải lên ảnh (Tối thiểu 1, Tối đa 10. Ảnh đầu tiên là ảnh bìa)
                  </FormLabel>
                  <FormControl>
                    <Input
                      type="file"
                      accept="image/png, image/jpeg, image/webp"
                      multiple
                      onChange={(e) => {
                        const newFiles = Array.from(e.target.files || []);
                        const existingFiles = currentFiles || [];
                        
                        // Merge file mới với file cũ
                        const mergedFiles = [...existingFiles, ...newFiles];
                        
                        // Kiểm tra tổng số file không vượt quá 10
                        if (mergedFiles.length > 10) {
                          toast.error(
                            `Tối đa 10 ảnh. Bạn đã có ${existingFiles.length} ảnh, chỉ có thể thêm tối đa ${10 - existingFiles.length} ảnh nữa.`
                          );
                          const allowedNewFiles = mergedFiles.slice(0, 10);
                          field.onChange(allowedNewFiles);
                        } else {
                          field.onChange(mergedFiles);
                          if (newFiles.length > 0) {
                            toast.success(`Đã thêm ${newFiles.length} ảnh. Tổng: ${mergedFiles.length}/10`);
                          }
                        }
                        
                        // Reset input để có thể chọn lại cùng file
                        e.target.value = "";
                      }}
                    />
                  </FormControl>
                  <FormMessage />
                </FormItem>
              );
            }}
          />

          {/* Khung xem trước ảnh */}
          {previewUrls.length > 0 && (
            <FormField
              control={control}
              name="images"
              render={({ field }) => (
                <div className="space-y-2">
                  <p className="text-sm text-gray-600">
                    Đã chọn {watchedImages.length}/10 ảnh
                  </p>
                  <div className="grid grid-cols-3 sm:grid-cols-5 gap-3">
                    {previewUrls.map((url, index) => (
                      <div key={index} className="relative aspect-square group">
                        <img
                          src={url}
                          alt={`Preview ${index + 1}`}
                          className="w-full h-full object-cover rounded-lg border"
                        />
                        {/* Nút xóa ảnh */}
                        <Button
                          type="button"
                          variant="destructive"
                          size="icon"
                          className="absolute top-1 right-1 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                          onClick={() => {
                            const newFiles = watchedImages.filter((_, i) => i !== index);
                            field.onChange(newFiles);
                            toast.success("Đã xóa ảnh");
                          }}
                        >
                          <X className="w-3 h-3" />
                        </Button>
                        {/* Badge số thứ tự */}
                        {index === 0 && (
                          <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                            Ảnh bìa
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </div>
              )}
            />
          )}

          <Button type="button" onClick={onValidate}>
            Tiếp tục (Qua Bước 4)
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
