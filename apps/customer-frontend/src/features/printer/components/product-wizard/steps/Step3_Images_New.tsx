// src/features/printer/components/product-wizard/steps/Step3_Images_New.tsx

import { useState, useEffect, useRef } from "react";
import { Control, useFormContext } from "react-hook-form";
import {
  FormControl,
  FormField,
  FormItem,
  FormMessage,
} from "@/shared/components/ui/form";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Progress } from "@/shared/components/ui/progress";
import { Alert, AlertDescription, AlertTitle } from "@/shared/components/ui/alert";
import { ProductWizardFormValues } from "@/features/printer/schemas/productWizardSchema";
import { 
  Image as ImageIcon, X, RefreshCw, CheckCircle2, AlertCircle, 
  FileWarning, CloudUpload, Scan, ArrowRight
} from "lucide-react";
import { useAsyncUpload } from "@/features/printer/hooks/useAsyncUpload";
import { cn } from "@/shared/lib/utils";

interface StepProps {
  control: Control<ProductWizardFormValues>;
  isExpanded: boolean;
  onExpand: () => void;
  onValidate: () => void;
}

export function Step3_Images_New({
  control,
  onValidate,
}: StepProps) {
  const formContext = useFormContext<ProductWizardFormValues>();
  const [validationErrors, setValidationErrors] = useState<string[]>([]);

  const {
    queue,
    addToQueue,
    removeFromQueue,
    retryUpload,
    getCompletedUrls,
    isAllCompleted,
    hasErrors,
    totalProgress,
    completedCount,
    totalCount,
  } = useAsyncUpload();

  // --- LOGIC CHỐNG CRASH (GIỮ NGUYÊN) ---
  const prevImagesJsonRef = useRef<string>("");

  useEffect(() => {
    if (totalCount > 0) {
      const urls = getCompletedUrls();
      const currentImagesJson = JSON.stringify(urls);
      const formImages = formContext.getValues("images");
      const formImagesJson = JSON.stringify(formImages);

      if (currentImagesJson === prevImagesJsonRef.current || currentImagesJson === formImagesJson) {
        return; 
      }

      prevImagesJsonRef.current = currentImagesJson;
      formContext.setValue("images", urls, {
        shouldDirty: true, shouldTouch: true, shouldValidate: true, 
      });
    }
  }, [totalCount, getCompletedUrls, formContext, isAllCompleted]);
  // ---------------------------------------

  const handleFileChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    setValidationErrors([]);
    const newFiles = Array.from(e.target.files || []);
    const MAX_SIZE = 5 * 1024 * 1024;
    const validFiles: File[] = [];
    const newErrors: string[] = [];

    newFiles.forEach((file) => {
      if (file.size > MAX_SIZE) {
        newErrors.push(`File "${file.name}" quá lớn (>5MB).`);
      } else if (!file.type.startsWith("image/")) {
        newErrors.push(`File "${file.name}" không phải ảnh.`);
      } else {
        validFiles.push(file);
      }
    });

    const remainingSlots = 10 - totalCount;
    if (validFiles.length > remainingSlots) {
      newErrors.push(`Chỉ được thêm tối đa ${remainingSlots} ảnh nữa.`);
      validFiles.splice(remainingSlots); 
    }

    if (newErrors.length > 0) setValidationErrors(newErrors);
    if (validFiles.length > 0) addToQueue(validFiles);
    e.target.value = "";
  };

  return (
    <div className="space-y-8 animate-in fade-in slide-in-from-bottom-4 duration-500">
      
      {/* Header */}
      <div className="flex items-center gap-3 pb-4 border-b border-dashed border-gray-300">
        <div className="p-2 bg-purple-50 rounded-md border border-purple-100">
          <ImageIcon className="w-5 h-5 text-purple-600" />
        </div>
        <div>
          <h3 className="text-lg font-bold text-slate-900">Thư viện Media</h3>
          <p className="text-sm text-slate-500">Hình ảnh hiển thị trên cửa hàng (Tối đa 10).</p>
        </div>
      </div>

      {/* Inline Error Alert */}
      {validationErrors.length > 0 && (
        <Alert variant="destructive" className="bg-red-50 border-red-200">
          <FileWarning className="h-4 w-4" />
          <AlertTitle>Lỗi file:</AlertTitle>
          <AlertDescription className="text-xs">
            {validationErrors.map((err, idx) => <div key={idx}>• {err}</div>)}
          </AlertDescription>
          <Button 
            variant="ghost" size="icon" onClick={() => setValidationErrors([])}
            className="absolute top-2 right-2 h-6 w-6 text-red-400 hover:text-red-600"
          >
            <X size={14} />
          </Button>
        </Alert>
      )}

      <FormField
        control={control}
        name="images"
        render={({ field }) => (
          <FormItem>
            <FormControl>
              <div className="space-y-6">
                
                {/* --- DROPZONE KỸ THUẬT SỐ --- */}
                <label
                  htmlFor="image-upload-input"
                  className={cn(
                    "group relative flex flex-col items-center justify-center w-full h-40 border-2 border-dashed rounded-xl cursor-pointer transition-all overflow-hidden",
                    totalCount >= 10 
                      ? "bg-gray-100 border-gray-300 cursor-not-allowed" 
                      : "bg-white border-slate-300 hover:border-purple-500 hover:bg-purple-50/30"
                  )}
                >
                  {/* Scanline Effect (Animation) */}
                  <div className="absolute inset-0 bg-[linear-gradient(to_bottom,transparent,rgba(168,85,247,0.05),transparent)] translate-y-[-100%] group-hover:translate-y-[100%] transition-transform duration-1000 pointer-events-none" />
                  
                  <div className="flex flex-col items-center justify-center z-10 text-slate-500 group-hover:text-purple-600 transition-colors">
                    <div className="mb-3 p-3 bg-slate-100 rounded-full group-hover:bg-white group-hover:shadow-md transition-all">
                      <CloudUpload className="w-6 h-6" />
                    </div>
                    <p className="text-sm font-medium">
                      {totalCount >= 10 ? "Đã đầy bộ nhớ" : "Kéo thả hoặc click để tải lên"}
                    </p>
                    <p className="text-[10px] font-mono mt-1 text-slate-400">
                      PNG, JPG, WEBP • MAX 5MB
                    </p>
                  </div>
                  <Input
                    id="image-upload-input" type="file" accept="image/*" multiple
                    className="hidden" onChange={handleFileChange} disabled={totalCount >= 10}
                  />
                </label>

                {/* --- FILM STRIP (GRID ẢNH) --- */}
                {totalCount > 0 && (
                  <div className="bg-slate-50 border border-slate-200 rounded-xl p-4 space-y-4">
                    {/* Progress Header */}
                    <div className="flex justify-between items-center text-xs font-mono text-slate-500">
                      <span className="flex items-center gap-2">
                        <Scan size={14} /> PROCESSING: {completedCount}/{totalCount}
                      </span>
                      <span>{totalProgress}%</span>
                    </div>
                    <Progress 
                      value={totalProgress} 
                      className={cn("h-1.5 bg-slate-200", "[&>div]:bg-purple-500", isAllCompleted && "[&>div]:bg-green-500")} 
                    />

                    {/* Grid Items */}
                    <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-3">
                      {queue.map((item, index) => (
                        <div key={index} className="relative aspect-square bg-white rounded-lg border border-slate-200 overflow-hidden shadow-sm group">
                          {/* Crop Marks Corners (Trang trí) */}
                          <div className="absolute top-0 left-0 w-2 h-2 border-t-2 border-l-2 border-slate-300 rounded-tl-sm pointer-events-none z-20" />
                          <div className="absolute bottom-0 right-0 w-2 h-2 border-b-2 border-r-2 border-slate-300 rounded-br-sm pointer-events-none z-20" />

                          {item.preview ? (
                            <img
                              src={item.preview} alt="Preview"
                              className={cn("w-full h-full object-cover transition-all", item.status === "uploading" && "scale-110 blur-[1px]")}
                            />
                          ) : <div className="w-full h-full bg-slate-100" />}

                          {/* Status Overlay */}
                          {item.status === "uploading" && (
                            <div className="absolute inset-0 flex items-center justify-center bg-black/20">
                              <RefreshCw className="w-5 h-5 text-white animate-spin" />
                            </div>
                          )}
                          {item.status === "completed" && (
                            <div className="absolute bottom-1 right-1 bg-green-500 text-white rounded-full p-0.5 shadow-sm z-10">
                              <CheckCircle2 size={12} />
                            </div>
                          )}
                          {item.status === "failed" && (
                            <div className="absolute inset-0 bg-red-500/20 flex items-center justify-center backdrop-blur-[1px]">
                              <button onClick={() => retryUpload(index)} className="text-[10px] bg-white text-red-600 px-2 py-1 rounded shadow-sm font-bold uppercase">Retry</button>
                            </div>
                          )}

                          {/* Remove Button */}
                          <button
                            onClick={() => removeFromQueue(index)}
                            className="absolute top-1 right-1 bg-slate-900/70 text-white p-1 rounded-full opacity-0 group-hover:opacity-100 transition-opacity hover:bg-red-600 z-30"
                          >
                            <X size={10} />
                          </button>

                          {/* Badge */}
                          {index === 0 && (
                            <div className="absolute top-1 left-1 bg-purple-600 text-white text-[9px] font-bold px-1.5 py-0.5 rounded shadow-sm z-20 font-mono tracking-tight">
                              MAIN
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  </div>
                )}
              </div>
            </FormControl>
            <FormMessage />
          </FormItem>
        )}
      />
     {/* FOOTER ACTION BAR */}
     <div className="mt-8 flex items-center justify-between pt-4 border-t border-gray-100">
         <div className="text-xs text-gray-400 font-medium">
           {isAllCompleted && totalCount > 0 ? "✅ Ảnh đã sẵn sàng" : ""}
         </div>
         
         <Button
          type="button"
          onClick={onValidate}
          size="lg"
          // Chỉ cho đi tiếp khi: Đã upload xong + Có ít nhất 1 ảnh + Không có lỗi
          disabled={!isAllCompleted || totalCount === 0 || hasErrors}
          className={cn(
            "px-8 font-semibold shadow-lg transition-all",
            isAllCompleted && totalCount > 0 
              ? "bg-blue-600 hover:bg-blue-700 text-white shadow-blue-100" 
              : "bg-gray-200 text-gray-400 cursor-not-allowed shadow-none"
          )}
        >
          {(!isAllCompleted && totalCount > 0 && !hasErrors) ? (
             <>Đang tải... ({completedCount}/{totalCount})</>
          ) : (
             <>Tiếp tục <ArrowRight className="ml-2 h-4 w-4" /></>
          )}
        </Button>
      </div>

    </div> // Đóng div bao ngoài cùng
  );
}