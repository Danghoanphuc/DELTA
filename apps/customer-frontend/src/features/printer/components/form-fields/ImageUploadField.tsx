// src/features/printer/components/form-fields/ImageUploadField.tsx
// Image upload field với preview

import { useState } from "react";
import { useFormContext } from "react-hook-form";
import { Upload, X, Loader2 } from "lucide-react";
import { toast } from "@/shared/utils/toast";

import {
  FormControl,
  FormField,
  FormItem,
  FormLabel,
  FormMessage,
} from "@/shared/components/ui/form";
import { Button } from "@/shared/components/ui/button";
import { printerService } from "@/services/printer.service";

interface ImageUploadFieldProps {
  name: string;
  label: string;
  currentUrl?: string;
}

export function ImageUploadField({
  name,
  label,
  currentUrl,
}: ImageUploadFieldProps) {
  const form = useFormContext();
  const [preview, setPreview] = useState<string | null>(currentUrl || null);
  const [isUploading, setIsUploading] = useState(false);

  const handleFileChange = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
      return;
    }

    // Show preview
    const reader = new FileReader();
    reader.onloadend = () => {
      setPreview(reader.result as string);
    };
    reader.readAsDataURL(file);

    // Upload to Cloudinary
    setIsUploading(true);
    try {
      const url = await printerService.uploadImage(file);
      form.setValue(name, url);
      toast.success("Tải ảnh lên thành công");
    } catch (error) {
      toast.error("Tải ảnh lên thất bại");
      setPreview(currentUrl || null);
    } finally {
      setIsUploading(false);
    }
  };

  const handleRemove = () => {
    setPreview(null);
    form.setValue(name, "");
  };

  return (
    <FormField
      control={form.control}
      name={name}
      render={({ field }) => (
        <FormItem>
          <FormLabel>{label}</FormLabel>
          <FormControl>
            <div className="space-y-2">
              {preview ? (
                <div className="relative w-full h-48 rounded-lg overflow-hidden border-2 border-gray-200">
                  <img
                    src={preview}
                    alt={label}
                    className="w-full h-full object-cover"
                  />
                  <Button
                    type="button"
                    variant="destructive"
                    size="icon"
                    className="absolute top-2 right-2"
                    onClick={handleRemove}
                    disabled={isUploading}
                  >
                    <X className="w-4 h-4" />
                  </Button>
                  {isUploading && (
                    <div className="absolute inset-0 bg-black/50 flex items-center justify-center">
                      <Loader2 className="w-8 h-8 text-white animate-spin" />
                    </div>
                  )}
                </div>
              ) : (
                <label
                  htmlFor={`${name}-upload`}
                  className="flex flex-col items-center justify-center w-full h-48 border-2 border-dashed border-gray-300 rounded-lg cursor-pointer hover:border-blue-400 hover:bg-blue-50 transition-colors"
                >
                  <div className="flex flex-col items-center justify-center pt-5 pb-6">
                    <Upload className="w-10 h-10 text-gray-400 mb-3" />
                    <p className="mb-2 text-sm text-gray-500">
                      <span className="font-semibold">Click để tải ảnh lên</span>
                    </p>
                    <p className="text-xs text-gray-500">
                      PNG, JPG, WEBP (tối đa 5MB)
                    </p>
                  </div>
                  <input
                    id={`${name}-upload`}
                    type="file"
                    className="hidden"
                    accept="image/*"
                    onChange={handleFileChange}
                    disabled={isUploading}
                  />
                </label>
              )}
            </div>
          </FormControl>
          <FormMessage />
        </FormItem>
      )}
    />
  );
}

