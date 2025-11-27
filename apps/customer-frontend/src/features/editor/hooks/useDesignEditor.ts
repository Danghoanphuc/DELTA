// features/editor/hooks/useDesignEditor.ts
// ✅ PHASE 1 REFACTORED: Zustand + Immer + Debounced Auto-save
// Hook quản lý business logic và side effects của 3D Editor

import { useState, useEffect, useCallback, useMemo, useRef } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import { toast } from "@/shared/utils/toast";
import { useDebouncedCallback } from 'use-debounce';
import { useCartStore } from '@/stores/useCartStore';
import { Product } from '@/types/product';
import * as editorService from '../services/editorService';
import {
  saveDraftDesign,
  getDraftDesign,
  getCustomizedDesignById,
} from '../services/editorService';
import { EditorItem, DecalItem } from '../types/decal.types';
import { InteractionResult } from './use3DInteraction';
import {
  getMyMediaAssets,
  createMediaAsset,
  UploadedImageVM,
} from '@/services/mediaAssetService';

// ✅ PHASE 1: Import Zustand store
import { 
  useEditorStore, 
  selectFlatDecals, 
  selectFirstSelectedItem 
} from '@/stores/useEditorStore';

const createId = (prefix: 'decal' | 'group') =>
  `${prefix}_${Date.now()}_${Math.floor(Math.random() * 1000)}`;

export type GizmoMode = 'translate' | 'rotate' | 'scale';

