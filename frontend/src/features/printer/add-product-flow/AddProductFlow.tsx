import React, { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/shared/lib/axios";
import ProductViewer3D from "@/features/editor/components/ProductViewer3D";
import {
  Card,
  CardContent,
  CardHeader,
  CardTitle,
} from "@/shared/components/ui/card";
import { Button } from "@/shared/components/ui/button";
import { Input } from "@/shared/components/ui/input";
import { Label } from "@/shared/components/ui/label";
import { Textarea } from "@/shared/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/shared/components/ui/select";
import { Loader2, ArrowLeft, Edit, Upload, Eye } from "lucide-react";

interface AddProductFormProps {
  onFormClose: () => void;
  onProductAdded: () => void;
}

const CATEGORIES = [
  { value: "business-card", label: "Card visit" },
  { value: "mug", label: "Cốc/Ly" },
  { value: "t-shirt", label: "Áo thun" },
  { value: "banner", label: "Banner/Backdrop" },
  { value: "flyer", label: "Tờ rơi" },
  { value: "brochure", label: "Brochure" },
  { value: "sticker", label: "Decal/Sticker" },
  { value: "packaging", label: "Bao bì" },
  { value: "other", label: "Khác" },
];

export const AddProductFlow: React.FC<AddProductFormProps> = ({
  onFormClose,
  onProductAdded,
}) => {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
    watch,
    setValue,
  } = useForm();

  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [defaultAssets, setDefaultAssets] = useState<{
    modelUrl: string;
    dielineUrl: string;
  } | null>(null);
  const [customAssets, setCustomAssets] = useState<{
    modelUrl: string;
    dielineUrl: string;
  } | null>(null);
  const [isUploadingAssets, setIsUploadingAssets] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // ✅ Fetch default 3D assets khi chọn category
  useEffect(() => {
    if (!selectedCategory) return;

    const fetchDefaultAssets = async () => {
      try {
        const res = await api.get(`/products/${selectedCategory}`);
        setDefaultAssets(res.data?.data?.product?.assets || null);
        toast.success("✅ Đã tải lên phôi mặc định!");
      } catch (err) {
        console.error("Lỗi tải phôi mặc định:", err);
        toast.error("Không thể tải phôi 3D mặc định");
      }
    };

    fetchDefaultAssets();
  }, [selectedCategory]);

  // ✅ Upload custom 3D assets (optional)
  const handleUploadCustomAssets = async (e: React.FormEvent) => {
    e.preventDefault();
    const fileInput = document.getElementById("glb-file") as HTMLInputElement;
    const dielineInput = document.getElementById(
      "dieline-file"
    ) as HTMLInputElement;

    if (!fileInput?.files?.[0]) {
      toast.error("Vui lòng chọn file GLB");
      return;
    }

    setIsUploadingAssets(true);
    const formData = new FormData();
    formData.append("modelFile", fileInput.files[0]);
    if (dielineInput?.files?.[0]) {
      formData.append("dielineFile", dielineInput.files[0]);
    }
    formData.append("category", selectedCategory);

    try {
      const res = await api.post("/products/upload-3d-assets", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      setCustomAssets(res.data?.data?.assets);
      toast.success("✅ Đã tải lên phôi 3D tùy chỉnh!");
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi upload phôi 3D");
    } finally {
      setIsUploadingAssets(false);
    }
  };

  // ✅ Handle image preview
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      toast.error("Tối đa 5 ảnh");
      return;
    }

    setImageFiles(files);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  // ✅ HÀM ĐÃ SỬA LỖI GIAO THỨC
  const handleEditInStudio = () => {
    const assets = customAssets || defaultAssets;

    // Kiểm tra an toàn
    if (!assets || !assets.modelUrl || !assets.dielineUrl) {
      toast.error("Chưa có phôi 3D/2D để chỉnh sửa");
      return;
    }

    // ✅ BƯỚC SỬA:
    // Tái cấu trúc "assets" (kiểu cũ) thành "assetsForStudio" (kiểu mới)
    // mà PrinterStudio.tsx (file 144) mong đợi.
    const assetsForStudio = {
      modelUrl: assets.modelUrl,
      surfaces: [
        {
          key: "main_surface", // Key này không quá quan trọng ở bước này
          name: "Mặt chính", // Tên này cũng vậy
          dielineSvgUrl: assets.dielineUrl, // Đây là thứ quan trọng nhất
        },
      ],
    };
    console.log("--- BƯỚC 1: GỬI ĐI ---");
    console.log("Assets gốc (assets):", assets);
    console.log("Assets đóng gói (assetsForStudio):", assetsForStudio);
    // Lưu kiện hàng đã được tái cấu trúc vào localStorage
    localStorage.setItem(
      "tempProductAssets",
      JSON.stringify({
        category: selectedCategory,
        assets: assetsForStudio, // <--- Gửi object đã được tái cấu trúc
      })
    );

    // Điều hướng đến Studio
    navigate("/printer/studio/new");
  };
  // ✅ Submit form
  const onSubmit = async (data: any) => {
    if (!selectedCategory) {
      toast.error("Vui lòng chọn danh mục");
      return;
    }

    setIsSubmitting(true);
    const formData = new FormData();

    // Basic info
    formData.append("name", data.name);
    formData.append("category", selectedCategory);
    formData.append("description", data.description || "");

    // Images
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    // 3D Assets
    const finalAssets = customAssets || defaultAssets;
    if (finalAssets) {
      formData.append("assets", JSON.stringify(finalAssets));
    }

    // Pricing
    formData.append(
      "pricing",
      JSON.stringify([
        {
          minQuantity: 1,
          pricePerUnit: parseInt(data.pricePerUnit),
        },
      ])
    );

    // Production time
    formData.append(
      "productionTime",
      JSON.stringify({
        min: parseInt(data.productionTimeMin || 3),
        max: parseInt(data.productionTimeMax || 7),
      })
    );

    try {
      await api.post("/products", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });
      toast.success("✅ Tạo sản phẩm thành công!");
      onProductAdded();
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi tạo sản phẩm");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit(onSubmit)} className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-xl font-bold">Thêm sản phẩm mới</h2>
          <p className="text-sm text-gray-500">
            Chọn danh mục và thiết kế phôi 3D
          </p>
        </div>
        <Button variant="ghost" onClick={onFormClose} type="button">
          <ArrowLeft className="mr-2" size={18} />
          Quay lại
        </Button>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Left: Form Fields */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Thông tin cơ bản</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Category */}
              <div>
                <Label>Danh mục *</Label>
                <Select onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Chọn danh mục" />
                  </SelectTrigger>
                  <SelectContent>
                    {CATEGORIES.map((cat) => (
                      <SelectItem key={cat.value} value={cat.value}>
                        {cat.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              {/* Name */}
              <div>
                <Label>Tên sản phẩm *</Label>
                <Input
                  {...register("name", { required: true })}
                  placeholder="VD: Card visit cao cấp"
                />
                {errors.name && (
                  <p className="text-xs text-red-500">Tên là bắt buộc</p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label>Mô tả</Label>
                <Textarea
                  {...register("description")}
                  placeholder="Mô tả sản phẩm..."
                  rows={3}
                />
              </div>

              {/* Price */}
              <div>
                <Label>Giá (VNĐ/đơn vị) *</Label>
                <Input
                  type="number"
                  {...register("pricePerUnit", { required: true, min: 100 })}
                  placeholder="10000"
                />
              </div>

              {/* Production Time */}
              <div className="grid grid-cols-2 gap-2">
                <div>
                  <Label>Thời gian sản xuất (min) *</Label>
                  <Input
                    type="number"
                    {...register("productionTimeMin", { required: true })}
                    defaultValue={3}
                  />
                </div>
                <div>
                  <Label>Thời gian sản xuất (max) *</Label>
                  <Input
                    type="number"
                    {...register("productionTimeMax", { required: true })}
                    defaultValue={7}
                  />
                </div>
              </div>

              {/* Images */}
              <div>
                <Label>Ảnh sản phẩm (Tối đa 5)</Label>
                <Input
                  type="file"
                  accept="image/*"
                  multiple
                  onChange={handleImageChange}
                />
                {previewImages.length > 0 && (
                  <div className="grid grid-cols-3 gap-2 mt-2">
                    {previewImages.map((src, i) => (
                      <img
                        key={i}
                        src={src}
                        alt={`Preview ${i}`}
                        className="w-full h-20 object-cover rounded"
                      />
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Custom 3D Upload */}
          {selectedCategory && (
            <Card>
              <CardHeader>
                <CardTitle>Phôi 3D tùy chỉnh (Tùy chọn)</CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <p className="text-xs text-gray-500">
                  Nếu bạn có file GLB riêng, upload tại đây thay vì dùng phôi
                  mặc định
                </p>
                <div>
                  <Label>File GLB</Label>
                  <Input id="glb-file" type="file" accept=".glb,.gltf" />
                </div>
                <div>
                  <Label>File Dieline SVG (Tùy chọn)</Label>
                  <Input id="dieline-file" type="file" accept=".svg" />
                </div>
                <Button
                  type="button"
                  onClick={handleUploadCustomAssets}
                  disabled={isUploadingAssets}
                  variant="outline"
                  className="w-full"
                >
                  {isUploadingAssets ? (
                    <>
                      <Loader2 className="mr-2 animate-spin" size={16} />
                      Đang tải...
                    </>
                  ) : (
                    <>
                      <Upload className="mr-2" size={16} />
                      Tải lên phôi tùy chỉnh
                    </>
                  )}
                </Button>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Right: 3D Preview */}
        <div className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Eye size={18} />
                Preview 3D
              </CardTitle>
            </CardHeader>
            <CardContent>
              {!selectedCategory ? (
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <p className="text-gray-500">Chọn danh mục để xem phôi 3D</p>
                </div>
              ) : defaultAssets || customAssets ? (
                <div className="space-y-3">
                  <div className="h-96 bg-gray-50 rounded-lg overflow-hidden">
                    <ProductViewer3D
                      modelUrl={(customAssets || defaultAssets)!.modelUrl}
                      textureData={null}
                    />
                  </div>
                  <div className="flex gap-2">
                    <Button
                      type="button"
                      onClick={handleEditInStudio}
                      className="flex-1 bg-orange-500 hover:bg-orange-600"
                    >
                      <Edit className="mr-2" size={16} />
                      Chỉnh sửa trong Studio
                    </Button>
                  </div>
                  <p className="text-xs text-gray-500 text-center">
                    {customAssets
                      ? "Đang dùng phôi tùy chỉnh"
                      : "Đang dùng phôi mặc định"}
                  </p>
                </div>
              ) : (
                <div className="h-96 bg-gray-100 rounded-lg flex items-center justify-center">
                  <Loader2 className="animate-spin" size={32} />
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      </div>

      {/* Submit */}
      <div className="flex justify-end gap-2">
        <Button type="button" variant="outline" onClick={onFormClose}>
          Hủy
        </Button>
        <Button type="submit" disabled={isSubmitting || !selectedCategory}>
          {isSubmitting ? (
            <>
              <Loader2 className="mr-2 animate-spin" size={16} />
              Đang tạo...
            </>
          ) : (
            "Tạo sản phẩm"
          )}
        </Button>
      </div>
    </form>
  );
};
