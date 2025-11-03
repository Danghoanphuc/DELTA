// frontend/src/features/printer/add-product-flow/useAddProductFlow.ts
// ✅ HOOK TRUNG TÂM - Tách toàn bộ logic từ AddProductFlow

import { useState, useEffect } from "react";
import { useForm } from "react-hook-form";
import { useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/shared/lib/axios";

// === TYPES ===
interface Assets {
  modelUrl: string;
  dielineUrl: string;
}

interface FormData {
  name: string;
  category: string;
  description: string;
  pricePerUnit: string;
  productionTimeMin: string;
  productionTimeMax: string;
}

// === CATEGORIES ===
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

export function useAddProductFlow(onProductAdded: () => void) {
  const navigate = useNavigate();
  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm<FormData>();

  // === STATE ===
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [selectedCategory, setSelectedCategory] = useState("");
  const [defaultAssets, setDefaultAssets] = useState<Assets | null>(null);
  const [customAssets, setCustomAssets] = useState<Assets | null>(null);
  const [isUploadingAssets, setIsUploadingAssets] = useState(false);
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);

  // === FETCH DEFAULT ASSETS ===
  useEffect(() => {
    if (!selectedCategory) return;

    // ** KHẮC PHỤC: Reset state khi đổi category **
    setDefaultAssets(null);
    setCustomAssets(null);

    const fetchDefaultAssets = async () => {
      try {
        const res = await api.get(`/products/${selectedCategory}`);
        const assets = res.data?.data?.product?.assets;

        // ✅✅✅ SỬA LỖI TẠI ĐÂY ✅✅✅
        // Đọc 'assets.dielineUrl' thay vì 'assets.surfaces[0].dielineSvgUrl'
        if (assets?.modelUrl && assets?.dielineUrl) {
          setDefaultAssets({
            modelUrl: assets.modelUrl,
            dielineUrl: assets.dielineUrl, // <-- ĐÃ SỬA
          });
          toast.success("✅ Đã tải phôi mặc định!");
        } else {
          // ** THÊM: Thông báo nếu không tìm thấy assets **
          toast.error("Phôi mặc định này thiếu file 3D hoặc Dieline.");
          console.warn(
            "Missing default assets for category:",
            selectedCategory,
            assets
          );
        }
      } catch (err) {
        console.error("Lỗi tải phôi mặc định:", err);
        toast.error("Không thể tải phôi 3D mặc định");
      }
    };

    fetchDefaultAssets();
  }, [selectedCategory]);

  // === HANDLERS ===
  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category);
    setCustomAssets(null); // Reset custom assets
  };

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

      const assets = res.data?.data?.assets;
      if (assets) {
        setCustomAssets({
          modelUrl: assets.modelUrl,
          // ** SỬA: Đọc dielineUrl trước, sau đó mới fallback **
          dielineUrl: assets.dielineUrl || assets.surfaces?.[0]?.dielineSvgUrl,
        });
        toast.success("✅ Đã tải phôi tùy chỉnh!");
      }
    } catch (err: any) {
      toast.error(err.response?.data?.message || "Lỗi upload phôi 3D");
    } finally {
      setIsUploadingAssets(false);
    }
  };

  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length > 5) {
      toast.error("Tối đa 5 ảnh");
      return;
    }

    setImageFiles(files);
    // ** KHẮC PHỤC: Thu hồi URL cũ để tránh rò rỉ bộ nhớ **
    previewImages.forEach(URL.revokeObjectURL);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  // ✅ QUAN TRỌNG: Logic "Chỉnh sửa trong Studio"
  const handleEditInStudio = () => {
    const assets = customAssets || defaultAssets;

    if (!assets || !assets.modelUrl || !assets.dielineUrl) {
      toast.error("Chưa có phôi 3D/2D để chỉnh sửa");
      return;
    }

    // Cấu trúc lại assets theo format mới (đúng với PrinterStudio)
    const assetsForStudio = {
      modelUrl: assets.modelUrl,
      surfaces: [
        {
          key: "main_surface",
          name: "Mặt chính",
          // ** SỬA: Lấy materialName từ API nếu có, nếu không thì fallback **
          // (API của bạn chưa có, nên ta tạm fallback)
          materialName: "Dieline", // Giả định
          dielineSvgUrl: assets.dielineUrl,
        },
      ],
    };

    console.log("[useAddProductFlow] Sending to Studio:", assetsForStudio);

    localStorage.setItem(
      "tempProductAssets",
      JSON.stringify({
        category: selectedCategory,
        assets: assetsForStudio,
      })
    );

    navigate("/printer/studio/new");
  };

  // === SUBMIT ===
  const onSubmit = async (data: FormData) => {
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
      // ** SỬA: Gửi assets theo cấu trúc mới mà API (có vẻ) mong đợi **
      const assetsPayload = {
        modelUrl: finalAssets.modelUrl,
        // Gửi cả 2 dạng để đảm bảo server nhận được
        dielineUrl: finalAssets.dielineUrl,
        surfaces: [
          {
            key: "main_surface",
            name: "Mặt chính",
            materialName: "Dieline",
            dielineSvgUrl: finalAssets.dielineUrl,
          },
        ],
      };
      formData.append("assets", JSON.stringify(assetsPayload));
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
        min: parseInt(data.productionTimeMin || "3"),
        max: parseInt(data.productionTimeMax || "7"),
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

  return {
    // Form
    register,
    handleSubmit,
    errors,
    onSubmit,

    // State
    isSubmitting,
    selectedCategory,
    defaultAssets,
    customAssets,
    isUploadingAssets,
    imageFiles,
    previewImages,

    // Handlers
    handleCategoryChange,
    handleUploadCustomAssets,
    handleImageChange,
    handleEditInStudio,

    // Constants
    CATEGORIES,
  };
}
