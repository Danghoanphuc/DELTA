// src/features/admin/hooks/useAddProductFlow.ts
// ✅ BẢN FULL 100%: Xử lý "Tạo", "Sửa", Xác thực, và Upload Ảnh

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { extractMaterialNames } from "@/features/editor/utils/materialDebug";
import { validateAssetUrl } from "../utils/assetValidator";
import { uploadFileToCloudinary } from "@/services/cloudinaryService";
import { createNewProduct, updateProduct } from "@/services/productService";
import { getProductById } from "@/features/editor/services/editorService";
import { PrinterProduct, Product } from "@/types/product";

// Kiểu dữ liệu cho 1 bề mặt (trong wizard)
interface WizardSurface {
  key: string;
  name: string;
  dielineSvgUrl: string | null;
  materialName: string;
  svgUrlValid: boolean;
}

/**
 * Hook "Trợ lý AI" cho cả Tạo và Sửa
 * @param productId Nếu có, hook sẽ chạy ở chế độ "Sửa"
 * @param onSuccess Callback để refresh danh sách sản phẩm
 */
export function useAddProductFlow(
  productId: string | undefined,
  onSuccess: () => void
) {
  const isEditMode = !!productId;

  const [product, setProduct] = useState<Product | null>(null);
  const [productName, setProductName] = useState("");
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [modelUrlValid, setModelUrlValid] = useState(false);
  const [isUploading, setIsUploading] = useState(false);
  const [isLoading, setIsLoading] = useState(false); // Trạng thái tải phôi cũ

  const [modelMaterials, setModelMaterials] = useState<string[]>([]);
  const [surfaces, setSurfaces] = useState<WizardSurface[]>([]);

  // State cho ảnh
  const [imageFiles, setImageFiles] = useState<File[]>([]);
  const [previewImages, setPreviewImages] = useState<string[]>([]);
  const [existingImageUrls, setExistingImageUrls] = useState<string[]>([]);

  // Tải dữ liệu phôi cũ (Sửa)
  useEffect(() => {
    if (!isEditMode) return;

    const loadExistingProduct = async () => {
      setIsLoading(true);
      toast.loading("Đang tải dữ liệu phôi cũ...");
      try {
        const existingProduct = await getProductById(productId);

        setProduct(existingProduct);
        setProductName(existingProduct.name);
        setModelUrl(existingProduct.assets.modelUrl);
        setModelUrlValid(true);

        const existingSurfaces = existingProduct.assets.surfaces.map((s) => ({
          ...s,
          svgUrlValid: true,
        }));
        setSurfaces(existingSurfaces);

        const materials = await extractMaterialNames(
          existingProduct.assets.modelUrl
        );
        setModelMaterials(materials);

        setExistingImageUrls(
          existingProduct.images?.map((img) => img.url) || []
        );

        toast.success("Tải phôi cũ thành công!");
      } catch (err: any) {
        toast.error("Lỗi tải phôi cũ", { description: err.message });
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingProduct();
  }, [productId, isEditMode]);

  /**
   * BƯỚC 1: Xử lý tải file GLB (Nâng cấp AI)
   */
  const handleGlbUpload = async (file: File) => {
    setIsUploading(true);
    toast.loading("Đang phân tích model 3D mới...");

    try {
      // 1. Đọc GLB mới
      const fileUrl = URL.createObjectURL(file);
      const newMaterials = await extractMaterialNames(fileUrl);
      URL.revokeObjectURL(fileUrl);

      if (newMaterials.length === 0) {
        throw new Error(
          "Không tìm thấy vật liệu (materials) nào trong file GLB mới."
        );
      }

      // 2. LOGIC AI (SỬA): Kiểm tra vật liệu thiếu
      if (isEditMode) {
        const usedMaterials = surfaces.map((s) => s.materialName);
        const missingMaterials = usedMaterials.filter(
          (usedMat) => !newMaterials.includes(usedMat)
        );
        if (missingMaterials.length > 0) {
          throw new Error(
            `File GLB mới bị thiếu vật liệu đang dùng: ${missingMaterials.join(
              ", "
            )}`
          );
        }
      }

      // 3. Tải file lên Cloudinary
      toast.loading("Đang tải file GLB mới...");
      const uploadedUrl = await uploadFileToCloudinary(file);

      // 4. Xác thực URL
      const isValid = await validateAssetUrl(uploadedUrl);
      if (!isValid) {
        throw new Error(
          "File GLB mới đã tải lên nhưng không thể truy cập (404)."
        );
      }

      // 5. Cập nhật state
      setModelUrl(uploadedUrl);
      setModelUrlValid(true);
      setModelMaterials(newMaterials);
      toast.success("Tải GLB mới thành công!", {
        description: `Tìm thấy ${newMaterials.length} vật liệu.`,
      });
    } catch (err: any) {
      toast.error("Lỗi xử lý GLB", { description: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * BƯỚC 2: Thêm một bề mặt mới
   */
  const addSurface = () => {
    setSurfaces([
      ...surfaces,
      {
        key: `surface_${Date.now()}`,
        name: "Bề mặt mới",
        dielineSvgUrl: null,
        materialName: modelMaterials[0] || "", // Gợi ý AI
        svgUrlValid: false,
      },
    ]);
  };

  /**
   * BƯỚC 3: Cập nhật mapping
   */
  const updateSurface = (
    key: string,
    field: keyof WizardSurface,
    value: string
  ) => {
    setSurfaces(
      surfaces.map((s) => (s.key === key ? { ...s, [field]: value } : s))
    );
  };

  /**
   * BƯỚC 4: Xử lý tải file SVG
   */
  const handleSvgUpload = async (key: string, file: File) => {
    setIsUploading(true);
    toast.loading(`Đang tải SVG cho ${key}...`);
    try {
      const uploadedUrl = await uploadFileToCloudinary(file);
      const isValid = await validateAssetUrl(uploadedUrl);
      if (!isValid) {
        throw new Error("File SVG đã tải lên nhưng không thể truy cập (404).");
      }
      setSurfaces(
        surfaces.map((s) =>
          s.key === key
            ? { ...s, dielineSvgUrl: uploadedUrl, svgUrlValid: true }
            : s
        )
      );
      toast.success("Tải SVG thành công!");
    } catch (err: any) {
      toast.error("Lỗi xử lý SVG", { description: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  /**
   * BƯỚC 5: Handler cho upload ảnh
   */
  const handleImageChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = Array.from(e.target.files || []);
    if (files.length === 0) return;
    if (files.length > 5) {
      toast.error("Tối đa 5 ảnh");
      files.splice(5);
    }
    setImageFiles(files);
    previewImages.forEach(URL.revokeObjectURL);
    const previews = files.map((file) => URL.createObjectURL(file));
    setPreviewImages(previews);
  };

  /**
   * BƯỚC 6: Lưu Phôi (Nâng cấp dùng FormData)
   */
  const handleSaveProduct = async () => {
    // AI VALIDATION
    if (!modelUrlValid) {
      toast.error("Chưa tải file GLB...");
      return;
    }
    if (surfaces.length === 0) {
      toast.error("Cần ít nhất 1 bề mặt.");
      return;
    }
    for (const surface of surfaces) {
      if (!surface.materialName) {
        toast.error(`Bề mặt "${surface.name}" chưa chọn vật liệu 3D.`);
        return;
      }
      if (!surface.svgUrlValid) {
        toast.error(`Bề mặt "${surface.name}" chưa tải file SVG.`);
        return;
      }
    }

    // SỬA LỖI 400: Validate ảnh
    if (imageFiles.length === 0 && !isEditMode) {
      toast.error("Phải có ít nhất 1 ảnh sản phẩm");
      return;
    }

    // CHUYỂN SANG DÙNG FORMDATA
    const formData = new FormData();
    const productData: Partial<Product> = {
      name: productName,
      description: description,
      pricing: pricing,
      category: category,
      assets: {
        modelUrl: modelUrl!,
        surfaces: surfaces.map((s) => ({
          // === SỬA LỖI Ở ĐÂY ===
          key: s.key, // ❌ LỖI GỐC
          surfaceKey: s.key, // ✅ SỬA LẠI: Gửi trường 'surfaceKey'
          // =====================
          name: s.name,
          dielineSvgUrl: s.dielineSvgUrl!,
          materialName: s.materialName,
        })),
      },
      isActive: true,
    };

    formData.append("productData", JSON.stringify(productData));
    imageFiles.forEach((file) => {
      formData.append("images", file);
    });

    // Gọi API
    setIsUploading(true);
    try {
      if (isEditMode) {
        toast.loading("Đang cập nhật phôi...");
        await updateProduct(productId, formData);
        toast.success("Cập nhật phôi thành công!");
      } else {
        toast.loading("Đang tạo phôi mới...");
        await createNewProduct(formData);
        toast.success("Tạo phôi thành công!");
      }
      onSuccess(); // Refresh list
    } catch (err: any) {
      toast.error(
        err.response?.data?.message ||
          (isEditMode ? "Lỗi cập nhật phôi" : "Lỗi tạo phôi")
      );
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isEditMode,
    isLoading,
    productName,
    setProductName,
    modelUrl,
    modelMaterials,
    modelUrlValid,
    surfaces,
    isUploading,
    imageFiles,
    previewImages,
    existingImageUrls,
    handleImageChange,
    handleGlbUpload,
    addSurface,
    updateSurface,
    handleSvgUpload,
    handleSaveProduct,
  };
}
