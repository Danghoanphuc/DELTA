// apps/customer-frontend/src/features/printer/components/product-wizard/steps/Step3_Images_New.tsx
// ✨ SMART PIPELINE: Async Upload UI

import { Control, useFormContext } from "react-hook-form";
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
import { Progress } from "@/shared/components/ui/progress";
import { ProductWizardFormValues } from "@/features/printer/schemas/productWizardSchema";
import { Image, X, RefreshCw, CheckCircle2, AlertCircle } from "lucide-react";
import { toast } from "sonner";
import { useAsyncUpload } from "@/features/printer/hooks/useAsyncUpload";
import { useEffect } from "react";

interface StepProps {
  control: Control<ProductWizardFormValues>;
  isExpanded: boolean;
  onExpand: () => void;
  onValidate: () => void;
}

/**
 * ✨ STEP 3: ASYNC UPLOAD UI
 * - Upload ngay khi chọn ảnh
 * - Progress bars cho mỗi ảnh
 * - Retry button nếu lỗi
 * - Không chặn UI
 */
export function Step3_Images_New({
  control,
  isExpanded,
  onExpand,
  onValidate,
}: StepProps) {
  const isDisabled = !isExpanded;
  const formContext = useFormContext<ProductWizardFormValues>();

  const {
    queue,
    addToQueue,
    removeFromQueue,
    retryUpload,
    getCompletedFiles,
    getCompletedUrls, // ✨ ADDED: Get URLs instead of Files
    isAllCompleted,
    hasErrors,
    totalProgress,
    completedCount,
    totalCount,
  } = useAsyncUpload();

  // ✨ SMART PIPELINE: Sync completed URLs với form (not Files)
  useEffect(() => {
    if (totalCount > 0) {
      const urls = getCompletedUrls(); // Get URLs instead of Files
      if (urls.length > 0) {
        formContext.setValue("images", urls, {
          shouldDirty: true,
          shouldTouch: true,
          shouldValidate: true,
        });
      }
    }
  }, [totalCount, getCompletedUrls, formContext]);

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const newFiles = Array.from(e.target.files || []);

    // Validate file size (max 5MB)
    const MAX_SIZE = 5 * 1024 * 1024;
    const validFiles: File[] = [];
    const rejectedFiles: { name: string; size: number }[] = [];

    newFiles.forEach((file) => {
      if (file.size <= MAX_SIZE) {
        validFiles.push(file);
      } else {
        rejectedFiles.push({
          name: file.name,
          size: Math.round((file.size / (1024 * 1024)) * 10) / 10,
        });
      }
    });

    // Notify rejected files
    if (rejectedFiles.length > 0) {
      rejectedFiles.forEach((file) => {
        toast.error(
          `❌ "${file.name}" quá lớn (${file.size} MB). Chỉ chấp nhận ảnh ≤ 5MB.`,
          { duration: 5000 }
        );
      });
    }

    // Check total limit (max 10 images)
    if (totalCount + validFiles.length > 10) {
      toast.error(
        `Tối đa 10 ảnh. Bạn đã có ${totalCount} ảnh, chỉ có thể thêm tối đa ${10 - totalCount} ảnh nữa.`
      );
      const allowedFiles = validFiles.slice(0, 10 - totalCount);
      addToQueue(allowedFiles);
    } else if (validFiles.length > 0) {
      addToQueue(validFiles);
      toast.success(
        `✅ Đang upload ${validFiles.length} ảnh. Tổng: ${totalCount + validFiles.length}/10`
      );
    }

    // Reset input
    e.target.value = "";
  };

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
                  Tải lên ảnh (Tối thiểu 1, Tối đa 10. Ảnh đầu tiên là ảnh bìa)
                </FormLabel>
                <FormControl>
                  <Input
                    type="file"
                    accept="image/png, image/jpeg, image/webp"
                    multiple
                    onChange={handleFileChange}
                    disabled={totalCount >= 10}
                  />
                </FormControl>
                <FormMessage />

                {/* Upload Queue */}
                {totalCount > 0 && (
                  <div className="space-y-3 mt-4">
                    {/* Overall progress */}
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-sm">
                        <span className="font-medium">
                          Upload Progress: {completedCount}/{totalCount}
                        </span>
                        <span className="text-muted-foreground">
                          {totalProgress}%
                        </span>
                      </div>
                      <Progress value={totalProgress} className="h-2" />
                    </div>

                    {/* Individual items */}
                    <div className="grid grid-cols-2 sm:grid-cols-3 md:grid-cols-4 gap-3">
                      {queue.map((item, index) => (
                        <div
                          key={index}
                          className="relative aspect-square group border rounded-lg overflow-hidden bg-gray-50"
                        >
                          {/* Preview */}
                          {item.preview && (
                            <img
                              src={item.preview}
                              alt={`Preview ${index + 1}`}
                              className="w-full h-full object-cover"
                            />
                          )}

                          {/* Status overlay */}
                          {item.status === "uploading" && (
                            <div className="absolute inset-0 bg-black/50 flex flex-col items-center justify-center">
                              <Progress
                                value={item.progress}
                                className="w-3/4 h-2"
                              />
                              <span className="text-white text-xs mt-2">
                                {item.progress}%
                              </span>
                            </div>
                          )}

                          {item.status === "completed" && (
                            <div className="absolute top-2 right-2 bg-green-500 rounded-full p-1">
                              <CheckCircle2 className="w-4 h-4 text-white" />
                            </div>
                          )}

                          {item.status === "failed" && (
                            <div className="absolute inset-0 bg-red-500/20 flex flex-col items-center justify-center">
                              <AlertCircle className="w-8 h-8 text-red-500" />
                              <Button
                                type="button"
                                variant="destructive"
                                size="sm"
                                className="mt-2"
                                onClick={() => retryUpload(index)}
                              >
                                <RefreshCw className="w-3 h-3 mr-1" />
                                Retry
                              </Button>
                            </div>
                          )}

                          {/* Remove button */}
                          <Button
                            type="button"
                            variant="destructive"
                            size="icon"
                            className="absolute top-1 right-1 w-6 h-6 rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
                            onClick={() => removeFromQueue(index)}
                          >
                            <X className="w-3 h-3" />
                          </Button>

                          {/* Primary badge */}
                          {index === 0 && item.status === "completed" && (
                            <div className="absolute bottom-1 left-1 bg-blue-600 text-white text-xs px-2 py-0.5 rounded">
                              Ảnh bìa
                            </div>
                          )}
                        </div>
                      ))}
                    </div>

                    {/* Error summary */}
                    {hasErrors && (
                      <div className="text-sm text-red-600">
                        ⚠️ Một số ảnh upload thất bại. Nhấn "Retry" để thử lại.
                      </div>
                    )}
                  </div>
                )}
              </FormItem>
            )}
          />

          <Button
            type="button"
            onClick={onValidate}
            disabled={!isAllCompleted || totalCount === 0}
          >
            {isAllCompleted && totalCount > 0
              ? "Tiếp tục (Qua Bước 4)"
              : "Vui lòng đợi upload hoàn tất..."}
          </Button>
        </CardContent>
      )}
    </Card>
  );
}