export function useDesignEditor() {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const { addToCart } = useCartStore();

  // ✅ PHASE 1: Sử dụng Zustand store thay vì local state
  const {
    items,
    selectedItemIds,
    gizmoMode,
    isSnapping,
    toolMode,
    activeToolbarTab,
    isDirty,
    lastSavedAt,
    setItems,
    addItem,
    updateItem,
    deleteItems,
    selectItem,
    deselectAll,
    setGizmoMode,
    setIsSnapping,
    setToolMode,
    setActiveToolbarTab,
    undo,
    redo,
    canUndo,
    canRedo,
    groupSelectedItems,
    ungroupSelectedItem,
    reorderItems,
    markClean,
    saveToHistory,
  } = useEditorStore();

  // === LOCAL STATE (không thuộc editor state) ===
  const [product, setProduct] = useState<Product | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [isSaving, setIsSaving] = useState(false);
  const [isModelLoaded, setIsModelLoaded] = useState(false);
  const [uploadedImages, setUploadedImages] = useState<UploadedImageVM[]>([]);
  const [draftId, setDraftId] = useState<string | null>(null);

  // Pricing state
  const [selectedQuantity, setSelectedQuantity] = useState(1);
  const [selectedPriceIndex, setSelectedPriceIndex] = useState(0);

  // === COMPUTED VALUES (từ store) ===
  const flatDecalItems = useEditorStore(selectFlatDecals);
  const firstSelectedItem = useEditorStore(selectFirstSelectedItem);

  // === REFS ===
  const isFetchingRef = useRef(false);

  // === DEBOUNCED AUTO-SAVE (TASK 2) ===
  const debouncedAutoSave = useDebouncedCallback(
    async () => {
      if (!product || !isDirty || items.length === 0) return;

      try {
        const savedDraftId = await saveDraftDesign(product._id, { items });
        if (savedDraftId) {
          setDraftId(savedDraftId);
          markClean(); // ✅ Reset dirty flag
          console.debug('✅ Auto-saved draft at', new Date().toLocaleTimeString());
        }
      } catch (err) {
        console.error('❌ Auto-save failed:', err);
        // Không hiển thị toast để không làm phiền user
      }
    },
    2000, // Debounce 2 seconds
    { leading: false, trailing: true }
  );

  // === AUTO-SAVE TRIGGERS ===

  // 1. Trigger khi items thay đổi
  useEffect(() => {
    if (isDirty) {
      debouncedAutoSave();
    }
  }, [isDirty, debouncedAutoSave]);

  // 2. Force save khi user blur window (đi chỗ khác)
  useEffect(() => {
    const handleWindowBlur = () => {
      if (isDirty) {
        debouncedAutoSave.flush(); // Save ngay lập tức
      }
    };

    window.addEventListener('blur', handleWindowBlur);
    return () => window.removeEventListener('blur', handleWindowBlur);
  }, [isDirty, debouncedAutoSave]);

  // 3. Force save trước khi unmount
  useEffect(() => {
    return () => {
      if (isDirty) {
        debouncedAutoSave.flush();
      }
    };
  }, [isDirty, debouncedAutoSave]);

  // === KEYBOARD SHORTCUTS ===
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Shift for snapping
      if (e.key === 'Shift') setIsSnapping(true);

      // Ctrl/Cmd+Z for Undo
      if ((e.ctrlKey || e.metaKey) && e.key === 'z' && !e.shiftKey) {
        e.preventDefault();
        undo();
      }

      // Ctrl/Cmd+Y or Ctrl/Cmd+Shift+Z for Redo
      if ((e.ctrlKey || e.metaKey) && (e.key === 'y' || (e.key === 'z' && e.shiftKey))) {
        e.preventDefault();
        redo();
      }

      // Delete key for deleting selected items
      if (e.key === 'Delete' || e.key === 'Backspace') {
        if (selectedItemIds.length > 0) {
          e.preventDefault();
          deleteItems(selectedItemIds);
        }
      }
    };

    const handleKeyUp = (e: KeyboardEvent) => {
      if (e.key === 'Shift') setIsSnapping(false);
    };

    document.addEventListener('keydown', handleKeyDown);
    document.addEventListener('keyup', handleKeyUp);

    return () => {
      document.removeEventListener('keydown', handleKeyDown);
      document.removeEventListener('keyup', handleKeyUp);
    };
  }, [undo, redo, deleteItems, selectedItemIds, setIsSnapping]);

  // === DATA LOADING ===
  const productId = useMemo(() => searchParams.get('productId'), [searchParams]);
  const customizedDesignId = useMemo(
    () => searchParams.get('customizedDesignId'),
    [searchParams]
  );

  useEffect(() => {
    if (isFetchingRef.current) return;

    // Load from customizedDesignId
    if (customizedDesignId && !productId) {
      const loadDesign = async () => {
        isFetchingRef.current = true;
        setIsLoading(true);
        try {
          const design = await getCustomizedDesignById(customizedDesignId);
          if (design.baseProductId) {
            const fetchedProduct = await editorService.getProductById(design.baseProductId);
            setProduct(fetchedProduct);

            if (design.editorData?.items) {
              setItems(design.editorData.items);
              // ✅ Initialize history
              saveToHistory();
            }
          } else {
            toast.error('Thiết kế này không có sản phẩm gốc');
            navigate('/designs');
          }
        } catch (err: any) {
          console.error('Lỗi load design:', err);
          toast.error('Không thể tải thiết kế');
          navigate('/designs');
        } finally {
          setIsLoading(false);
          isFetchingRef.current = false;
        }
      };
      loadDesign();
      return;
    }

    if (!productId) {
      if (!customizedDesignId) {
        toast.error('Không tìm thấy ID sản phẩm trong URL.');
        navigate('/shop');
      }
      return;
    }

    const fetchStudioData = async () => {
      isFetchingRef.current = true;
      setIsLoading(true);

      const fetchProduct = async () => {
        try {
          const fetchedProduct = await editorService.getProductById(productId);

          if (!fetchedProduct) {
            toast.error('Không tìm thấy sản phẩm');
            navigate('/shop');
            throw new Error('Product not found');
          }

          if (!fetchedProduct.customization?.hasDesignService) {
            toast.error('Sản phẩm này không hỗ trợ chỉnh sửa 3D.');
            navigate(`/products/${productId}`);
            throw new Error('Product does not support design service');
          }

          if (!fetchedProduct.assets?.modelUrl) {
            toast.error('Sản phẩm này chưa có mô hình 3D.');
            navigate(`/products/${productId}`);
            throw new Error('Product missing 3D model');
          }

          if (
            !fetchedProduct.assets?.surfaces ||
            fetchedProduct.assets.surfaces.length === 0
          ) {
            toast.error('Sản phẩm này chưa có bề mặt có thể thiết kế.');
            navigate(`/products/${productId}`);
            throw new Error('Product missing design surfaces');
          }

          setProduct(fetchedProduct);
          if (fetchedProduct.pricing && fetchedProduct.pricing.length > 0) {
            setSelectedQuantity(fetchedProduct.pricing[0].minQuantity || 1);
          }

          // Load existing design
          if (customizedDesignId) {
            try {
              const design = await getCustomizedDesignById(customizedDesignId);
              if (design.editorData?.items) {
                setItems(design.editorData.items);
                saveToHistory(); // ✅ Initialize history
                toast.success('Đã tải thiết kế đã lưu');
              }
            } catch (err) {
              console.error('Lỗi load customized design:', err);
              toast.error('Không thể tải thiết kế đã lưu');
            }
          } else {
            // Load draft
            try {
              const draft = await getDraftDesign(productId);
              if (draft && draft.editorData?.items) {
                setItems(draft.editorData.items);
                saveToHistory(); // ✅ Initialize history
                toast.info('Đã khôi phục bản nháp trước đó');
              }
            } catch (err) {
              console.debug('Không có draft:', err);
            }
          }
        } catch (err: any) {
          console.error('Lỗi tải Product:', err);
          if (!err.message?.includes('navigate')) {
            navigate('/shop');
          }
          throw err;
        }
      };

      const fetchLibrary = async () => {
        try {
          const assets = await getMyMediaAssets();
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
          console.error('Lỗi tải thư viện media:', err);
          toast.error('Không thể tải thư viện ảnh');
        }
      };

      try {
        await Promise.all([fetchProduct(), fetchLibrary()]);
      } catch (err) {
        console.error('Lỗi nghiêm trọng khi tải studio:', err);
      } finally {
        setIsLoading(false);
        isFetchingRef.current = false;
      }
    };

    fetchStudioData();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [productId, customizedDesignId]);

  // === HANDLERS ===

  const handleAddItem = useCallback(
    (itemType: 'decal', dropData: any, interactionResult: InteractionResult) => {
      let newDecal: DecalItem | null = null;
      const id = createId('decal');
      const pos = interactionResult.worldPoint.toArray();
      const norm = interactionResult.worldNormal.toArray();
      const defaultRotation: [number, number, number] = [0, 0, 0];
      let parentId: string | null = null;

      if (firstSelectedItem && firstSelectedItem.type === 'group') {
        parentId = firstSelectedItem.id;
      }

      if (dropData.type === 'image') {
        newDecal = {
          id,
          type: 'decal',
          parentId,
          decalType: 'image',
          imageUrl: dropData.imageUrl,
          position: pos,
          normal: norm,
          size: [0.15, 0.15],
          rotation: defaultRotation,
          isVisible: true,
          isLocked: false,
          qualityStatus: dropData.qualityStatus,
        };
      } else if (dropData.type === 'text') {
        newDecal = {
          id,
          type: 'decal',
          parentId,
          decalType: 'text',
          text: dropData.text || 'New Text',
          color: dropData.color || '#000000',
          position: pos,
          normal: norm,
          size: [0.3, 0.1],
          rotation: defaultRotation,
          isVisible: true,
          isLocked: false,
        };
      } else if (dropData.type === 'shape') {
        newDecal = {
          id,
          type: 'decal',
          parentId,
          decalType: 'shape',
          shapeType: dropData.shapeType || 'rect',
          color: dropData.color || '#3498db',
          position: pos,
          normal: norm,
          size: [0.15, 0.15],
          rotation: defaultRotation,
          isVisible: true,
          isLocked: false,
        };
      }

      if (newDecal) {
        addItem(newDecal);
        selectItem(newDecal.id, false);
      }
    },
    [firstSelectedItem, addItem, selectItem]
  );

  const handleToolbarImageUpload = useCallback(
    async (file: File) => {
      const existingFile = uploadedImages.find(
        (img) => img.name === file.name && !img.isLoading
      );
      if (existingFile) {
        toast.warning(`Ảnh "${file.name}" đã có trong thư viện.`);
        return;
      }

      const id = `upload_${Date.now()}`;
      const placeholder: UploadedImageVM = {
        id,
        url: '',
        name: file.name,
        isLoading: true,
      };
      setUploadedImages((prev) => [placeholder, ...prev]);
      toast.info(`Đang tải lên: ${file.name}`);

      try {
        const newAsset = await createMediaAsset(file);
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
        console.error('Lỗi upload/create media asset:', err);
        toast.error(`Không thể tải lên: ${file.name}`);
        setUploadedImages((prev) => prev.filter((img) => img.id !== id));
      }
    },
    [uploadedImages]
  );

  // === PRICING LOGIC ===
  const minQuantity = useMemo(
    () => product?.pricing[0]?.minQuantity || 1,
    [product]
  );

  const currentPricePerUnit = useMemo(
    () => product?.pricing[selectedPriceIndex]?.pricePerUnit ?? 0,
    [product, selectedPriceIndex]
  );

  useEffect(() => {
    if (minQuantity > 0 && selectedQuantity < minQuantity) {
      setSelectedQuantity(minQuantity);
    }
  }, [minQuantity, selectedQuantity]);

  useEffect(() => {
    if (!product?.pricing) return;
    let bestTierIndex = 0;
    for (let i = 0; i < product.pricing.length; i++) {
      if (selectedQuantity >= product.pricing[i].minQuantity) {
        if (
          product.pricing[i].minQuantity >=
          product.pricing[bestTierIndex].minQuantity
        ) {
          bestTierIndex = i;
        }
      }
    }
    setSelectedPriceIndex(bestTierIndex);
  }, [selectedQuantity, product?.pricing]);

  // === SAVE & ADD TO CART ===
  const handleSaveAndAddToCart = async () => {
    if (!product) {
      toast.error('Lỗi: Không có thông tin sản phẩm gốc.');
      return;
    }
    setIsSaving(true);

    try {
      const newDesignId = await editorService.saveCustomDesign(product._id, {
        items: items,
      });

      // Clear draft sau khi lưu
      if (draftId) {
        setDraftId(null);
        markClean();
      }

      await addToCart({
        productId: product._id,
        quantity: selectedQuantity,
        selectedPriceIndex: selectedPriceIndex,
        customization: {
          notes: 'Thiết kế tùy chỉnh 3D',
          customizedDesignId: newDesignId,
        },
      });

      toast.success('Đã lưu thiết kế và thêm vào giỏ hàng!');
      navigate('/checkout');
    } catch (err: any) {
      console.error('Lỗi khi lưu và thêm vào giỏ:', err);
      toast.error(err.message || 'Lưu thiết kế thất bại');
    } finally {
      setIsSaving(false);
    }
  };

  // === RETURN ===
  return {
    // Product data
    product,
    isLoading,
    isSaving,
    isModelLoaded,
    setIsModelLoaded,

    // Editor state (từ Zustand)
    items,
    flatDecalItems,
    selectedItemIds,
    firstSelectedItem,
    gizmoMode,
    isSnapping,
    toolMode,
    activeToolbarTab,

    // Editor actions (từ Zustand)
    handleSelectItem: selectItem,
    deselectAll,
    addItem: handleAddItem,
    deleteSelectedItems: () => deleteItems(selectedItemIds),
    updateItemProperties: updateItem,
    handleGroupSelection: groupSelectedItems,
    handleUngroupSelection: ungroupSelectedItem,
    reorderItems,
    setGizmoMode,
    setToolMode,
    setActiveToolbarTab,

    // History
    undo,
    redo,
    canUndo: canUndo(),
    canRedo: canRedo(),

    // Media library
    uploadedImages,
    handleToolbarImageUpload,

    // Pricing
    selectedQuantity,
    setSelectedQuantity,
    minQuantity,
    currentPricePerUnit,

    // Save
    handleSaveAndAddToCart,

    // Auto-save status
    isDirty,
    lastSavedAt,
  };
}