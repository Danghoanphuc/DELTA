// apps/admin-frontend/src/components/products/form-sections/GallerySection.tsx
// Section 5: Product Gallery - With Import from Supplier

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  X,
  Star,
  Loader2,
  User,
  ChevronDown,
  Check,
  Search,
  ImagePlus,
} from "lucide-react";
import { StorytellingProductFormData } from "../../../types/storytelling-product";
import { uploadService } from "../../../services/upload.service";
import { supplierApi, Supplier } from "../../../services/catalog.service";
import { toast } from "sonner";

interface GallerySectionProps {
  formData: StorytellingProductFormData;
  updateFormData: (updates: Partial<StorytellingProductFormData>) => void;
  errors: Record<string, string>;
}

export function GallerySection({
  formData,
  updateFormData,
}: GallerySectionProps) {
  const [isUploadingImage, setIsUploadingImage] = useState(false);
  const [uploadingDoc, setUploadingDoc] = useState<string | null>(null);
  const imageInputRef = useRef<HTMLInputElement>(null);

  // Import from supplier state
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState("");
  const dropdownRef = useRef<HTMLDivElement>(null);

  // Fetch suppliers on mount
  useEffect(() => {
    fetchSuppliers();
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setShowSupplierDropdown(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const fetchSuppliers = async () => {
    setIsLoadingSuppliers(true);
    try {
      const data = await supplierApi.getAll({ activeOnly: true });
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  // Filter suppliers that have profile images
  const suppliersWithImages = suppliers.filter(
    (s) => s.profile?.avatar || s.profile?.coverImage
  );

  const filteredSuppliers = suppliersWithImages.filter(
    (s) =>
      s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
      s.code.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  // Import images from supplier
  const handleImportFromSupplier = (supplier: Supplier) => {
    const newImages: Array<{ url: string; isPrimary: boolean; alt?: string }> =
      [];

    // Add cover image first (as primary if no images exist)
    if (supplier.profile?.coverImage) {
      newImages.push({
        url: supplier.profile.coverImage,
        isPrimary: formData.images.length === 0 && newImages.length === 0,
        alt: `${supplier.name} - Cover`,
      });
    }

    // Add avatar
    if (supplier.profile?.avatar) {
      newImages.push({
        url: supplier.profile.avatar,
        isPrimary: formData.images.length === 0 && newImages.length === 0,
        alt: `${supplier.name} - Avatar`,
      });
    }

    if (newImages.length === 0) {
      toast.error("Đối tác này chưa có ảnh để import");
      return;
    }

    updateFormData({
      images: [...formData.images, ...newImages],
    });

    setShowSupplierDropdown(false);
    setSupplierSearch("");
    toast.success(`Đã import ${newImages.length} ảnh từ ${supplier.name}`);
  };

  const handleImageUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > 5 * 1024 * 1024) {
      toast.error("Kích thước ảnh không được vượt quá 5MB");
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
      toast.success("Upload ảnh thành công!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Upload ảnh thất bại");
    } finally {
      setIsUploadingImage(false);
      if (imageInputRef.current) imageInputRef.current.value = "";
    }
  };

  const handleDocumentUpload = async (
    type: "portfolio" | "catalogue" | "certificate",
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      toast.error("Vui lòng chọn file PDF");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      toast.error("Kích thước file không được vượt quá 10MB");
      return;
    }

    setUploadingDoc(type);
    try {
      const result = await uploadService.uploadDocument(file);
      updateFormData({
        documents: {
          ...formData.documents,
          [type]: {
            url: result.url,
            filename: result.filename,
          },
        },
      });
      toast.success(`Upload ${type} thành công!`);
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Upload file thất bại");
    } finally {
      setUploadingDoc(null);
    }
  };

  const removeImage = (index: number) => {
    const newImages = formData.images.filter((_, i) => i !== index);
    // If removed image was primary, set first remaining as primary
    if (formData.images[index]?.isPrimary && newImages.length > 0) {
      newImages[0].isPrimary = true;
    }
    updateFormData({ images: newImages });
  };

  const setPrimaryImage = (index: number) => {
    const newImages = formData.images.map((img, i) => ({
      ...img,
      isPrimary: i === index,
    }));
    updateFormData({ images: newImages });
  };

  return (
    <div className="space-y-8">
      {/* Product Images */}
      <div className="space-y-4">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Hình ảnh sản phẩm</h3>
            <p className="text-sm text-gray-600">
              Upload ảnh chi tiết sản phẩm. Ảnh đầu tiên sẽ là ảnh chính.
            </p>
          </div>

          {/* Import from Supplier button */}
          <div className="relative" ref={dropdownRef}>
            <button
              type="button"
              onClick={() => setShowSupplierDropdown(!showSupplierDropdown)}
              className="px-3 py-2 text-sm bg-orange-100 text-orange-700 rounded-md hover:bg-orange-200 transition-colors flex items-center gap-2"
            >
              <ImagePlus className="w-4 h-4" />
              Import từ Đối tác
              <ChevronDown
                className={`w-4 h-4 transition-transform ${
                  showSupplierDropdown ? "rotate-180" : ""
                }`}
              />
            </button>

            {/* Supplier dropdown */}
            {showSupplierDropdown && (
              <div className="absolute right-0 z-50 w-80 mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
                {/* Search input */}
                <div className="p-3 border-b border-gray-200">
                  <div className="relative">
                    <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                    <input
                      type="text"
                      value={supplierSearch}
                      onChange={(e) => setSupplierSearch(e.target.value)}
                      placeholder="Tìm đối tác có ảnh..."
                      className="w-full pl-9 pr-4 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-orange-500"
                      autoFocus
                    />
                  </div>
                </div>

                {/* Supplier list */}
                <div className="max-h-60 overflow-y-auto">
                  {isLoadingSuppliers ? (
                    <div className="p-4 text-center">
                      <Loader2 className="w-6 h-6 mx-auto text-orange-500 animate-spin" />
                      <p className="text-sm text-gray-500 mt-2">Đang tải...</p>
                    </div>
                  ) : filteredSuppliers.length === 0 ? (
                    <div className="p-4 text-center text-gray-500">
                      {suppliersWithImages.length === 0
                        ? "Chưa có đối tác nào có ảnh"
                        : "Không tìm thấy đối tác"}
                    </div>
                  ) : (
                    filteredSuppliers.map((supplier) => (
                      <button
                        key={supplier._id}
                        type="button"
                        onClick={() => handleImportFromSupplier(supplier)}
                        className="w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors"
                      >
                        <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0 overflow-hidden">
                          {supplier.profile?.avatar ? (
                            <img
                              src={supplier.profile.avatar}
                              alt={supplier.name}
                              className="w-10 h-10 object-cover"
                            />
                          ) : (
                            <User className="w-5 h-5 text-gray-400" />
                          )}
                        </div>
                        <div className="flex-1 text-left">
                          <p className="font-medium text-gray-900">
                            {supplier.name}
                          </p>
                          <p className="text-sm text-gray-500">
                            {[
                              supplier.profile?.avatar && "Avatar",
                              supplier.profile?.coverImage && "Cover",
                            ]
                              .filter(Boolean)
                              .join(" + ")}
                          </p>
                        </div>
                      </button>
                    ))
                  )}
                </div>
              </div>
            )}
          </div>
        </div>

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
          <input
            ref={imageInputRef}
            type="file"
            accept="image/*"
            onChange={handleImageUpload}
            className="hidden"
          />
          <button
            type="button"
            onClick={() => imageInputRef.current?.click()}
            disabled={isUploadingImage}
            className="h-48 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 transition-colors flex flex-col items-center justify-center disabled:opacity-50"
          >
            {isUploadingImage ? (
              <>
                <Loader2 className="h-8 w-8 text-orange-500 animate-spin" />
                <span className="mt-2 text-sm text-gray-600">
                  Đang upload...
                </span>
              </>
            ) : (
              <>
                <Upload className="h-8 w-8 text-gray-400" />
                <span className="mt-2 text-sm text-gray-600">Thêm ảnh</span>
              </>
            )}
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
                {uploadingDoc === "portfolio" ? (
                  <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 inline mr-2" />
                )}
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
                {uploadingDoc === "catalogue" ? (
                  <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 inline mr-2" />
                )}
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
                {uploadingDoc === "certificate" ? (
                  <Loader2 className="w-4 h-4 inline mr-2 animate-spin" />
                ) : (
                  <Upload className="w-4 h-4 inline mr-2" />
                )}
                Upload PDF
              </label>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
