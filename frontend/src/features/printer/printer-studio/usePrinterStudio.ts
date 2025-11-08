// frontend/src/features/printer/printer-studio/usePrinterStudio.ts
// ✅ KHẮC PHỤC LỖI KẸT LOADING:
// Gộp 2 useEffect (tải phôi + tải thư viện) thành 1 useEffect dùng Promise.all

import { useState, useRef, useEffect, useCallback } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/shared/lib/axios";
import { Product } from "@/types/product";
import * as THREE from "three";
import { EditorItem, DecalItem } from "@/features/editor/types/decal.types";
import { InteractionResult } from "@/features/editor/hooks/use3DInteraction";
import { GizmoMode } from "@/features/editor/hooks/useDesignEditor";

// ✅ Import service và types của Media Library
import {
  getMyMediaAssets,
  createMediaAsset,
  UploadedImageVM,
} from "@/services/mediaAssetService";

// (Helper, Interface PhoiAssets, extractSurfaceInfo, GizmoMode giữ nguyên)
const createId = () =>
  `decal_${Date.now()}_${Math.floor(Math.random() * 1000)}`;
interface PhoiAssets {
  modelUrl: string;
  dielineUrl: string;
  materialName: string;
  surfaceKey: string;
}
function extractSurfaceInfo(assets: any): {
  dielineUrl: string;
  materialName: string;
  surfaceKey: string;
} | null {
  const firstSurface = assets?.surfaces?.[0];
  if (!firstSurface) return null;
  const { dielineSvgUrl, materialName, surfaceKey } = firstSurface;
  if (dielineSvgUrl && materialName && surfaceKey) {
    return { dielineUrl: dielineSvgUrl, materialName, surfaceKey };
  }
  return null;
}

