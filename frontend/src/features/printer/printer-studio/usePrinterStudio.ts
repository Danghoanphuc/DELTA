// frontend/src/features/printer/printer-studio/usePrinterStudio.ts
// ✅ ĐÃ SỬA: Chuẩn hóa cấu trúc assets, đảm bảo dielineUrl luôn tồn tại

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/shared/lib/axios";
import { Product } from "@/types/product";
import { DesignSurfaceEditorRef } from "@/features/editor/hooks/useDesignEditor";

// === TYPES ===
interface PhoiAssets {
  modelUrl: string;
  dielineUrl: string;
  materialName: string;
}

// === HELPERS ===
function dataURLtoBlob(dataurl: string): Blob {
  const arr = dataurl.split(",");
  const mime = arr[0].match(/:(.*?);/)?.[1] || "image/png";
  const bstr = atob(arr[1]);
  let n = bstr.length;
  const u8arr = new Uint8Array(n);
  while (n--) {
    u8arr[n] = bstr.charCodeAt(n);
  }
  return new Blob([u8arr], { type: mime });
}

const ensureObjectId = (obj: any) => {
  if (!obj.id) {
    obj.id = `obj_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`;
  }
};

// ✅ THÊM: Helper để extract dielineUrl từ nhiều format khác nhau
function extractDielineUrl(assets: any): string | undefined {
  // Ưu tiên 1: assets.dielineUrl (format mới)
  if (assets?.dielineUrl) {
    return assets.dielineUrl;
  }

  // Ưu tiên 2: assets.surfaces[0].dielineSvgUrl (format cũ)
  if (assets?.surfaces?.[0]?.dielineSvgUrl) {
    return assets.surfaces[0].dielineSvgUrl;
  }

  // Ưu tiên 3: Tìm trong tất cả surfaces
  if (assets?.surfaces && Array.isArray(assets.surfaces)) {
    for (const surface of assets.surfaces) {
      if (surface?.dielineSvgUrl) {
        return surface.dielineSvgUrl;
      }
    }
  }

  return undefined;
}

// ✅ THÊM: Helper để extract materialName
function extractMaterialName(assets: any): string {
  // Ưu tiên 1: surfaces[0].materialName
  if (assets?.surfaces?.[0]?.materialName) {
    return assets.surfaces[0].materialName;
  }

  // Fallback
  return "DefaultMaterial";
}

