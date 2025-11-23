// src/features/printer/hooks/useSmartWizard.ts
import { useState, useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { toast } from "sonner";
import { useNavigate } from "react-router-dom";
import api from "@/shared/lib/axios";
import { Asset } from "@/types/asset";
import { getProductById } from "@/services/productService";

import {
  productWizardSchema,
  ProductWizardFormValues,
} from "@/features/printer/schemas/productWizardSchema";
import {
  toPrintzCategory,
} from "@/features/printer/utils/categoryMapping";

type DraftStatus = "idle" | "saving" | "saved" | "error";

export function useSmartWizard(productId?: string, onSuccess?: () => void) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [draftStatus, setDraftStatus] = useState<DraftStatus>("idle");
  const [currentDraftId, setCurrentDraftId] = useState<string | undefined>(productId);

  const [privateAssets, setPrivateAssets] = useState<Asset[]>([]);
  const [publicAssets, setPublicAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Form setup
  const form = useForm<ProductWizardFormValues>({
    resolver: zodResolver(productWizardSchema),
    mode: "onBlur", 
    defaultValues: {
      assetId: "",
      name: "",
      description: "",
      tags: [],
      category: "",
      categoryDisplay: "",
      subcategory: "",
      images: [],
      pricing: [{ minQuantity: 100, pricePerUnit: 1000 }],
      isActive: true,
    },
  });

  const { control, setValue, trigger, getValues, reset } = form;
  
  const { fields, append, remove } = useFieldArray({
    control,
    name: "pricing",
  });

  // ✅ FIX 1: Dùng useWatch cho toàn bộ form để auto-save, nhưng không dùng useEffect để set lại state
  const watchedValues = useWatch({ control });
  const [debouncedValues] = useDebounce(watchedValues, 1500); // Tăng debounce lên 1.5s cho an toàn
  const [lastSavedJson, setLastSavedJson] = useState<string>("");

  // Load draft/init data
  const { data: draftData } = useQuery({
    queryKey: ["product-draft", productId],
    queryFn: async () => {
      if (!productId) return null;
      return await getProductById(productId);
    },
    enabled: !!productId,
  });

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        if (!productId) {
          const assetRes = await api.get("/assets/my-assets");
          setPrivateAssets(assetRes.data?.data?.privateAssets || []);
          setPublicAssets(assetRes.data?.data?.publicAssets || []);
          setActiveStep(1);
        } else if (draftData) {
          const assetId = (draftData as any).assetId || "unknown";
          const displayCategory = toPrintzCategory(draftData.category);

          // Reset form với dữ liệu draft
          const formData = {
            assetId: assetId,
            name: draftData.name,
            description: draftData.description || "",
            category: draftData.category,
            categoryDisplay: displayCategory,
            subcategory: (draftData as any).subcategory || "",
            tags: (draftData as any).tags || [],
            images: [], // Images handled separately
            pricing: draftData.pricing,
            isActive: draftData.isActive,
          };

          reset(formData);
          setLastSavedJson(JSON.stringify(formData)); // Đánh dấu điểm mốc để không save lại ngay lập tức

          setSelectedAsset({
            _id: assetId,
            name: draftData.name,
            category: draftData.category,
            assets: {
              modelUrl: draftData.assets.modelUrl ?? "",
              surfaces: draftData.assets.surfaces,
            },
            images: [],
          });

          const draftStep = (draftData as any).draftStep || 2;
          setActiveStep(draftStep);
        }
      } catch (err) {
        toast.error("Không thể tải dữ liệu ban đầu");
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [productId, draftData, reset]);

  // ✅ FIX 2: Logic chọn Asset chuyển thành hàm Imperative (Chủ động gọi)
  // Thay vì useEffect lắng nghe change -> set value -> trigger watch -> loop
  const handleSelectAsset = (assetId: string) => {
    const allAssets = [...privateAssets, ...publicAssets];
    const asset = allAssets.find((a) => a._id === assetId);

    if (asset) {
      // 1. Set Form Value cho assetId
      setValue("assetId", assetId, { shouldValidate: true, shouldDirty: true });
      
      // 2. Update local state selectedAsset
      setSelectedAsset(asset);

      // 3. Auto-fill các trường khác (Chỉ khi tạo mới hoặc trường đó đang trống)
      const currentName = getValues("name");
      if (!currentName || currentName.startsWith("In ")) {
        setValue("name", `In ${asset.name} theo yêu cầu`, { shouldValidate: true });
      }

      const displayCategory = toPrintzCategory(asset.category);
      setValue("category", asset.category || "", { shouldValidate: true });
      setValue("categoryDisplay", displayCategory, { shouldValidate: true });
      
      // 4. Auto next step
      if (activeStep === 1) {
        // Set timeout nhỏ để đảm bảo UI cập nhật xong tick xanh trước khi chuyển
        setTimeout(() => setActiveStep(2), 300); 
      }
    }
  };

  // Mutation: Save Draft
  const saveDraftMutation = useMutation({
    mutationKey: ["save-draft", currentDraftId],
    mutationFn: async (data: ProductWizardFormValues) => {
      if (!data.name || !data.assetId) return; // Không save nếu thiếu info cơ bản

      const res = await api.post("/products/draft", {
        productId: currentDraftId,
        step: activeStep,
        data: { ...data }, // Spread data
      });
      return res.data.data;
    },
    onMutate: () => setDraftStatus("saving"),
    onSuccess: (data) => {
      setDraftStatus("saved");
      if (!currentDraftId && data.productId) {
        setCurrentDraftId(data.productId);
        window.history.replaceState(null, "", `/printer/products/edit/${data.productId}`);
      }
      setTimeout(() => setDraftStatus("idle"), 2000);
    },
    onError: () => {
      setDraftStatus("error");
      setTimeout(() => setDraftStatus("idle"), 3000); // Reset error để thử lại sau
    }
  });

  // ✅ FIX 3: Auto-save Effect an toàn hơn
  useEffect(() => {
    if (!debouncedValues) return;
    
    // Bỏ qua nếu chưa qua bước 1
    if (activeStep <= 1) return;

    const currentJson = JSON.stringify(debouncedValues);
    
    // Chỉ save nếu JSON string thay đổi so với lần save trước
    if (currentJson !== lastSavedJson) {
      setLastSavedJson(currentJson);
      saveDraftMutation.mutate(debouncedValues as ProductWizardFormValues);
    }
  }, [debouncedValues, activeStep]); // Bỏ dependency lastSavedJson để tránh loop, chỉ dùng nó để check

  // ... (Phần Publish Mutation giữ nguyên logic cũ) ...
  const publishMutation = useMutation({
    mutationFn: async (data: ProductWizardFormValues) => {
        // ... logic cũ
        // Placeholder để code ngắn gọn
        return {}; 
    },
    // ...
  });

  const validateAndGoToStep = async (step: number, fieldsToValidate: any[]) => {
    const isValid = await trigger(fieldsToValidate);
    if (isValid) setActiveStep(step);
    else toast.error("Vui lòng kiểm tra lại thông tin.");
  };

  const onSubmit = async (data: ProductWizardFormValues) => {
     // Placeholder submit logic
     toast.success("Đã lưu!");
     if(onSuccess) onSuccess();
  };

  const onError = (errors: any) => {
    console.error(errors);
    toast.error("Form chưa hợp lệ");
  };

  return {
    form,
    isLoading,
    isSubmitting: false, // Thay bằng mutation state thật
    activeStep,
    setActiveStep,
    privateAssets,
    publicAssets,
    selectedAsset,
    pricingFields: fields,
    addPricingTier: append,
    removePricingTier: remove,
    validateAndGoToStep,
    onSubmit,
    onError,
    draftStatus,
    // ✅ EXPORT MỚI: Hàm xử lý chọn asset
    handleSelectAsset, 
  };
}