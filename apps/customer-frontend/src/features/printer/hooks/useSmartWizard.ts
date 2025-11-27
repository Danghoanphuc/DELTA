// src/features/printer/hooks/useSmartWizard.ts

import { useState, useEffect } from "react";
import { useForm, useFieldArray, useWatch } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { useDebounce } from "use-debounce";
import { toast } from "@/shared/utils/toast";
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

  // Theo dõi form để Auto-save
  const watchedValues = useWatch({ control });
  const [debouncedValues] = useDebounce(watchedValues, 1500);
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
            images: [], // Images handled separately (by AsyncUpload Hook)
            pricing: draftData.pricing,
            isActive: draftData.isActive,
          };

          reset(formData);
          setLastSavedJson(JSON.stringify(formData)); 

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

  // Hàm xử lý chọn Asset (Imperative)
  const handleSelectAsset = (assetId: string) => {
    const allAssets = [...privateAssets, ...publicAssets];
    const asset = allAssets.find((a) => a._id === assetId);

    if (asset) {
      // 1. Set Form Value
      setValue("assetId", assetId, { shouldValidate: true, shouldDirty: true });
      
      // 2. Update local state
      setSelectedAsset(asset);

      // 3. Auto-fill (nếu chưa có)
      const currentName = getValues("name");
      if (!currentName || currentName.startsWith("In ")) {
        setValue("name", `In ${asset.name} theo yêu cầu`, { shouldValidate: true });
      }

      const displayCategory = toPrintzCategory(asset.category);
      setValue("category", asset.category || "", { shouldValidate: true });
      setValue("categoryDisplay", displayCategory, { shouldValidate: true });
      
      // 4. Auto next step
      if (activeStep === 1) {
        setTimeout(() => setActiveStep(2), 300); 
      }
    }
  };

  // Mutation: Save Draft
  const saveDraftMutation = useMutation({
    mutationKey: ["save-draft", currentDraftId],
    mutationFn: async (data: ProductWizardFormValues) => {
      if (!data.name || !data.assetId) return; 

      const res = await api.post("/products/draft", {
        productId: currentDraftId,
        step: activeStep,
        data: { ...data },
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
      setTimeout(() => setDraftStatus("idle"), 3000);
    }
  });

  // Auto-save Effect
  useEffect(() => {
    if (!debouncedValues) return;
    if (activeStep <= 1) return;

    const currentJson = JSON.stringify(debouncedValues);
    if (currentJson !== lastSavedJson) {
      setLastSavedJson(currentJson);
      saveDraftMutation.mutate(debouncedValues as ProductWizardFormValues);
    }
  }, [debouncedValues, activeStep]); 

  const validateAndGoToStep = async (step: number, fieldsToValidate: any[]) => {
    const isValid = await trigger(fieldsToValidate);
    if (isValid) setActiveStep(step);
    else toast.error("Vui lòng kiểm tra lại thông tin.");
  };

  const onSubmit = async (data: ProductWizardFormValues) => {
     toast.success("Đã lưu!");
     if(onSuccess) onSuccess();
  };

  // ✅ XỬ LÝ LỖI THÔNG MINH (NO-TOAST)
  const onError = (errors: any) => {
    console.error("❌ Form Validation Errors:", errors);
    
    // Tự động chuyển đến tab chứa lỗi đầu tiên tìm thấy
    if (errors.assetId) {
      setActiveStep(1); 
    } else if (errors.name || errors.categoryDisplay || errors.description) {
      setActiveStep(2); 
    } else if (errors.images) {
      setActiveStep(3); 
    } else if (errors.pricing) {
      setActiveStep(4); 
    } else {
      setActiveStep(1);
    }
  };

  return {
    form,
    isLoading,
    isSubmitting: false, 
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
    handleSelectAsset, 
  };
}