export function usePrinterStudio() {
  const navigate = useNavigate();
  const { productId } = useParams();

  // (Các state lõi, UI, Gizmo giữ nguyên)
  const [baseProduct, setBaseProduct] = useState<Product | null>(null);
  const [phoiAssets, setPhoiAssets] = useState<PhoiAssets | null>(null);
  const [isLoading, setIsLoading] = useState(true); // ✅ Bắt đầu là true
  const [is3DMainLoaded, setIs3DMainLoaded] = useState(false);
  const [decals, setDecals] = useState<EditorItem[]>([]);
  const [activeToolbarTab, setActiveToolbarTab] = useState<string>("upload");
  const [selectedDecalId, setSelectedDecalId] = useState<string | null>(null);
  const [uploadedImages, setUploadedImages] = useState<UploadedImageVM[]>([]);
  const [gizmoMode, setGizmoMode] = useState<GizmoMode>("translate");
  const [isSnapping, setIsSnapping] = useState(false);

  // =================================================================
  // ✅ BƯỚC 1: Hợp nhất logic tải dữ liệu
  // =================================================================
  useEffect(() => {
    const loadStudioData = async () => {
      setIsLoading(true); // Bắt đầu tải

      // --- Hàm 1: Tải Phôi (Bắt buộc) ---
      const loadProductAssets = async () => {
        if (!productId) {
          toast.error("Không tìm thấy ID sản phẩm.");
          navigate("/printer/dashboard/products");
          throw new Error("Missing productId"); // Dừng Promise.all
        }
        try {
          const res = await api.get(`/products/${productId}`);
          const product: Product = res.data?.data?.product || res.data?.product;
          if (!product) {
            throw new Error(`Không tìm thấy sản phẩm với ID: ${productId}`);
          }

          const surfaceInfo = extractSurfaceInfo(product.assets);
          if (!product.assets?.modelUrl || !surfaceInfo) {
            throw new Error(
              "Sản phẩm này bị lỗi. Thiếu thông tin phôi 3D (modelUrl) hoặc bề mặt (surfaces)."
            );
          }

          // Set state Phôi (Quan trọng)
          setBaseProduct(product);
          setPhoiAssets({
            modelUrl: product.assets.modelUrl,
            dielineUrl: surfaceInfo.dielineUrl,
            materialName: surfaceInfo.materialName,
            surfaceKey: surfaceInfo.surfaceKey,
          });
        } catch (err: any) {
          console.error("❌ Lỗi tải Studio (Product):", err);
          toast.error(
            err.response?.data?.message ||
              err.message ||
              "Không thể tải dữ liệu phôi"
          );
          navigate("/printer/dashboard/products"); // Điều hướng về nếu lỗi
          throw err; // Dừng Promise.all
        }
      };

      // --- Hàm 2: Tải Thư viện (Không bắt buộc) ---
      const loadLibrary = async () => {
        try {
          const assets = await getMyMediaAssets(); // Service này đã tự catch lỗi
          const viewModels: UploadedImageVM[] = assets
            .map((asset) => ({
              id: asset._id,
              url: asset.url,
              name: asset.name,
              isLoading: false,
            }))
            .reverse();
          setUploadedImages(viewModels);
        } catch (err) {
          console.error("Lỗi tải thư viện media (không nghiêm trọng):", err);
          setUploadedImages([]); // Set rỗng nếu lỗi, nhưng không dừng Studio
        }
      };

      // --- Chạy song song ---
      try {
        await Promise.all([
          loadProductAssets(), // (1)
          loadLibrary(), // (2)
        ]);
      } catch (error) {
        // Lỗi nghiêm trọng (từ loadProductAssets) đã được xử lý (toast, navigate)
        console.error("Một trong các tác vụ tải Studio thất bại:", error);
      } finally {
        // ✅ Chỉ tắt loading sau khi TẤT CẢ hoàn thành (hoặc lỗi nghiêm trọng)
        setIsLoading(false);
      }
    };

    loadStudioData();
  }, [productId, navigate]); // Dependencies

  // (useEffect Snapping, Chuyển tab giữ nguyên)
  useEffect(() => {
    /* ... (Snapping) ... */
  }, []);
  useEffect(() => {
    /* ... (Chuyển tab) ... */
  }, [selectedDecalId]);

  // =================================================================
  // ✅ BƯỚC 2: Logic Upload (Đã nâng cấp ở lần trước)
  // =================================================================
  const handleToolbarImageUpload = useCallback(
    async (file: File) => {
      // 1. Check duplicate
      const existingFile = uploadedImages.find(
        (img) => img.name === file.name && !img.isLoading
      );
      if (existingFile) {
        toast.info(`Ảnh "${file.name}" đã có trong thư viện.`);
        return;
      }

      const id = `upload_${Date.now()}`;
      const placeholder: UploadedImageVM = {
        id,
        url: "",
        name: file.name,
        isLoading: true,
      };

      // 2. Thêm placeholder
      setUploadedImages((prev) => [placeholder, ...prev]);
      toast.info(`Đang xử lý: ${file.name}`);

      try {
        // 3. Gọi service (upload + đăng ký DB)
        const newAsset = await createMediaAsset(file);

        // 4. Cập nhật placeholder với data thật
        setUploadedImages((prev) =>
          prev.map((img) =>
            img.id === id
              ? {
                  id: newAsset._id,
                  url: newAsset.url,
                  name: newAsset.name,
                  isLoading: false,
                }
              : img
          )
        );
        toast.success(`Tải lên thành công: ${file.name}`);
      } catch (err: any) {
        console.error("Lỗi upload/create media asset:", err);
        toast.error(`Không thể tải lên: ${file.name}`);
        setUploadedImages((prev) => prev.filter((img) => img.id !== id));
      }
    },
    [uploadedImages]
  );

  // (Các hàm Decal Handlers và Logic Lưu giữ nguyên)
  const addDecal = useCallback(
    (dropData: any, interactionResult: InteractionResult) => {
      let newDecal: DecalItem | null = null;
      const id = createId();
      const pos = interactionResult.worldPoint.toArray();
      const norm = interactionResult.worldNormal.toArray();
      const defaultRotation: [number, number, number] = [0, 0, 0];

      if (dropData.type === "image") {
        newDecal = {
          id,
          type: "decal",
          parentId: null,
          decalType: "image",
          imageUrl: dropData.imageUrl,
          position: pos,
          normal: norm,
          size: [0.15, 0.15],
          rotation: defaultRotation,
          isVisible: true,
          isLocked: false,
        };
        toast.success("Đã thêm ảnh!");
      } else if (dropData.type === "text") {
        newDecal = {
          id,
          type: "decal",
          parentId: null,
          decalType: "text",
          text: dropData.text || "New Text",
          color: dropData.color || "#000000",
          position: pos,
          normal: norm,
          size: [0.3, 0.1], // ✅ Kích thước cho text
          rotation: defaultRotation,
          isVisible: true,
          isLocked: false,
        };
        toast.success("Đã thêm văn bản!");
      } else if (dropData.type === "shape") {
        newDecal = {
          id,
          type: "decal",
          parentId: null,
          decalType: "shape",
          shapeType: dropData.shapeType || "rect",
          color: dropData.color || "#3498db",
          position: pos,
          normal: norm,
          size: [0.15, 0.15],
          rotation: defaultRotation,
          isVisible: true,
          isLocked: false,
        };
        toast.success("Đã thêm hình dạng!");
      }

      if (newDecal) {
        setDecals((prev) => [...prev, newDecal]);
        setSelectedDecalId(newDecal.id);
      }
    },
    []
  );

  const deleteDecal = useCallback(
    (id: string) => {
      setDecals((prev) => prev.filter((d) => d.id !== id));
      if (selectedDecalId === id) {
        setSelectedDecalId(null);
      }
    },
    [selectedDecalId]
  );

  const updateDecal = useCallback((id: string, updates: Partial<EditorItem>) => {
    setDecals((prev) =>
      prev.map((d) => (d.id === id ? ({ ...d, ...updates } as EditorItem) : d))
    );
  }, []);

  const handleSaveAndExit = useCallback(() => {
    if (!baseProduct) {
      toast.error("Lỗi: Không tìm thấy thông tin sản phẩm gốc.");
      return;
    }
    sessionStorage.setItem(
      "tempDesignData",
      JSON.stringify({
        baseProductId: baseProduct._id,
        decals: decals,
        timestamp: Date.now(),
        previewDataUrl: null,
      })
    );
    toast.success("✅ Đã lưu template tạm thời!");
    navigate("/printer/publish-template");
  }, [baseProduct, decals, navigate]);

  return {
    baseProduct,
    phoiAssets,
    isLoading,
    is3DMainLoaded,
    productId,
    handleSaveAndExit,
    setIs3DMainLoaded,
    navigate,
    decals,
    addDecal,
    deleteDecal,
    updateDecal,
    activeToolbarTab,
    setActiveToolbarTab,
    selectedDecalId,
    setSelectedDecalId,
    uploadedImages,
    handleToolbarImageUpload,
    gizmoMode,
    setGizmoMode,
    isSnapping,
  };
}
