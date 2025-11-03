// frontend/src/features/printer/add-product-flow/useAddProductFlow.ts
// ✅ ĐÃ SỬA: Đảm bảo assets structure nhất quán với dielineUrl

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

    // Reset state khi đổi category
    setDefaultAssets(null);
    setCustomAssets(null);

    const fetchDefaultAssets = async () => {
      try {
        console.log(
          `📥 [useAddProductFlow] Fetching default assets for: ${selectedCategory}`
        );

        const res = await api.get(`/products/${selectedCategory}`);
        const product = res.data?.data?.product;
        const assets = product?.assets;

        console.log("📦 [useAddProductFlow] Response assets:", assets);

        if (!assets) {
          throw new Error("Không tìm thấy assets trong response");
        }

        let modelUrl: string | undefined;
        let dielineUrl: string | undefined;

        // ✅ SỬA: Xử lý nhiều format assets
        // Format 1: assets.modelUrl và assets.dielineUrl (mới)
        if (assets.modelUrl && assets.dielineUrl) {
          modelUrl = assets.modelUrl;
          dielineUrl = assets.dielineUrl;
          console.log("✅ Using format 1: assets.modelUrl & assets.dielineUrl");
        }
        // Format 2: assets.modelUrl và assets.surfaces[0].dielineSvgUrl (cũ)
        else if (assets.modelUrl && assets.surfaces?.[0]?.dielineSvgUrl) {
          modelUrl = assets.modelUrl;
          dielineUrl = assets.surfaces[0].dielineSvgUrl;
          console.log(
            "✅ Using format 2: assets.modelUrl & surfaces[0].dielineSvgUrl"
          );
        }
        // Không tìm thấy
        else {
          console.error("❌ Invalid assets structure:", assets);
          throw new Error("Cấu trúc assets không hợp lệ");
        }

        if (!modelUrl || !dielineUrl) {
          console.error("❌ Missing required files:", { modelUrl, dielineUrl });
          throw new Error("Phôi mặc định thiếu file 3D hoặc Dieline");
        }

        setDefaultAssets({ modelUrl, dielineUrl });
        console.log("✅ [useAddProductFlow] Default assets set:", {
          modelUrl,
          dielineUrl,
        });
        toast.success("✅ Đã tải phôi mặc định!");
      } catch (err: any) {
        console.error(
          "❌ [useAddProductFlow] Fetch default assets error:",
          err
        );
        toast.error(err.message || "Không thể tải phôi 3D mặc định");
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
      console.log("📤 [useAddProductFlow] Uploading custom assets...");

      const res = await api.post("/products/upload-3d-assets", formData, {
        headers: { "Content-Type": "multipart/form-data" },
      });

      const assets = res.data?.data?.assets;
      console.log("📦 [useAddProductFlow] Custom assets response:", assets);

      if (!assets) {
        throw new Error("Không nhận được assets từ server");
      }

      let modelUrl: string | undefined;
      let dielineUrl: string | undefined;

      // ✅ SỬA: Xử lý nhiều format response
      if (assets.modelUrl && assets.dielineUrl) {
        modelUrl = assets.modelUrl;
        dielineUrl = assets.dielineUrl;
      } else if (assets.modelUrl && assets.surfaces?.[0]?.dielineSvgUrl) {
        modelUrl = assets.modelUrl;
        dielineUrl = assets.surfaces[0].dielineSvgUrl;
      } else {
        console.error("❌ Invalid custom assets structure:", assets);
        throw new Error("Cấu trúc assets không hợp lệ");
      }

      if (!modelUrl || !dielineUrl) {
        console.error("❌ Missing required files:", { modelUrl, dielineUrl });
        throw new Error("Upload thiếu file 3D hoặc Dieline");
      }

      setCustomAssets({ modelUrl, dielineUrl });
      console.log("✅ [useAddProductFlow] Custom assets set:", {
        modelUrl,
        dielineUrl,
      });
      toast.success("✅ Đã tải phôi tùy chỉnh!");
    } catch (err: any) {
      console.error("❌ [useAddProductFlow] Upload error:", err);
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

    // ✅ SỬA: Cấu trúc lại assets theo format CHUẨN
    const assetsForStudio = {
      modelUrl: assets.modelUrl,
      dielineUrl: assets.dielineUrl, // ✅ Thêm trường này (format mới)
      surfaces: [
        {
          key: "main_surface",
          name: "Mặt chính",
          materialName: "Dieline",
          dielineSvgUrl: assets.dielineUrl, // ✅ Giữ lại để backward compatible
        },
      ],
    };

    console.log("🎨 [useAddProductFlow] Sending to Studio:", assetsForStudio);

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

    // ✅ SỬA: 3D Assets - Gửi theo format CHUẨN
    const finalAssets = customAssets || defaultAssets;
    if (finalAssets) {
      const assetsPayload = {
        modelUrl: finalAssets.modelUrl,
        dielineUrl: finalAssets.dielineUrl, // ✅ Format mới
        surfaces: [
          {
            key: "main_surface",
            name: "Mặt chính",
            materialName: "Dieline",
            dielineSvgUrl: finalAssets.dielineUrl, // ✅ Backward compatible
          },
        ],
      };

      console.log("📤 [useAddProductFlow] Submitting assets:", assetsPayload);
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
      console.error("❌ [useAddProductFlow] Submit error:", err);
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
