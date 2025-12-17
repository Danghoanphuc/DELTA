// apps/admin-frontend/src/components/products/form-sections/GallerySection.tsx
// Section 5: Product Gallery

import { useState } from "react";
import { Upload, X, Star, Loader2 } from "lucide-react";
import { StorytellingProductFormData } from "../../../types/storytelling-product";
import { uploadService } from "../../../services/upload.service";
import { useToast } from "@/hooks/use-toast";

interface GallerySectionProps {
  formData: StorytellingProductFormData;
  updateFormData: (updates: Partial<StorytellingProductFormData>) => void;
  errors: Record<string, string>;
}

export function GallerySection({
  formData,
  updateFormData,
  errors,
}: GallerySectionProps) {
  const { toast } = useToast();
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (!file.type.startsWith("image/")) {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file ảnh",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 5MB)
    if (file.size > 5 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Kích thước ảnh không được vượt quá 5MB",
        variant: "destructive",
      });
      return;
    }

    setIsUploadingImage(true);
    try {
      const result = await uploadService.uploadImage(file, "product");
      updateFormData({
        images: [
          ...formData.images,
          {
            url: result,
            isPrimary: formData.images.length === 0,
            alt: file.name,
          },
        ],
      });
      toast({
        title: "Thành công",
        description: "Upload ảnh thành công!",
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Upload ảnh thất bại",
        variant: "destructive",
      });
    } finally {
      setIsUploadingImage(false);
    }
  };

  const handleDocumentUpload = async (
    type: "portfolio" | "catalogue" | "certificate",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    // Validate file type
    if (file.type !== "application/pdf") {
      toast({
        title: "Lỗi",
        description: "Vui lòng chọn file PDF",
        variant: "destructive",
      });
      return;
    }

    // Validate file size (max 10MB)
    if (file.size > 10 * 1024 * 1024) {
      toast({
        title: "Lỗi",
        description: "Kích thước file không được vượt quá 10MB",
        variant: "destructive",
      });
      return;
    }

    setUploadingDoc(type);
    try {
      const result = await uploadService.uploadDocument(file);
      updateFormData({
        documents: {
          ...formData.documents,
          [type]: {
            url: result,
            filename: file.name,
          },
        },
      });
      toast({
        title: "Thành công",
        description: `Upload ${type} thành công!`,
      });
    } catch (error: any) {
      console.error("Upload error:", error);
      toast({
        title: "Lỗi",
        description: error.message || "Upload file thất bại",
        variant: "destructive",
      });
    } finally {
      setUploadingDoc(null);
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    updateFormData({ images: newImages });
  };

  const setPrimaryImage = (index: number) => {
    const newImages = formData.images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    updateFormData({ images: newImages });
  };

  const addImage = () => {
    const mockUrl = `https://placehold.co/800x600?text=Product+${
      formData.images.length + 1
    }`;
    updateFormData({
      images: [
        ...formData.images,
        {
          url: mockUrl,
          isPrimary: formData.images.length === 0,
          alt: `Product ${formData.images.length + 1}`,
        },
      ],
    });
  };

  return (
    <div className="space-y-8">
      {/* Product Images */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Hình ảnh sản phẩm</h3>
        <p className="text-sm text-gray-600">
          Upload ảnh chi tiết sản phẩm. Ảnh đầu tiên sẽ là ảnh chính.
        </p>

        <div className="grid grid-cols-3 gap-4">
          {formData.images.map((img, index) => (
            <div key={index} className="relative group">
              <img
                src={img.url}
                alt={img.alt || `Image ${index + 1}`}
                className="w-full h-48 object-cover rounded-lg border-2 border-gray-200"
              />
              {img.isPrimary && (
                <div className="absolute top-2 left-2 px-2 py-1 bg-orange-500 text-white text-xs rounded flex items-center gap-1">
                  <Star className="w-3 h-3 fill-current" />
                  Chính
                </div>
              )}
              <div className="absolute top-2 right-2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                {!img.isPrimary && (
                  <button
                    type="button"
                    onClick={() => setPrimaryImage(index)}
                    className="p-2 bg-white rounded-full hover:bg-gray-100"
                    title="Đặt làm ảnh chính"
                  >
                    <Star className="w-4 h-4" />
                  </button>
                )}
                <button
                  type="button"
                  onClick={() => removeImage(index)}
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-4 h-4" />
                </button>
              </div>
            </div>
          ))}

          {/* Add Image Button */}
          <button
            type="button"
            onClick={addImage}
            className="h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex flex-col items-center justify-center"
          >
            <Upload className="h-8 w-8 text-gray-400" />
            <span className="mt-2 text-sm text-gray-600">Thêm ảnh</span>
          </button>
        </div>
      </div>

      {/* Documents & Downloads */}
      <div className="space-y-4">
        <h3 className="text-lg font-semibold">Tài liệu & Chứng thực</h3>
        <p className="text-sm text-gray-600">
          Upload các file PDF để khách hàng có thể tải xuống
        </p>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          {/* Portfolio PDF */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Hồ Sơ Tác Phẩm (PDF)
            </label>
            {formData.documents?.portfolio ? (
              <div className="space-y-2">
                <p className="text-sm text-green-600">
                  ✓ {formData.documents.portfolio.filename}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    updateFormData({
                      documents: {
                        ...formData.documents,
                        portfolio: undefined,
                      },
                    })
                  }
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Xóa
                </button>
              </div>
            ) : (
              <label className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm hover:bg-gray-50 cursor-pointer block text-center">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleDocumentUpload("portfolio", e)}
                  className="hidden"
                />
                <Upload className="w-4 h-4 inline mr-2" />
                Upload PDF
              </label>
            )}
          </div>

          {/* E-Catalogue PDF */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              E-Catalogue (PDF)
            </label>
            {formData.documents?.catalogue ? (
              <div className="space-y-2">
                <p className="text-sm text-green-600">
                  ✓ {formData.documents.catalogue.filename}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    updateFormData({
                      documents: {
                        ...formData.documents,
                        catalogue: undefined,
                      },
                    })
                  }
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Xóa
                </button>
              </div>
            ) : (
              <label className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm hover:bg-gray-50 cursor-pointer block text-center">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleDocumentUpload("catalogue", e)}
                  className="hidden"
                />
                <Upload className="w-4 h-4 inline mr-2" />
                Upload PDF
              </label>
            )}
          </div>

          {/* Certificate PDF */}
          <div className="border-2 border-dashed border-gray-300 rounded-lg p-4">
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Chứng Thực Nguồn Gốc (PDF)
            </label>
            {formData.documents?.certificate ? (
              <div className="space-y-2">
                <p className="text-sm text-green-600">
                  ✓ {formData.documents.certificate.filename}
                </p>
                <button
                  type="button"
                  onClick={() =>
                    updateFormData({
                      documents: {
                        ...formData.documents,
                        certificate: undefined,
                      },
                    })
                  }
                  className="text-sm text-red-600 hover:text-red-700"
                >
                  Xóa
                </button>
              </div>
            ) : (
              <label className="w-full py-2 px-4 border border-gray-300 rounded-md text-sm hover:bg-gray-50 cursor-pointer block text-center">
                <input
                  type="file"
                  accept=".pdf"
                  onChange={(e) => handleDocumentUpload("certificate", e)}
                  className="hidden"
                />
                <Upload className="w-4 h-4 inline mr-2" />
                Upload PDF
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
