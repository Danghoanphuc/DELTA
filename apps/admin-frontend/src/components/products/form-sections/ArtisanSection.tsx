// apps/admin-frontend/src/components/products/form-sections/ArtisanSection.tsx
// Section 8: Artisan & Social Proof - Import from Supplier API

import { useState, useRef, useEffect } from "react";
import {
  Upload,
  X,
  Loader2,
  User,
  ChevronDown,
  Check,
  Search,
} from "lucide-react";
import { uploadService } from "@/services/upload.service";
import { StorytellingProductFormData } from "@/types/storytelling-product";
import { supplierApi, Supplier } from "@/services/catalog.service";
import { toast } from "sonner";

interface ArtisanSectionProps {
  formData: StorytellingProductFormData;
  updateFormData: (updates: Partial<StorytellingProductFormData>) => void;
  errors: Record<string, string>;
}

export function ArtisanSection({
  formData,
  updateFormData,
}: ArtisanSectionProps) {
  // Supplier dropdown state
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoadingSuppliers, setIsLoadingSuppliers] = useState(false);
  const [showSupplierDropdown, setShowSupplierDropdown] = useState(false);
  const [supplierSearch, setSupplierSearch] = useState("");
  const [selectedSupplierId, setSelectedSupplierId] = useState<string | null>(
    null
  );

  // Upload state
  const [isUploadingPhoto, setIsUploadingPhoto] = useState(false);
  const [isUploadingLogo, setIsUploadingLogo] = useState(false);
  const photoInputRef = useRef<HTMLInputElement>(null);
  const logoInputRef = useRef<HTMLInputElement>(null);
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
      toast.error("Không thể tải danh sách đối tác");
    } finally {
      setIsLoadingSuppliers(false);
    }
  };

  // Filter suppliers by search
  const filteredSuppliers = suppliers.filter(
    (s) =>
      s.name.toLowerCase().includes(supplierSearch.toLowerCase()) ||
      s.code.toLowerCase().includes(supplierSearch.toLowerCase())
  );

  // Import artisan info from selected supplier
  const handleSelectSupplier = (supplier: Supplier) => {
    setSelectedSupplierId(supplier._id);
    setShowSupplierDropdown(false);
    setSupplierSearch("");

    const profile = supplier.profile;
    updateFormData({
      artisan: {
        name: supplier.name,
        title: getSupplierTypeLabel(supplier.type),
        photo: profile?.avatar || "",
        bio: profile?.bio || "",
      },
      supplierId: supplier._id,
    });

    toast.success(`Đã import thông tin từ ${supplier.name}`);
  };

  const getSupplierTypeLabel = (type: Supplier["type"]): string => {
    const labels: Record<Supplier["type"], string> = {
      manufacturer: "Nhà sản xuất",
      distributor: "Nhà phân phối",
      printer: "Nhà in ấn",
      dropshipper: "Dropshipper",
      artisan: "Nghệ nhân",
    };
    return labels[type] || type;
  };

  const clearArtisanSelection = () => {
    setSelectedSupplierId(null);
    updateFormData({
      artisan: {
        name: "",
        title: "",
        photo: "",
        bio: "",
      },
      supplierId: undefined,
    });
  };

  const handlePhotoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
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

    setIsUploadingPhoto(true);
    try {
      const url = await uploadService.uploadImage(file);
      updateFormData({
        artisan: {
          name: formData.artisan?.name || "",
          title: formData.artisan?.title || "",
          photo: url,
          bio: formData.artisan?.bio || "",
        },
      });
      toast.success("Upload ảnh thành công!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Không thể upload ảnh");
    } finally {
      setIsUploadingPhoto(false);
      if (photoInputRef.current) photoInputRef.current.value = "";
    }
  };

  const handleLogoUpload = async (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (!file) return;

    if (!file.type.startsWith("image/")) {
      toast.error("Vui lòng chọn file ảnh");
      return;
    }

    if (file.size > 2 * 1024 * 1024) {
      toast.error("Kích thước logo không được vượt quá 2MB");
      return;
    }

    setIsUploadingLogo(true);
    try {
      const url = await uploadService.uploadImage(file);
      updateFormData({
        clientLogos: [...(formData.clientLogos || []), url],
      });
      toast.success("Upload logo thành công!");
    } catch (error: any) {
      console.error("Upload error:", error);
      toast.error(error.message || "Không thể upload logo");
    } finally {
      setIsUploadingLogo(false);
      if (logoInputRef.current) logoInputRef.current.value = "";
    }
  };

  const removeClientLogo = (index: number) => {
    updateFormData({
      clientLogos: formData.clientLogos.filter((_, i) => i !== index),
    });
  };

  // Find selected supplier for display
  const selectedSupplier = suppliers.find((s) => s._id === selectedSupplierId);

  return (
    <div className="space-y-8">
      {/* Import from Supplier Section */}
      <div className="border border-orange-200 bg-orange-50 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-2">
          Import từ Đối tác
        </h3>
        <p className="text-sm text-gray-600 mb-4">
          Chọn đối tác/nghệ nhân để tự động điền thông tin
        </p>

        <div className="relative" ref={dropdownRef}>
          {/* Dropdown trigger */}
          <button
            type="button"
            onClick={() => setShowSupplierDropdown(!showSupplierDropdown)}
            className="w-full flex items-center justify-between px-4 py-3 border border-gray-300 rounded-lg bg-white hover:border-orange-500 focus:outline-none focus:ring-2 focus:ring-orange-500"
          >
            <div className="flex items-center gap-3">
              {selectedSupplier ? (
                <>
                  <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                    {selectedSupplier.profile?.avatar ? (
                      <img
                        src={selectedSupplier.profile.avatar}
                        alt={selectedSupplier.name}
                        className="w-10 h-10 rounded-full object-cover"
                      />
                    ) : (
                      <User className="w-5 h-5 text-gray-400" />
                    )}
                  </div>
                  <div className="text-left">
                    <p className="font-medium text-gray-900">
                      {selectedSupplier.name}
                    </p>
                    <p className="text-sm text-gray-500">
                      {getSupplierTypeLabel(selectedSupplier.type)} •{" "}
                      {selectedSupplier.code}
                    </p>
                  </div>
                </>
              ) : (
                <>
                  <Search className="w-5 h-5 text-gray-400" />
                  <span className="text-gray-500">
                    Tìm và chọn đối tác/nghệ nhân...
                  </span>
                </>
              )}
            </div>
            <ChevronDown
              className={`w-5 h-5 text-gray-400 transition-transform ${
                showSupplierDropdown ? "rotate-180" : ""
              }`}
            />
          </button>

          {/* Dropdown menu */}
          {showSupplierDropdown && (
            <div className="absolute z-50 w-full mt-2 bg-white border border-gray-200 rounded-lg shadow-lg max-h-80 overflow-hidden">
              {/* Search input */}
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <input
                    type="text"
                    value={supplierSearch}
                    onChange={(e) => setSupplierSearch(e.target.value)}
                    placeholder="Tìm theo tên hoặc mã..."
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
                    Không tìm thấy đối tác nào
                  </div>
                ) : (
                  filteredSuppliers.map((supplier) => (
                    <button
                      key={supplier._id}
                      type="button"
                      onClick={() => handleSelectSupplier(supplier)}
                      className={`w-full flex items-center gap-3 px-4 py-3 hover:bg-orange-50 transition-colors ${
                        selectedSupplierId === supplier._id
                          ? "bg-orange-50"
                          : ""
                      }`}
                    >
                      <div className="w-10 h-10 rounded-full bg-gray-100 flex items-center justify-center flex-shrink-0">
                        {supplier.profile?.avatar ? (
                          <img
                            src={supplier.profile.avatar}
                            alt={supplier.name}
                            className="w-10 h-10 rounded-full object-cover"
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
                          {getSupplierTypeLabel(supplier.type)} •{" "}
                          {supplier.code}
                        </p>
                      </div>
                      {selectedSupplierId === supplier._id && (
                        <Check className="w-5 h-5 text-orange-600" />
                      )}
                    </button>
                  ))
                )}
              </div>
            </div>
          )}
        </div>

        {/* Clear selection button */}
        {selectedSupplierId && (
          <button
            type="button"
            onClick={clearArtisanSelection}
            className="mt-3 text-sm text-gray-500 hover:text-red-500"
          >
            Xóa lựa chọn và nhập thủ công
          </button>
        )}
      </div>

      {/* Artisan Information - Manual edit or imported */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Thông tin Nghệ nhân
          {selectedSupplierId && (
            <span className="ml-2 text-sm font-normal text-orange-600">
              (Đã import từ đối tác)
            </span>
          )}
        </h3>

        <div className="space-y-4">
          <div className="grid grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Tên nghệ nhân
              </label>
              <input
                type="text"
                value={formData.artisan?.name || ""}
                onChange={(e) =>
                  updateFormData({
                    artisan: {
                      name: e.target.value,
                      title: formData.artisan?.title || "",
                      photo: formData.artisan?.photo || "",
                      bio: formData.artisan?.bio || "",
                    },
                  })
                }
                placeholder="VD: Nguyễn Văn A"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Danh hiệu
              </label>
              <input
                type="text"
                value={formData.artisan?.title || ""}
                onChange={(e) =>
                  updateFormData({
                    artisan: {
                      name: formData.artisan?.name || "",
                      title: e.target.value,
                      photo: formData.artisan?.photo || "",
                      bio: formData.artisan?.bio || "",
                    },
                  })
                }
                placeholder="VD: Nghệ nhân ưu tú"
                className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
              />
            </div>
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Ảnh chân dung
            </label>
            <input
              ref={photoInputRef}
              type="file"
              accept="image/*"
              onChange={handlePhotoUpload}
              className="hidden"
            />
            {!formData.artisan?.photo ? (
              <button
                type="button"
                onClick={() => photoInputRef.current?.click()}
                disabled={isUploadingPhoto}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg p-8 hover:border-gray-400 disabled:opacity-50"
              >
                {isUploadingPhoto ? (
                  <>
                    <Loader2 className="mx-auto h-8 w-8 text-orange-500 animate-spin" />
                    <p className="mt-2 text-sm text-gray-600">Đang upload...</p>
                  </>
                ) : (
                  <>
                    <Upload className="mx-auto h-8 w-8 text-gray-400" />
                    <p className="mt-2 text-sm text-gray-600">Upload ảnh</p>
                  </>
                )}
              </button>
            ) : (
              <div className="relative inline-block">
                <img
                  src={formData.artisan.photo}
                  alt="Artisan"
                  className="w-32 h-32 object-cover rounded-full"
                />
                <button
                  type="button"
                  onClick={() =>
                    updateFormData({
                      artisan: {
                        name: formData.artisan?.name || "",
                        title: formData.artisan?.title || "",
                        photo: "",
                        bio: formData.artisan?.bio || "",
                      },
                    })
                  }
                  className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full hover:bg-red-600"
                >
                  <X className="w-3 h-3" />
                </button>
              </div>
            )}
          </div>

          <div>
            <label className="block text-sm font-medium text-gray-700 mb-2">
              Tiểu sử
            </label>
            <textarea
              value={formData.artisan?.bio || ""}
              onChange={(e) =>
                updateFormData({
                  artisan: {
                    name: formData.artisan?.name || "",
                    title: formData.artisan?.title || "",
                    photo: formData.artisan?.photo || "",
                    bio: e.target.value,
                  },
                })
              }
              placeholder="Giới thiệu về nghệ nhân..."
              rows={4}
              className="w-full px-4 py-2 border border-gray-300 rounded-md focus:ring-2 focus:ring-orange-500 focus:outline-none"
            />
          </div>
        </div>
      </div>

      {/* Client Logos */}
      <div className="border border-gray-200 rounded-lg p-6">
        <h3 className="text-lg font-semibold text-gray-900 mb-4">
          Khách hàng tin dùng
        </h3>

        <div className="grid grid-cols-6 gap-4">
          {formData.clientLogos?.map((logo, index) => (
            <div key={index} className="relative group">
              <img
                src={logo}
                alt={`Client ${index + 1}`}
                className="w-full h-16 object-contain bg-gray-50 rounded-lg p-2"
              />
              <button
                type="button"
                onClick={() => removeClientLogo(index)}
                className="absolute -top-2 -right-2 p-1 bg-red-500 text-white rounded-full opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <X className="w-3 h-3" />
              </button>
            </div>
          ))}

          <input
            ref={logoInputRef}
            type="file"
            accept="image/*"
            onChange={handleLogoUpload}
            className="hidden"
          />
          <button
            type="button"
            disabled={isUploadingLogo}
            onClick={() => logoInputRef.current?.click()}
            className="h-16 border-2 border-dashed border-gray-300 rounded-lg hover:border-gray-400 flex items-center justify-center disabled:opacity-50"
          >
            {isUploadingLogo ? (
              <Loader2 className="h-5 w-5 text-orange-500 animate-spin" />
            ) : (
              <Upload className="h-5 w-5 text-gray-400" />
            )}
          </button>
        </div>
      </div>
    </div>
  );
}
