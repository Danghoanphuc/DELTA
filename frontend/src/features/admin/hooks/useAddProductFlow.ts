// src/features/admin/hooks/useAddProductFlow.ts
// ✅ BẢN VÁ FULL 100%: Kiểm tra file GLB có vật liệu (materials) hay không.

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { extractMaterialNames } from "@/features/editor/utils/materialDebug";
import { validateAssetUrl } from "../utils/assetValidator";
import { uploadFileToCloudinary } from "@/services/cloudinaryService";
import { createNewProduct, updateProduct } from "@/services/productService";
import { getProductById } from "@/features/editor/services/editorService";
import { PrinterProduct, Product, ProductPrice, ProductCategory } from "@/types/product";

// Kiểu dữ liệu cho 1 bề mặt (trong wizard)
interface WizardSurface {
  surfaceKey: string;
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
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false);

  // State cho Form
  const [productName, setProductName] = useState("");
  const [description, setDescription] = useState("");
  const [pricing, setPricing] = useState<ProductPrice[]>([
    { minQuantity: 1, pricePerUnit: 1000 },
  ]);
  const [category, setCategory] = useState("business-card"); // Đã thêm

  // State cho Assets
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [modelUrlValid, setModelUrlValid] = useState(false);
  const [modelMaterials, setModelMaterials] = useState<string[]>([]);
  const [surfaces, setSurfaces] = useState<WizardSurface[]>([]);

  // State cho Ảnh
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
        setDescription(existingProduct.description || "");
        setCategory(existingProduct.category || "other");
        setPricing(
          existingProduct.pricing.length > 0
            ? existingProduct.pricing
            : [{ minQuantity: 1, pricePerUnit: 1000 }]
        );

        setModelUrl(existingProduct.assets.modelUrl ?? null);
        setModelUrlValid(true);

        const existingSurfaces = existingProduct.assets.surfaces.map((s) => ({
          // Sửa lỗi tương thích ngược (key vs surfaceKey)
          surfaceKey: (s as any).surfaceKey,
          name: s.name,
          dielineSvgUrl: s.dielineSvgUrl,
          materialName: s.materialName,
          svgUrlValid: true,
        }));
        setSurfaces(existingSurfaces);

        if (existingProduct.assets.modelUrl) {
          const materials = await extractMaterialNames(
            existingProduct.assets.modelUrl
          );
          setModelMaterials(materials);
        }

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
      // 1. Đọc GLB
      const fileUrl = URL.createObjectURL(file);
      const newMaterials = await extractMaterialNames(fileUrl);
      URL.revokeObjectURL(fileUrl);

      // ==================================================
      // ✅✅✅ BẢN VÁ LOGIC NẰM Ở ĐÂY ✅✅✅
      // ==================================================
      if (newMaterials.length === 0) {
        throw new Error(
          "Lỗi Phân tích: File GLB này không chứa bất kỳ 'materials' (vật liệu) nào. Vui lòng gán vật liệu trong phần mềm 3D và export lại."
        );
      }
      // ==================================================

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

      // 5. Cập nhật state (Chỉ khi mọi thứ thành công)
      setModelUrl(uploadedUrl);
      setModelUrlValid(true);
      setModelMaterials(newMaterials);
      toast.success("Tải GLB mới thành công!", {
        description: `Tìm thấy ${newMaterials.length} vật liệu.`,
      });
    } catch (err: any) {
      toast.error("Lỗi xử lý GLB", { description: err.message });
      // Lỗi sẽ bị bắt ở đây, modelUrlValid sẽ vẫn là false
      // và "✅ Model... OK!" sẽ không hiển thị
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
        surfaceKey: `surface_${Date.now()}`,
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
    surfaceKey: string,
    field: keyof WizardSurface,
    value: string
  ) => {
    setSurfaces(
      surfaces.map((s) => (s.surfaceKey === surfaceKey ? { ...s, [field]: value } : s))
    );
  };

  /**
   * BƯỚC 4: Xử lý tải file SVG
   */
  const handleSvgUpload = async (surfaceKey: string, file: File) => {
    setIsUploading(true);
    toast.loading(`Đang tải SVG cho ${surfaceKey}...`);
    try {
      const uploadedUrl = await uploadFileToCloudinary(file);
      const isValid = await validateAssetUrl(uploadedUrl);
      if (!isValid) {
        throw new Error("File SVG đã tải lên nhưng không thể truy cập (404).");
      }
      setSurfaces(
        surfaces.map((s) =>
          s.surfaceKey === surfaceKey
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

  // ==================================================
  // HANDLERS CHO GIÁ BÁN
  // ==================================================
  const handlePricingChange = (
    index: number,
    field: keyof ProductPrice,
    value: number
  ) => {
    const updatedPricing = [...pricing];
    const numericValue = isNaN(value) ? 0 : value;
    updatedPricing[index] = { ...updatedPricing[index], [field]: numericValue };
    setPricing(updatedPricing);
  };

  const handleAddPricingTier = () => {
    setPricing([...pricing, { minQuantity: 0, pricePerUnit: 0 }]);
  };

  const handleRemovePricingTier = (index: number) => {
    if (pricing.length <= 1) {
      toast.error("Phải có ít nhất 1 bậc giá");
      return;
    }
    const updatedPricing = pricing.filter((_, i) => i !== index);
    setPricing(updatedPricing);
  };

  /**
   * BƯỚC 6: Lưu Phôi (Nâng cấp dùng FormData)
   */
  const handleSaveProduct = async () => {
    // AI VALIDATION
    if (productName.trim().length < 5) {
      toast.error("Tên sản phẩm phải có ít nhất 5 ký tự");
      return;
    }
    if (!modelUrlValid) {
      // ✅ BẢO VỆ 2 LỚP: Giờ thì check này sẽ bắt lỗi
      toast.error("Chưa tải file GLB hợp lệ (phải có vật liệu).");
      return;
    }
    if (surfaces.length === 0) {
      toast.error("Cần ít nhất 1 bề mặt.");
      return;
    }
    if (
      pricing.length === 0 ||
      pricing.some((p) => p.minQuantity < 1 || p.pricePerUnit < 0)
    ) {
      toast.error("Dữ liệu giá không hợp lệ. (SL > 0, Giá >= 0đ)");
      return;
    }
    if (imageFiles.length === 0 && !isEditMode) {
      toast.error("Phải có ít nhất 1 ảnh sản phẩm");
      return;
    }
    if (!category) {
      toast.error("Vui lòng chọn danh mục cho phôi");
      return;
    }

    // CHUYỂN SANG DÙNG FORMDATA
    const formData = new FormData();
    const productData: Partial<Product> = {
      name: productName,
      description: description,
      pricing: pricing,
      category: category as ProductCategory,
      assets: {
        modelUrl: modelUrl!,
        surfaces: surfaces.map((s) => ({
          surfaceKey: s.surfaceKey, // ✅ Sửa lỗi 400 (gửi đúng 'surfaceKey')
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
    description,
    setDescription,
    pricing,
    category,
    setCategory,
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
    handlePricingChange,
    handleAddPricingTier,
    handleRemovePricingTier,
  };
}