// ====================
// === MAIN HOOK ===
// ====================
export function usePrinterStudio() {
  const navigate = useNavigate();
  const { productId } = useParams();
  const editorRef = useRef<DesignSurfaceEditorRef>(null);

  // === STATE ===
  const [baseProduct, setBaseProduct] = useState<Product | null>(null);
  const [phoiAssets, setPhoiAssets] = useState<PhoiAssets | null>(null);
  const [textureData, setTextureData] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [is3DMainLoaded, setIs3DMainLoaded] = useState(false);
  const [selectedObject, setSelectedObject] = useState<any>(null);
  const [layers, setLayers] = useState<any[]>([]);
  const [activeObjectId, setActiveObjectId] = useState<string | null>(null);

  // === DATA FETCHING ===
  useEffect(() => {
    let isCancelled = false;
    const controller = new AbortController();

    const fetchAssets = async () => {
      try {
        setIsLoading(true);
        let modelUrl: string | undefined;
        let dielineUrl: string | undefined;
        let materialName: string | undefined;
        let productName: string | undefined;
        let productData: Product | null = null;

        if (productId === "new") {
          // ✅ MODE: Tạo mới từ phôi tạm
          const tempData = localStorage.getItem("tempProductAssets");
          if (!tempData) {
            throw new Error("Không tìm thấy dữ liệu phôi tạm thời");
          }

          const parsed = JSON.parse(tempData);
          console.log("📦 [usePrinterStudio] Parsed tempData:", parsed);

          // ✅ SỬA: Dùng helper để extract
          modelUrl = parsed.assets?.modelUrl;
          dielineUrl = extractDielineUrl(parsed.assets);
          materialName = extractMaterialName(parsed.assets);
          productName = `Phôi ${parsed.category} (Tạm)`;

          if (!modelUrl || !dielineUrl) {
            console.error("❌ [usePrinterStudio] Missing assets:", {
              modelUrl,
              dielineUrl,
              parsed: parsed.assets,
            });
            throw new Error(
              `Dữ liệu phôi tạm thời không đầy đủ.\nThiếu: ${
                !modelUrl ? "modelUrl" : ""
              } ${!dielineUrl ? "dielineUrl" : ""}`
            );
          }

          productData = {
            _id: "temp",
            name: productName,
            assets: parsed.assets,
          } as any;

          console.log("✅ [usePrinterStudio] Extracted from temp:", {
            modelUrl,
            dielineUrl,
            materialName,
          });
        } else {
          // ✅ MODE: Chỉnh sửa sản phẩm có sẵn
          const res = await api.get(`/products/${productId}`, {
            signal: controller.signal,
          });

          if (isCancelled) return;

          const product: Product = res.data?.data?.product;
          console.log("📦 [usePrinterStudio] Fetched product:", product);

          productData = product;

          // ✅ SỬA: Dùng helper để extract
          modelUrl = product?.assets?.modelUrl;
          dielineUrl = extractDielineUrl(product?.assets);
          materialName = extractMaterialName(product?.assets);

          if (!product || !modelUrl || !dielineUrl) {
            console.error("❌ [usePrinterStudio] Missing assets:", {
              modelUrl,
              dielineUrl,
              assets: product?.assets,
            });
            throw new Error(
              `Phôi này thiếu file 3D hoặc file Dieline SVG.\nThiếu: ${
                !modelUrl ? "modelUrl" : ""
              } ${!dielineUrl ? "dielineUrl" : ""}`
            );
          }

          console.log("✅ [usePrinterStudio] Extracted from product:", {
            modelUrl,
            dielineUrl,
            materialName,
          });
        }

        setBaseProduct(productData);
        setPhoiAssets({ modelUrl, dielineUrl, materialName });

        console.log("🎯 [usePrinterStudio] Final phoiAssets:", {
          modelUrl,
          dielineUrl,
          materialName,
        });
      } catch (err: any) {
        if (err.name === "AbortError" || err.name === "CanceledError") return;
        if (!isCancelled) {
          console.error("❌ [usePrinterStudio] Fetch error:", err);
          toast.error(err.message || "Không thể tải dữ liệu Phôi");
          navigate("/printer/dashboard/products");
        }
      } finally {
        if (!isCancelled) setIsLoading(false);
      }
    };

    fetchAssets();

    return () => {
      isCancelled = true;
      controller.abort();
    };
  }, [productId, navigate]);

  // === HANDLERS ===

  // (Layers)
  const updateLayers = useCallback(() => {
    const canvas = editorRef.current?.getCanvas();
    if (!canvas) return;
    const objects = canvas.getObjects();
    objects.forEach(ensureObjectId);
    setLayers([...objects]);
    const activeObj = canvas.getActiveObject();
    if (activeObj) {
      ensureObjectId(activeObj);
      setActiveObjectId(activeObj.id);
      setSelectedObject(activeObj);
    } else {
      setActiveObjectId(null);
      setSelectedObject(null);
    }
  }, []);

  const handleSelectLayer = useCallback(
    (obj: any) => {
      const canvas = editorRef.current?.getCanvas();
      if (canvas) {
        canvas.setActiveObject(obj);
        canvas.renderAll();
        updateLayers();
      }
    },
    [updateLayers]
  );

  const handleMoveLayer = useCallback(
    (obj: any, direction: "up" | "down" | "top" | "bottom") => {
      const canvas = editorRef.current?.getCanvas();
      if (!canvas) return;
      switch (direction) {
        case "up":
          canvas.bringForward(obj);
          break;
        case "down":
          canvas.sendBackwards(obj);
          break;
        case "top":
          canvas.bringToFront(obj);
          break;
        case "bottom":
          canvas.sendToBack(obj);
          break;
      }
      canvas.renderAll();
      updateLayers();
    },
    [updateLayers]
  );

  const handleToggleVisibility = useCallback(
    (obj: any) => {
      obj.set("visible", !obj.visible);
      editorRef.current?.getCanvas()?.renderAll();
      updateLayers();
    },
    [updateLayers]
  );

  const handleDeleteLayer = useCallback(
    (obj: any) => {
      editorRef.current?.getCanvas()?.remove(obj);
      updateLayers();
    },
    [updateLayers]
  );

  // (Canvas)
  const handleCanvasUpdate = useCallback(
    (materialKey: string, base64Image: string) => {
      console.log(`🎨 [usePrinterStudio] Texture updated for ${materialKey}`);
      setTextureData(base64Image);
    },
    []
  );

  const handleImageUpload = (file: File) => {
    toast.success(`Đã tải ảnh: ${file.name}`);
  };

  const handlePropertiesUpdate = useCallback(() => {
    editorRef.current?.getCanvas()?.renderAll();
  }, []);

  // (Saving)
  const createCanvasSnapshot = useCallback((): {
    json: string;
    previewBlob: Blob;
  } | null => {
    if (!editorRef.current) return null;
    const canvas = editorRef.current.getCanvas();
    if (!canvas) return null;
    canvas.discardActiveObject();
    canvas.renderAll();
    const json = editorRef.current.getJSON();
    const parsedJson = JSON.parse(json);
    if (!parsedJson.objects || parsedJson.objects.length === 0) {
      toast.error("Canvas trống! Hãy thêm ít nhất 1 đối tượng.");
      return null;
    }
    const previewDataURL = canvas.toDataURL({ format: "png", quality: 0.8 });
    const previewBlob = dataURLtoBlob(previewDataURL);
    return { json, previewBlob };
  }, []);

  const handleSaveAndExit = useCallback(() => {
    if (!editorRef.current) {
      toast.error("Lỗi: Trình chỉnh sửa chưa sẵn sàng");
      return;
    }
    const baseProductId = baseProduct?._id;
    if (!baseProductId) {
      toast.error("Lỗi: Không tìm thấy ID Phôi");
      return;
    }

    toast.info("Đang lưu thiết kế tạm thời...");
    const snapshot = createCanvasSnapshot();
    if (!snapshot) return;

    const tempDesignData = {
      baseProductId,
      editorJson: snapshot.json,
      previewDataUrl: snapshot.previewBlob,
      timestamp: Date.now(),
    };

    const reader = new FileReader();
    reader.onloadend = () => {
      (tempDesignData as any).previewDataUrl = reader.result as string;
      sessionStorage.setItem("tempDesignData", JSON.stringify(tempDesignData));
      toast.success("✅ Đã lưu thiết kế tạm thời!");
      navigate("/printer/publish-template");
    };
    reader.readAsDataURL(snapshot.previewBlob);
  }, [baseProduct, createCanvasSnapshot, navigate]);

  // === MEMOS ===
  const texturesForViewer = useMemo(() => {
    if (!textureData) return {};
    const result: Record<string, string> = {};
    const materialKey = phoiAssets?.materialName || "DefaultMaterial";
    result[materialKey] = textureData;
    // Backup keys
    result["Dieline"] = textureData;
    result["Material_Lid"] = textureData;
    result["main_surface"] = textureData;
    result["DefaultMaterial"] = textureData;

    console.log(
      "🎨 [usePrinterStudio] Textures for 3D viewer:",
      Object.keys(result)
    );
    return result;
  }, [textureData, phoiAssets]);

  // === RETURN ===
  return {
    // Refs
    editorRef,
    // State
    baseProduct,
    phoiAssets,
    textureData,
    isLoading,
    is3DMainLoaded,
    selectedObject,
    layers,
    activeObjectId,
    productId,
    // Handlers
    handleImageUpload,
    handleSelectLayer,
    handleMoveLayer,
    handleToggleVisibility,
    handleDeleteLayer,
    handleCanvasUpdate,
    handlePropertiesUpdate,
    handleSaveAndExit,
    setIs3DMainLoaded,
    navigate,
    // Memos
    texturesForViewer,
    updateLayers,
  };
}
