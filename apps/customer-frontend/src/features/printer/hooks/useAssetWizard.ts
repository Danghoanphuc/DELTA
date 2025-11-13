// src/features/printer/hooks/useAssetWizard.ts
// ✅ ĐÃ KHẮC PHỤC: Bổ sung dấu {} cho khối catch

import { useState, useEffect } from "react";
import { toast } from "sonner";
import { extractMaterialNames } from "@/features/editor/utils/materialDebug";
import { validateAssetUrl } from "../utils/assetValidator"; // Đảm bảo file này tồn tại
import { uploadFileToCloudinary } from "@/services/cloudinaryService";
import { Asset, AssetSurface } from "@/types/asset";
import { ProductCategory } from "@/types/product";
import api from "@/shared/lib/axios";

// Kiểu dữ liệu cho 1 bề mặt (trong wizard)
interface WizardSurface {
  surfaceKey: string;
  name: string;
  dielineSvgUrl: string | null;
  materialName: string;
  svgUrlValid: boolean;
}

export function useAssetWizard(
  assetId: string | undefined,
  onSuccess: () => void
) {
  const isEditMode = !!assetId;
  const [isLoading, setIsLoading] = useState(false);
  const [isUploading, setIsUploading] = useState(false); // Chỉ dùng cho GLB/SVG

  // State cho Form
  const [assetName, setAssetName] = useState("");
  const [description, setDescription] = useState("");
  const [category, setCategory] = useState("business-card");

  // State cho Assets
  const [modelUrl, setModelUrl] = useState<string | null>(null);
  const [modelUrlValid, setModelUrlValid] = useState(false);
  const [modelMaterials, setModelMaterials] = useState<string[]>([]);
  const [surfaces, setSurfaces] = useState<WizardSurface[]>([]);

  // Tải dữ liệu phôi cũ (Sửa)
  useEffect(() => {
    if (!isEditMode) return;

    const loadExistingAsset = async () => {
      setIsLoading(true);
      const toastId = toast.loading("Đang tải dữ liệu phôi cũ...");
      try {
        const res = await api.get(`/assets/${assetId}`);
        const existingAsset: Asset = res.data.data.asset;

        setAssetName(existingAsset.name);
        setDescription(existingAsset.description || "");
        setCategory(existingAsset.category || "other");

        setModelUrl(existingAsset.assets.modelUrl ?? null);
        setModelUrlValid(true);

        const existingSurfaces = existingAsset.assets.surfaces.map(
          (s: AssetSurface) => ({
            surfaceKey: s.surfaceKey,
            name: s.name,
            dielineSvgUrl: s.dielineSvgUrl,
            materialName: s.materialName,
            svgUrlValid: true,
          })
        );
        setSurfaces(existingSurfaces);

        if (existingAsset.assets.modelUrl) {
          const materials = await extractMaterialNames(
            existingAsset.assets.modelUrl
          );
          setModelMaterials(materials);
        }
        toast.success("Tải phôi cũ thành công!", { id: toastId });
      } catch (err: any) {
        toast.error("Lỗi tải phôi cũ", {
          id: toastId,
          description: err.message,
        });
      } finally {
        setIsLoading(false);
      }
    };

    loadExistingAsset();
  }, [assetId, isEditMode]);

  const handleGlbUpload = async (file: File) => {
    setIsUploading(true);
    const toastId = toast.loading("Đang phân tích model 3D mới...");
    try {
      const fileUrl = URL.createObjectURL(file);
      const newMaterials = await extractMaterialNames(fileUrl);
      URL.revokeObjectURL(fileUrl);
      if (newMaterials.length === 0) {
        throw new Error("Lỗi Phân tích: File GLB không chứa 'materials'.");
      }

      toast.loading("Đang tải file GLB mới...", { id: toastId });
      const uploadedUrl = await uploadFileToCloudinary(file);
      const isValid = await validateAssetUrl(uploadedUrl);
      if (!isValid) {
        throw new Error(
          "File GLB mới đã tải lên nhưng không thể truy cập (404)."
        );
      }
      setModelUrl(uploadedUrl);
      setModelUrlValid(true);
      setModelMaterials(newMaterials);
      toast.success("Tải GLB mới thành công!", { id: toastId });
    } catch (err: any) {
      // ✅ SỬA LỖI: ĐÃ THÊM DẤU {
      toast.error("Lỗi xử lý GLB", { id: toastId, description: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const addSurface = () => {
    setSurfaces([
      ...surfaces,
      {
        surfaceKey: `surface_${Date.now()}`,
        name: "Bề mặt mới",
        dielineSvgUrl: null,
        materialName: modelMaterials[0] || "",
        svgUrlValid: false,
      },
    ]);
  };

  const updateSurface = (
    key: string,
    field: keyof WizardSurface,
    value: string
  ) => {
    setSurfaces(
      surfaces.map((s) => (s.surfaceKey === key ? { ...s, [field]: value } : s))
    );
  };

  const handleSvgUpload = async (surfaceKey: string, file: File) => {
    setIsUploading(true);
    const toastId = toast.loading(`Đang tải SVG cho ${surfaceKey}...`);
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
      toast.success("Tải SVG thành công!", { id: toastId });
    } catch (err: any) {
      toast.error("Lỗi xử lý SVG", { id: toastId, description: err.message });
    } finally {
      setIsUploading(false);
    }
  };

  const handleSaveAsset = async () => {
    // (Validation giữ nguyên)
    if (assetName.trim().length < 5) {
      toast.error("Tên phôi phải có ít nhất 5 ký tự");
      return;
    }
    if (!modelUrlValid || !modelUrl) {
      toast.error("Vui lòng tải lên file GLB hợp lệ (Bước 1)");
      return;
    }
    if (surfaces.length === 0) {
      toast.error("Vui lòng thêm ít nhất 1 bề mặt in (Bước 2)");
      return;
    }
    if (surfaces.some((s) => !s.dielineSvgUrl || !s.svgUrlValid)) {
      toast.error("Một bề mặt in đang thiếu Dieline SVG (Bước 2)");
      return;
    }

    const assetData: Partial<Omit<Asset, "_id">> = {
      name: assetName,
      description: description,
      category: category as ProductCategory,
      assets: {
        modelUrl: modelUrl!,
        surfaces: surfaces.map((s) => ({
          surfaceKey: s.surfaceKey,
          name: s.name,
          dielineSvgUrl: s.dielineSvgUrl!,
          materialName: s.materialName,
        })),
      },
    };

    let toastId: string | number = "";

    setIsUploading(true);
    try {
      if (isEditMode) {
        toastId = toast.loading("Đang cập nhật phôi...");
        await api.put(`/assets/${assetId}`, assetData);
        toast.success("Cập nhật phôi thành công!", { id: toastId });
      } else {
        toastId = toast.loading("Đang tạo phôi mới...");
        await api.post("/assets", assetData);
        toast.success("Tạo phôi thành công!", { id: toastId });
      }
      onSuccess(); // Refresh list
    } catch (err: any) {
      const errorMessage =
        err.response?.data?.message ||
        (isEditMode ? "Lỗi cập nhật phôi" : "Lỗi tạo phôi");
      if (toastId) {
        toast.error(errorMessage, { id: toastId });
      } else {
        toast.error(errorMessage);
      }
    } finally {
      setIsUploading(false);
    }
  };

  return {
    isEditMode,
    isLoading,
    assetName,
    setAssetName,
    description,
    setDescription,
    category,
    setCategory,
    modelUrl,
    modelMaterials,
    modelUrlValid,
    surfaces,
    isUploading,
    handleGlbUpload,
    addSurface,
    updateSurface,
    handleSvgUpload,
    handleSaveAsset,
  };
}
