// frontend/src/features/printer/printer-studio/usePrinterStudio.ts
// ✅ KHẮC PHỤC LỖI KẸT LOADING:
// Gộp 2 useEffect (tải phôi + tải thư viện) thành 1 useEffect dùng Promise.all

import React, { useState, useRef, useEffect, useCallback } from "react";
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
  if (!assets || !assets.surfaces || !Array.isArray(assets.surfaces) || assets.surfaces.length === 0) {
    console.warn("⚠️ extractSurfaceInfo: Không có surfaces hoặc surfaces rỗng");
    return null;
  }
  
  const firstSurface = assets.surfaces[0];
  if (!firstSurface) {
    console.warn("⚠️ extractSurfaceInfo: firstSurface là null/undefined");
    return null;
  }
  
  const { dielineSvgUrl, materialName, surfaceKey } = firstSurface;
  console.log("🔍 extractSurfaceInfo - firstSurface:", {
    hasDielineSvgUrl: !!dielineSvgUrl,
    materialName,
    surfaceKey,
    fullSurface: firstSurface,
  });
  
  if (dielineSvgUrl && materialName && surfaceKey) {
    return { dielineUrl: dielineSvgUrl, materialName, surfaceKey };
  }
  
  console.warn("⚠️ extractSurfaceInfo: Thiếu thông tin:", {
    hasDielineSvgUrl: !!dielineSvgUrl,
    hasMaterialName: !!materialName,
    hasSurfaceKey: !!surfaceKey,
  });
  
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
  
  // ✅ THÊM: History stack cho Undo/Redo (max 50 actions)
  const [history, setHistory] = useState<EditorItem[][]>([]);
  const [historyIndex, setHistoryIndex] = useState(-1);
  const MAX_HISTORY = 50;

  // =================================================================
  // ✅ BƯỚC 1: Hợp nhất logic tải dữ liệu
  // =================================================================
  // ✅ THÊM: Ref để tránh gọi API nhiều lần khi component re-render
  const isFetchingRef = React.useRef(false);
  
  useEffect(() => {
    // ✅ Guard: Tránh gọi API nếu đang fetch hoặc không có productId
    if (isFetchingRef.current || !productId) {
      if (!productId) {
        toast.error("Không tìm thấy ID sản phẩm.");
        navigate("/printer/dashboard?tab=products");
      }
      return;
    }
    
    const loadStudioData = async () => {
      isFetchingRef.current = true;
      setIsLoading(true); // Bắt đầu tải

      // --- Hàm 1: Tải Phôi (Bắt buộc) ---
      const loadProductAssets = async () => {
        if (!productId) {
          toast.error("Không tìm thấy ID sản phẩm.");
          navigate("/printer/dashboard?tab=products");
          throw new Error("Missing productId"); // Dừng Promise.all
        }
        try {
          // ✅ SỬA: Public endpoint đã hỗ trợ optionalAuth và cho phép owner truy cập dù chưa active
          // Nếu user đã authenticated và là owner, endpoint sẽ tự động cho phép truy cập
          const res = await api.get(`/products/${productId}`);
          // Response format: { success: true, data: { product, printer } }
          let product: Product = res.data?.data?.product || res.data?.product || res.data?.data;
          
          if (!product) {
            throw new Error(`Không tìm thấy sản phẩm với ID: ${productId}`);
          }

          // ✅ SỬA: Nếu product thiếu thông tin assets đầy đủ (dielineSvgUrl), thử load từ Asset
          let surfaceInfo = extractSurfaceInfo(product.assets);
          
          // Debug: Log thông tin assets hiện tại
          console.log("📦 Product assets:", {
            hasModelUrl: !!product.assets?.modelUrl,
            hasSurfaces: !!product.assets?.surfaces?.length,
            surfacesCount: product.assets?.surfaces?.length || 0,
            firstSurface: product.assets?.surfaces?.[0],
            assetId: (product as any).assetId,
          });
          
          // Kiểm tra nếu thiếu assets đầy đủ
          if (!product.assets?.modelUrl || !surfaceInfo) {
            const assetId = (product as any).assetId;
            
            // Cách 1: Nếu có assetId, load từ Asset
            if (assetId) {
              try {
                console.log("⚠️ Product thiếu assets đầy đủ, đang load từ Asset:", assetId);
                const assetRes = await api.get(`/assets/${assetId}`);
                const asset = assetRes.data?.data?.asset || assetRes.data?.asset || assetRes.data?.data;
                
                if (asset && asset.assets) {
                  // Merge thông tin assets từ Asset vào Product
                  product.assets = {
                    ...product.assets,
                    modelUrl: product.assets?.modelUrl || asset.assets.modelUrl,
                    surfaces: asset.assets.surfaces || product.assets?.surfaces || [],
                  };
                  
                  surfaceInfo = extractSurfaceInfo(product.assets);
                  console.log("✅ Đã load assets từ Asset thành công");
                }
              } catch (assetErr: any) {
                console.warn("⚠️ Không thể load Asset:", assetErr);
                // Tiếp tục với logic khác
              }
            }
            
            // Cách 2: Nếu vẫn thiếu và không có assetId, thử tìm Asset từ danh sách
            if ((!product.assets?.modelUrl || !surfaceInfo) && !assetId) {
              try {
                console.log("⚠️ Không có assetId, đang tìm Asset từ danh sách...");
                console.log("📋 Product info:", {
                  name: product.name,
                  category: product.category,
                });
                
                const assetsRes = await api.get("/assets/my-assets");
                const allAssets = [
                  ...(assetsRes.data?.data?.privateAssets || []),
                  ...(assetsRes.data?.data?.publicAssets || []),
                ];
                
                console.log("📦 Available assets:", allAssets.map((a: any) => ({
                  id: a._id,
                  name: a.name,
                  category: a.category,
                  hasAssets: !!a.assets,
                })));
                
                // Tìm Asset có cùng category
                let matchingAsset = allAssets.find(
                  (a: any) => 
                    a.category === product.category &&
                    a.assets?.modelUrl &&
                    a.assets?.surfaces?.length > 0 &&
                    (a.name === product.name || 
                     product.name.toLowerCase().includes(a.name.toLowerCase()) ||
                     a.name.toLowerCase().includes(product.name.toLowerCase()))
                );
                
                // Nếu không tìm thấy match chính xác, lấy Asset đầu tiên cùng category
                if (!matchingAsset) {
                  console.log("⚠️ Không tìm thấy Asset match chính xác, thử lấy Asset đầu tiên cùng category...");
                  matchingAsset = allAssets.find(
                    (a: any) => 
                      a.category === product.category &&
                      a.assets?.modelUrl &&
                      a.assets?.surfaces?.length > 0
                  );
                }
                
                if (matchingAsset && matchingAsset.assets) {
                  console.log("✅ Tìm thấy Asset phù hợp:", {
                    id: matchingAsset._id,
                    name: matchingAsset.name,
                    category: matchingAsset.category,
                    hasModelUrl: !!matchingAsset.assets.modelUrl,
                    surfacesCount: matchingAsset.assets.surfaces?.length || 0,
                  });
                  
                  product.assets = {
                    ...product.assets,
                    modelUrl: product.assets?.modelUrl || matchingAsset.assets.modelUrl,
                    surfaces: matchingAsset.assets.surfaces || product.assets?.surfaces || [],
                  };
                  
                  surfaceInfo = extractSurfaceInfo(product.assets);
                  console.log("✅ Đã merge assets từ Asset phù hợp:", {
                    modelUrl: product.assets.modelUrl,
                    surfacesCount: product.assets.surfaces?.length || 0,
                    surfaceInfo: surfaceInfo ? "OK" : "NULL",
                  });
                } else {
                  console.warn("❌ Không tìm thấy Asset phù hợp trong danh sách");
                }
              } catch (assetsErr: any) {
                console.warn("⚠️ Không thể load danh sách Assets:", assetsErr);
              }
            }
          }

          if (!product.assets?.modelUrl || !surfaceInfo) {
            console.error("❌ Product assets:", product.assets);
            throw new Error(
              "Sản phẩm này bị lỗi. Thiếu thông tin phôi 3D (modelUrl) hoặc bề mặt (surfaces). " +
              "Vui lòng kiểm tra lại sản phẩm có đầy đủ thông tin phôi 3D."
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
          const errorMessage = err.response?.data?.message || err.message;
          
          // Cải thiện thông báo lỗi
          if (err.response?.status === 404) {
            toast.error(`Không tìm thấy sản phẩm với ID: ${productId}. Vui lòng kiểm tra lại.`);
          } else if (err.response?.status === 403) {
            toast.error("Bạn không có quyền truy cập sản phẩm này.");
          } else {
            toast.error(errorMessage || "Không thể tải dữ liệu phôi");
          }
          
          navigate("/printer/dashboard?tab=products"); // Điều hướng về nếu lỗi
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
        isFetchingRef.current = false;
      }
    };

    loadStudioData();
    // ✅ SỬA: Chỉ dùng productId làm dependency, không dùng navigate
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId]);

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

  // === UNDO/REDO HELPERS ===
  
  // ✅ THÊM: Save current state vào history
  const saveToHistory = useCallback((newDecals: EditorItem[]) => {
    setHistory((prevHistory) => {
      // Xóa các state sau historyIndex (khi user đã undo rồi làm action mới)
      const newHistory = prevHistory.slice(0, historyIndex + 1);
      // Thêm state mới
      const updatedHistory = [...newHistory, JSON.parse(JSON.stringify(newDecals))];
      // Giới hạn max history
      if (updatedHistory.length > MAX_HISTORY) {
        return updatedHistory.slice(-MAX_HISTORY);
      }
      return updatedHistory;
    });
    setHistoryIndex((prev) => {
      const newIndex = prev + 1;
      return newIndex >= MAX_HISTORY ? MAX_HISTORY - 1 : newIndex;
    });
  }, [historyIndex, MAX_HISTORY]);

  // ✅ THÊM: Wrapper để setDecals và tự động save vào history
  const setDecalsWithHistory = useCallback(
    (updater: EditorItem[] | ((prev: EditorItem[]) => EditorItem[])) => {
      setDecals((prevDecals) => {
        const newDecals =
          typeof updater === "function" ? updater(prevDecals) : updater;
        // Save vào history (chỉ khi có thay đổi thực sự)
        if (JSON.stringify(newDecals) !== JSON.stringify(prevDecals)) {
          saveToHistory(newDecals);
        }
        return newDecals;
      });
    },
    [saveToHistory]
  );

  // ✅ THÊM: Undo function
  const undo = useCallback(() => {
    if (historyIndex > 0) {
      const prevState = history[historyIndex - 1];
      setDecals(prevState);
      setHistoryIndex((prev) => prev - 1);
      toast.info("Đã hoàn tác");
    } else {
      toast.info("Không thể hoàn tác thêm");
    }
  }, [history, historyIndex]);

  // ✅ THÊM: Redo function
  const redo = useCallback(() => {
    if (historyIndex < history.length - 1) {
      const nextState = history[historyIndex + 1];
      setDecals(nextState);
      setHistoryIndex((prev) => prev + 1);
      toast.info("Đã làm lại");
    } else {
      toast.info("Không thể làm lại thêm");
    }
  }, [history, historyIndex]);

  // ✅ THÊM: Check if can undo/redo
  const canUndo = historyIndex > 0;
  const canRedo = historyIndex < history.length - 1;

  // ✅ THÊM: Initialize history khi decals thay đổi từ load
  useEffect(() => {
    if (decals.length > 0 && history.length === 0) {
      // Lần đầu load decals → save vào history
      setHistory([JSON.parse(JSON.stringify(decals))]);
      setHistoryIndex(0);
    }
  }, [decals.length, history.length]); // Chạy khi decals được load lần đầu

  // ✅ THÊM: Keyboard shortcuts cho Undo/Redo
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsSnapping(true);
      
      // Keyboard shortcuts cho Undo/Redo
      if ((e.ctrlKey || e.metaKey) && e.key === "z" && !e.shiftKey) {
        e.preventDefault();
        undo();
      }
      if ((e.ctrlKey || e.metaKey) && (e.key === "y" || (e.key === "z" && e.shiftKey))) {
        e.preventDefault();
        redo();
      }
    };
    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === "Shift") setIsSnapping(false);
    };
    window.addEventListener("keydown", handleKeyDown);
    window.addEventListener("keyup", handleKeyUp);
    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      window.removeEventListener("keyup", handleKeyUp);
    };
  }, [undo, redo]);

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
        setDecalsWithHistory((prev) => [...prev, newDecal]);
        setSelectedDecalId(newDecal.id);
      }
    },
    [setDecalsWithHistory]
  );

  const deleteDecal = useCallback(
    (id: string) => {
      setDecalsWithHistory((prev) => prev.filter((d) => d.id !== id));
      if (selectedDecalId === id) {
        setSelectedDecalId(null);
      }
    },
    [selectedDecalId, setDecalsWithHistory]
  );

  const updateDecal = useCallback((id: string, updates: Partial<EditorItem>, saveHistory = false) => {
    if (saveHistory) {
      setDecalsWithHistory((prev) =>
        prev.map((d) => (d.id === id ? ({ ...d, ...updates } as EditorItem) : d))
      );
    } else {
      setDecals((prev) =>
        prev.map((d) => (d.id === id ? ({ ...d, ...updates } as EditorItem) : d))
      );
    }
  }, [setDecalsWithHistory]);

  // ✅ THÊM: Logic reorder decals (kéo thả để sắp xếp lại thứ tự)
  const reorderDecals = useCallback(
    (activeId: string, overId: string | null, newParentId: string | null) => {
      if (!overId) return;
      
      setDecalsWithHistory((prev) => {
        const activeIndex = prev.findIndex((d) => d.id === activeId);
        const overIndex = prev.findIndex((d) => d.id === overId);
        
        if (activeIndex === -1 || overIndex === -1) return prev;
        if (activeIndex === overIndex) return prev;

        // Sử dụng arrayMove từ @dnd-kit/sortable
        const newDecals = [...prev];
        const [removed] = newDecals.splice(activeIndex, 1);
        newDecals.splice(overIndex, 0, removed);
        
        return newDecals;
      });
    },
    [setDecalsWithHistory]
  );

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
    reorderDecals, // ✅ THÊM: Export reorderDecals
    activeToolbarTab,
    setActiveToolbarTab,
    selectedDecalId,
    setSelectedDecalId,
    uploadedImages,
    handleToolbarImageUpload,
    gizmoMode,
    setGizmoMode,
    isSnapping,
    // ✅ THÊM: Undo/Redo
    undo,
    redo,
    canUndo,
    canRedo,
  };
}
