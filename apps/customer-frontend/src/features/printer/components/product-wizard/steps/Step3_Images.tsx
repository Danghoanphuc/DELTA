// src/features/printer/components/product-wizard/steps/Step3_Images.tsx
// ✅ SỬA LỖI: Import 'useEffect'

import { Control, useWatch, useFormContext } from "react-hook-form";
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
  isExpanded: boolean;
  onExpand: () => void;
  onValidate: () => void;
}

export function Step3_Images({
  control,
  isExpanded,
  onExpand,
  onValidate,
}: StepProps) {
  const isDisabled = !isExpanded;
  const formContext = useFormContext<ProductWizardFormValues>();
  const watchedImages =
    useWatch({
      control,
      name: "images",
    }) ?? [];

  // Tạo URL xem trước cho các file đã chọn
  const previewUrls = useMemo(() => {
    // Nếu không có ảnh, trả về mảng rỗng
    if (!watchedImages) {
      return [];
    }
    return watchedImages.map((item) => {
      if (item instanceof File) {
        return URL.createObjectURL(item);
      }
      return item.url;
    });
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
              const handleUpdate = (files: (File | { url: string; publicId?: string | undefined; isPrimary?: boolean | undefined; })[]) => {
                field.onChange(files);
                formContext?.setValue("images", files, {
                  shouldDirty: true,
                  shouldTouch: true,
                  shouldValidate: true,
                });
              };

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
                        const existingFiles = watchedImages || [];

                        // ✅ FILTER: Loại bỏ ảnh quá 5MB TRƯỚC KHI merge
                        const MAX_SIZE = 5 * 1024 * 1024; // 5MB
                        const validFiles: File[] = [];
                        const rejectedFiles: { name: string; size: number }[] = [];

                        newFiles.forEach((file) => {
                          if (file.size <= MAX_SIZE) {
                            validFiles.push(file);
                          } else {
                            rejectedFiles.push({
                              name: file.name,
                              size: Math.round(file.size / (1024 * 1024) * 10) / 10, // MB
                            });
                          }
                        });

                        // Thông báo ảnh bị từ chối
                        if (rejectedFiles.length > 0) {
                          rejectedFiles.forEach((file) => {
                            toast.error(
                              `❌ "${file.name}" quá lớn (${file.size} MB). Chỉ chấp nhận ảnh ≤ 5MB.`,
                              { duration: 5000 }
                            );
                          });
                        }

                        // Merge với ảnh hiện tại
                        const mergedFiles = [...existingFiles, ...validFiles];

                        if (mergedFiles.length > 10) {
                          toast.error(
                            `Tối đa 10 ảnh. Bạn đã có ${existingFiles.length} ảnh, chỉ có thể thêm tối đa ${10 - existingFiles.length} ảnh nữa.`
                          );
                          handleUpdate(mergedFiles.slice(0, 10)); // Slice to limit
                        } else {
                          handleUpdate(mergedFiles);
                          if (validFiles.length > 0) {
                            toast.success(
                              `✅ Đã thêm ${validFiles.length} ảnh hợp lệ. Tổng: ${mergedFiles.length}/10`
                            );
                          }
                        }

                        e.target.value = "";
                      }}
                    />
                  </FormControl>
                  <FormMessage />

                  {previewUrls.length > 0 && (
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
                            <Button
                              type="button"
                              variant="destructive"
                              size="icon"
                              className="absolute top-1 right-1 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                              onClick={() => {
                                const newFiles = watchedImages.filter(
                                  (_, i) => i !== index
                                );
                                handleUpdate(newFiles);
                                toast.success("Đã xóa ảnh");
                              }}
                            >
                              <X className="w-3 h-3" />
                            </Button>
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
                </FormItem>
              );
            }}
          />

          <Button type="button" onClick={onValidate}>
            Tiếp tục (Qua Bước 4)
          </Button>
        </CardContent>
      )}
    </Card>
  );
}
