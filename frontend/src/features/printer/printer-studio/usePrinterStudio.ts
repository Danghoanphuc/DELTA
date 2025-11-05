// frontend/src/features/printer/printer-studio/usePrinterStudio.ts
// ✅ BẢN VÁ FULL 100%: Ổn định (useCallback) các hàm

import { useState, useRef, useEffect, useCallback, useMemo } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { toast } from "sonner";
import api from "@/shared/lib/axios";
import { Product } from "@/types/product";
import { EditorCanvasRef } from "@/features/editor/components/EditorCanvas";

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

function extractDielineUrl(assets: any): string | undefined {
  if (assets?.dielineUrl) return assets.dielineUrl;
  if (assets?.surfaces?.[0]?.dielineSvgUrl)
    return assets.surfaces[0].dielineSvgUrl;
  if (assets?.surfaces && Array.isArray(assets.surfaces)) {
    for (const surface of assets.surfaces) {
      if (surface?.dielineSvgUrl) return surface.dielineSvgUrl;
    }
  }
  return undefined;
}

function extractMaterialName(assets: any): string {
  if (assets?.surfaces?.[0]?.materialName)
    return assets.surfaces[0].materialName;
  // Fallback an toàn
  return "Material";
}

// ====================
// === MAIN HOOK ===
// ====================
export function usePrinterStudio() {
  const navigate = useNavigate();
  const { productId } = useParams();

  const editorRef = useRef<EditorCanvasRef>(null);

  // === STATE ===
  const [baseProduct, setBaseProduct] = useState<Product | null>(null);
  const [phoiAssets, setPhoiAssets] = useState<PhoiAssets | null>(null);
  const [canvasElements, setCanvasElements] = useState<
    Map<string, HTMLCanvasElement>
  >(new Map());
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
          const tempData = localStorage.getItem("tempProductAssets");
          if (!tempData)
            throw new Error("Không tìm thấy dữ liệu phôi tạm thời");
          const parsed = JSON.parse(tempData);
          modelUrl = parsed.assets?.modelUrl;
          dielineUrl = extractDielineUrl(parsed.assets);
          materialName = extractMaterialName(parsed.assets);
          productName = `Phôi ${parsed.category} (Tạm)`;

          if (!modelUrl || !dielineUrl) {
            throw new Error(`Dữ liệu phôi tạm thời không đầy đủ.`);
          }
          productData = {
            _id: "temp",
            name: productName,
            assets: parsed.assets,
          } as any;
        } else {
          const res = await api.get(`/products/${productId}`, {
            signal: controller.signal,
          });
          if (isCancelled) return;
          const product: Product = res.data?.data?.product;
          productData = product;
          modelUrl = product?.assets?.modelUrl;
          dielineUrl = extractDielineUrl(product?.assets);
          materialName = extractMaterialName(product?.assets);

          if (!product || !modelUrl || !dielineUrl) {
            throw new Error(`Phôi này thiếu file 3D hoặc file Dieline SVG.`);
          }
        }

        console.log("✅ [usePrinterStudio] Assets loaded:", {
          modelUrl,
          dielineUrl,
          materialName,
        });
        setBaseProduct(productData);
        setPhoiAssets({ modelUrl, dielineUrl, materialName });
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

  // ==================================================
  // ✅✅✅ SỬA LỖI VÒNG LẶP (Context Lost) ✅✅✅
  // ==================================================
  // Ổn định (memoize) các hàm này bằng useCallback

  const updateLayers = useCallback(() => {
    const canvas = editorRef.current?.getCanvas();
    if (!canvas) return;
    const objects = canvas.getObjects();
    objects.forEach(ensureObjectId);
    setLayers([...objects]);
    const activeObj = canvas.getActiveObject();
    if (activeObj) {
      ensureObjectId(activeObj);
      setActiveObjectId((activeObj as any).id);
      setSelectedObject(activeObj);
    } else {
      setActiveObjectId(null);
      setSelectedObject(null);
    }
  }, []); // ✅ Dependency rỗng

  const handleSelectLayer = useCallback(
    (obj: any) => {
      const canvas = editorRef.current?.getCanvas();
      if (canvas) {
        canvas.setActiveObject(obj);
        canvas.renderAll();
        updateLayers();
      }
    },
    [updateLayers] // ✅ Ổn định
  );

  const handleMoveLayer = useCallback(
    (obj: any, direction: "up" | "down" | "top" | "bottom") => {
      const canvas = editorRef.current?.getCanvas();
      if (!canvas) return;
      switch (direction) {
        case "up":
          (canvas as any).bringForward(obj);
          break;
        case "down":
          (canvas as any).sendBackwards(obj);
          break;
        case "top":
          (canvas as any).bringToFront(obj);
          break;
        case "bottom":
          (canvas as any).sendToBack(obj);
          break;
      }
      canvas.renderAll();
      updateLayers();
    },
    [updateLayers] // ✅ Ổn định
  );

  const handleToggleVisibility = useCallback(
    (obj: any) => {
      obj.set("visible", !obj.visible);
      editorRef.current?.getCanvas()?.renderAll();
      updateLayers();
    },
    [updateLayers] // ✅ Ổn định
  );

  const handleDeleteLayer = useCallback(
    (obj: any) => {
      editorRef.current?.getCanvas()?.remove(obj);
      updateLayers();
    },
    [updateLayers] // ✅ Ổn định
  );

  // ✅ ỔN ĐỊNH HÀM GÂY RA VÒNG LẶP
  const handleCanvasUpdate = useCallback(
    (materialKey: string, canvasElement: HTMLCanvasElement) => {
      setCanvasElements((prev) => {
        const newMap = new Map(prev);
        newMap.set(materialKey, canvasElement);
        // Tạm tắt log spam
        // console.log(
        //   `🎨 [usePrinterStudio] Canvas element updated for: ${materialKey}`
        // );
        return newMap;
      });
    },
    [] // ✅ Dependency rỗng
  );

  const handleImageUpload = (file: File) => {
    toast.success(`Đã tải ảnh: ${file.name}`);
  };

  const handlePropertiesUpdate = useCallback(() => {
    editorRef.current?.getCanvas()?.renderAll();
  }, []); // ✅ Ổn định

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
    const previewDataURL = canvas.toDataURL({
      format: "png",
      quality: 0.8,
      multiplier: 1,
    });
    const previewBlob = dataURLtoBlob(previewDataURL);
    return { json, previewBlob };
  }, []); // ✅ Ổn định

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
  }, [baseProduct, createCanvasSnapshot, navigate]); // ✅ Ổn định

  // === RETURN ===
  return {
    editorRef,
    baseProduct,
    phoiAssets,
    canvasElements,
    isLoading,
    is3DMainLoaded,
    selectedObject,
    layers,
    activeObjectId,
    productId,
    handleImageUpload,
    handleSelectLayer,
    handleMoveLayer,
    handleToggleVisibility,
    handleDeleteLayer,
    handleCanvasUpdate, // ✅ Đã ổn định
    handlePropertiesUpdate, // ✅ Đã ổn định
    handleSaveAndExit, // ✅ Đã ổn định
    setIs3DMainLoaded,
    navigate,
    updateLayers, // ✅ Đã ổn định
  };
}
