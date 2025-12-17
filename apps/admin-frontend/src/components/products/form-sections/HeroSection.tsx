// apps/admin-frontend/src/components/products/form-sections/HeroSection.tsx
// Section 2: Hero & Tagline

import { useState, useRef } from "react";
import { Upload, X, Image as ImageIcon, Video, Loader2 } from "lucide-react";
import { StorytellingProductFormData } from "../../../types/storytelling-product";
import { uploadService } from "../../../services/upload.service";
import { toast } from "sonner";

interface HeroSectionProps {
  formData: StorytellingProductFormData;
  updateFormData: (updates: Partial<StorytellingProductFormData>) => void;
  errors: Record<string, string>;
}

export function HeroSection({
  formData,
  updateFormData,
  errors,
}: HeroSectionProps) {
  const [isUploading, setIsUploading] = useState(false);
  const imageInputRef = useRef<HTMLInputElement>(null);
  const videoInputRef = useRef<HTMLInputElement>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh (JPG, PNG, WebP...)");
      return;
    }

    // Validate file size (max 10MB for hero image)
    if (file.size > 10 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 10MB");
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadService.uploadImage(file, "hero");
      updateFormData({
        heroMedia: {
          type: "image",
          url,
        },
      });
      toast.success("Upload ảnh Hero thành công!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Upload ảnh thất bại");
    } finally {
      setIsUploading(false);
      // Reset input để có thể upload lại cùng file
      if (imageInputRef.current) {
        imageInputRef.current.value = "";
      }
    }
  };

  const handleVideoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("video/")) {
      toast.error("Vui lòng chọn file video (MP4, WebM...)");
      return;
    }

    // Validate file size (max 100MB for video)
    if (file.size > 100 * 1024 * 1024) {
      toast.error("Kích thước video không được vượt quá 100MB");
      return;
    }

    setIsUploading(true);
    try {
      const url = await uploadService.uploadVideo(file);
      updateFormData({
        heroMedia: {
          type: "video",
          url,
          thumbnail: url.replace(/\.[^/.]+$/, ".jpg"), // Cloudinary auto-generates thumbnail
        },
      });
      toast.success("Upload video Hero thành công!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Upload video thất bại");
    } finally {
      setIsUploading(false);
      // Reset input để có thể upload lại cùng file
      if (videoInputRef.current) {
        videoInputRef.current.value = "";
      }
    }
  };

  const removeMedia = () => {
    updateFormData({ heroMedia: undefined });
  };

  return (
    <div className="space-y-6">
      {/* Tagline */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Tagline (Câu khẩu hiệu)
        </label>
        <input
          type="text"
          value={formData.tagline}
          onChange={(e) => updateFormData({ tagline: e.target.value })}
          className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500"
          placeholder="VD: Năng lượng từ đất mẹ - Vững chãi tựa bàn thạch"
          maxLength={100}
        />
        <p className="mt-1 text-xs text-gray-500">
          Câu ngắn gọn, ấn tượng (tối đa 100 ký tự)
        </p>
      </div>

      {/* Hero Media */}
      <div>
        <label className="block text-sm font-medium text-gray-700 mb-2">
          Ảnh/Video Hero
        </label>

        {/* Hidden file inputs */}
        <input
          ref={imageInputRef}
          type="file"
          accept="image/*"
          onChange={handleImageUpload}
          className="hidden"
        />
        <input
          ref={videoInputRef}
          type="file"
          accept="video/*"
          onChange={handleVideoUpload}
          className="hidden"
        />

        {!formData.heroMedia ? (
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-8">
            <div className="text-center">
              {isUploading ? (
                <>
                  <Loader2 className="mx-auto h-12 w-12 text-orange-500 animate-spin" />
                  <p className="mt-2 text-sm text-gray-600">
                    Đang upload... Vui lòng chờ
                  </p>
                </>
              ) : (
                <>
                  <Upload className="mx-auto h-12 w-12 text-gray-400" />
                  <p className="mt-2 text-sm text-gray-600">
                    Chọn ảnh hoặc video cho Hero section
                  </p>
                  <p className="text-xs text-gray-400 mt-1">
                    Ảnh: JPG, PNG, WebP (tối đa 10MB) | Video: MP4, WebM (tối đa
                    100MB)
                  </p>
                  <div className="mt-4 flex justify-center gap-3">
                    <button
                      type="button"
                      onClick={() => imageInputRef.current?.click()}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <ImageIcon className="w-4 h-4 inline mr-2" />
                      Upload Ảnh
                    </button>
                    <button
                      type="button"
                      onClick={() => videoInputRef.current?.click()}
                      className="px-4 py-2 text-sm font-medium text-gray-700 bg-white border border-gray-300 rounded-md hover:bg-gray-50"
                    >
                      <Video className="w-4 h-4 inline mr-2" />
                      Upload Video
                    </button>
                  </div>
                </>
              )}
            </div>
          </div>
        ) : (
          <div className="relative">
            <div className="border border-gray-300 rounded-lg overflow-hidden">
              {formData.heroMedia.type === "image" ? (
                <img
                  src={formData.heroMedia.url}
                  alt="Hero"
                  className="w-full h-64 object-cover"
                />
              ) : (
                <div className="relative w-full h-64 bg-gray-900 flex items-center justify-center">
                  <Video className="w-16 h-16 text-white" />
                  <span className="absolute bottom-4 left-4 px-2 py-1 bg-black/70 text-white text-xs rounded">
                    Video
                  </span>
                </div>
              )}
            </div>
            <button
              type="button"
              onClick={removeMedia}
              className="absolute top-2 right-2 p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
            >
              <X className="w-4 h-4" />
            </button>
          </div>
        )}
      </div>
    </div>
  );
}
