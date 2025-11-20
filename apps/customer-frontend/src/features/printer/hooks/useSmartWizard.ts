// apps/customer-frontend/src/features/printer/hooks/useSmartWizard.ts
// ✨ SMART PIPELINE: Hook với auto-save draft

import { useState, useEffect, useCallback } from "react";
import { useForm, useFieldArray } from "react-hook-form";
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
  toLegacyCategory,
  toPrintzCategory,
} from "@/features/printer/utils/categoryMapping";

type DraftStatus = "idle" | "saving" | "saved" | "error";

/**
 * ✨ SMART WIZARD HOOK
 * - Auto-save draft mỗi 1 giây
 * - Load draft khi có productId
 * - Publish draft (submit final)
 */
export function useSmartWizard(productId?: string, onSuccess?: () => void) {
  const navigate = useNavigate();
  const queryClient = useQueryClient();

  const [isLoading, setIsLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);
  const [draftStatus, setDraftStatus] = useState<DraftStatus>("idle");
  const [currentDraftId, setCurrentDraftId] = useState<string | undefined>(productId); // ✨ Track draft ID

  const [privateAssets, setPrivateAssets] = useState<Asset[]>([]);
  const [publicAssets, setPublicAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  // Form setup
  const form = useForm<ProductWizardFormValues>({
    resolver: zodResolver(productWizardSchema),
    mode: "onChange",
    defaultValues: {
      assetId: "",
      name: "",
      description: "",
      tags: [], // ✨ NEW: Tags field
      category: "",
      categoryDisplay: "",
      subcategory: "",
      images: [],
      pricing: [{ minQuantity: 100, pricePerUnit: 1000 }],
      isActive: true,
    },
  });

  const { control, setValue, trigger, getValues, reset, watch } = form;
  const watchedAssetId = watch("assetId");
  const watchedName = watch("name"); // ✨ Watch name để reset error khi đổi tên

  const { fields, append, remove } = useFieldArray({
    control,
    name: "pricing",
  });

  // ✅ Watch form values cho auto-save
  const formValues = watch();
  const [debouncedValues] = useDebounce(formValues, 1000); // 1 giây delay
  const [lastSavedValues, setLastSavedValues] = useState<string>(""); // ✨ Track last saved state

  // ✅ Load draft nếu có productId
  const { data: draftData } = useQuery({
    queryKey: ["product-draft", productId],
    queryFn: async () => {
      if (!productId) return null;
      const res = await getProductById(productId);
      return res;
    },
    enabled: !!productId,
  });

  // ✅ Load initial data (assets hoặc draft)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        if (!productId) {
          // Tạo mới: Load assets
          const assetRes = await api.get("/assets/my-assets");
          setPrivateAssets(assetRes.data?.data?.privateAssets || []);
          setPublicAssets(assetRes.data?.data?.publicAssets || []);
          setActiveStep(1);
        } else if (draftData) {
          // Edit: Load draft
          const assetId = (draftData as any).assetId || "unknown";
          const displayCategory = toPrintzCategory(draftData.category);

          reset({
            assetId: assetId,
            name: draftData.name,
            description: draftData.description || "",
            category: draftData.category,
            categoryDisplay: displayCategory,
            subcategory: (draftData as any).subcategory || "",
            images: [],
            pricing: draftData.pricing,
            isActive: draftData.isActive,
          });

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

          // Resume từ bước đã lưu
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

  // ✅ Auto-select asset khi chọn phôi
  useEffect(() => {
    if (!productId) {
      const allAssets = [...privateAssets, ...publicAssets];
      const asset = allAssets.find((a) => a._id === watchedAssetId);
      if (asset) {
        setSelectedAsset(asset);
        const displayCategory = toPrintzCategory(asset.category);
        if (!getValues("name")) {
          setValue("name", `In ${asset.name} theo yêu cầu`);
        }
        setValue("category", asset.category || "");
        setValue("categoryDisplay", displayCategory);
        setValue("subcategory", "");
        if (activeStep === 1) {
          setActiveStep(2);
        }
      } else {
        setSelectedAsset(null);
      }
    }
  }, [
    watchedAssetId,
    privateAssets,
    publicAssets,
    setValue,
    getValues,
    activeStep,
    productId,
  ]);

  // ✅ Auto-save draft mutation
  const saveDraftMutation = useMutation({
    mutationKey: ["save-draft", currentDraftId], // ✨ Add key để TanStack Query có thể dedupe
    mutationFn: async (data: ProductWizardFormValues) => {
      console.log(`[Draft] Saving... (ID: ${currentDraftId || "new"})`);
      const res = await api.post("/products/draft", {
        productId: currentDraftId, // ✨ Use tracked draft ID
        step: activeStep,
        data: {
          name: data.name,
          description: data.description,
          category: data.category,
          categoryDisplay: data.categoryDisplay,
          subcategory: data.subcategory,
          pricing: data.pricing,
          isActive: data.isActive,
          // Note: images sẽ được upload riêng bởi useAsyncUpload
        },
      });
      return res.data.data;
    },
    onMutate: () => {
      setDraftStatus("saving");
    },
    onSuccess: (data, variables) => {
      setDraftStatus("saved");
      
      // ✨ Track saved values để tránh save lại cùng data
      setLastSavedValues(JSON.stringify(variables));
      
      // ✨ FIX: Update currentDraftId để tránh tạo draft mới liên tục
      if (!currentDraftId && data.productId) {
        setCurrentDraftId(data.productId);
        // Update URL without reload
        window.history.replaceState(
          null,
          "",
          `/printer/products/edit/${data.productId}`
        );
      }
      
      // Auto-hide "saved" sau 2s
      setTimeout(() => setDraftStatus("idle"), 2000);
    },
    onError: (error: any) => {
      setDraftStatus("error");
      console.error("[Draft] Save failed:", error);
      
      // ✨ FIX: Stop infinite loop on error
      // Nếu lỗi 409 (duplicate), không retry nữa
      if (error?.response?.status === 409) {
        toast.error("Lỗi lưu nháp: Tên sản phẩm đã tồn tại. Vui lòng đổi tên.");
        // Set status về idle để không retry
        setTimeout(() => setDraftStatus("idle"), 3000);
      }
    },
  });

  // ✨ Reset error status khi user thay đổi tên sản phẩm
  useEffect(() => {
    if (draftStatus === "error" && watchedName) {
      setDraftStatus("idle");
    }
  }, [watchedName]);

  // ✅ Auto-save khi user ngừng gõ 1s
  useEffect(() => {
    // ✨ CRITICAL FIX: Chỉ save khi có thay đổi thực sự
    const currentValuesStr = JSON.stringify(debouncedValues);
    const hasChanges = currentValuesStr !== lastSavedValues;
    
    // Debug log
    if (process.env.NODE_ENV === "development") {
      console.log("[Auto-save] Check:", {
        hasChanges,
        activeStep,
        hasAsset: !!selectedAsset,
        draftStatus,
        isPending: saveDraftMutation.isPending,
        willSave: debouncedValues && activeStep > 1 && selectedAsset && hasChanges && draftStatus !== "saving" && draftStatus !== "error" && !saveDraftMutation.isPending
      });
    }
    
    if (
      debouncedValues &&
      activeStep > 1 &&
      selectedAsset &&
      hasChanges && // ✨ CRITICAL: Chỉ save khi có thay đổi
      draftStatus !== "saving" && // ✨ Không save nếu đang saving
      draftStatus !== "error" && // ✨ Không save nếu có lỗi
      !saveDraftMutation.isPending // ✨ Không save nếu đang pending
    ) {
      console.log("[Auto-save] Triggering save...");
      // Chỉ auto-save từ bước 2 trở đi (sau khi chọn phôi)
      saveDraftMutation.mutate(debouncedValues);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [debouncedValues]);

  // ✅ Publish draft (submit final)
  const publishMutation = useMutation({
    mutationFn: async (data: ProductWizardFormValues) => {
      if (!selectedAsset) {
        throw new Error("Lỗi: Phôi chưa được chọn.");
      }

      // Build FormData
      const formData = new FormData();
      const { images, assetId, ...jsonData } = data;

      const finalProductData = {
        ...jsonData,
        assets: selectedAsset.assets,
      };

      formData.append("productData", JSON.stringify(finalProductData));

      // Append images (nếu có) - chỉ append File, không append URL object
      images.forEach((item) => {
        if (item instanceof File) {
          formData.append("images", item);
        }
        // Nếu là URL object, đã được upload async rồi, không cần append vào FormData
      });

      const headers = { "Content-Type": "multipart/form-data" };
      const config = { headers, timeout: 180000 };

      const apiCall = productId
        ? api.put(`/products/${productId}`, formData, config)
        : api.post("/products", formData, config);

      const response = await apiCall;
      return response.data;
    },
    onSuccess: () => {
      toast.success(
        productId
          ? "Cập nhật sản phẩm thành công!"
          : "Đăng bán sản phẩm thành công!"
      );

      // Invalidate cache
      queryClient.invalidateQueries({ queryKey: ["products", "all"] });
      queryClient.invalidateQueries({
        queryKey: ["printer-products", "my-products"],
      });

      if (productId) {
        queryClient.invalidateQueries({ queryKey: ["product", productId] });
      }

      if (onSuccess) {
        onSuccess();
      }

      // Redirect nếu tạo mới
      if (!productId) {
        navigate("/printer/dashboard?tab=products");
      }
    },
    onError: (err: any) => {
      toast.error(err.response?.data?.message || err.message || "Đã xảy ra lỗi");
    },
  });

  // Validate và chuyển bước
  const validateAndGoToStep = async (
    step: number,
    fieldsToValidate: (keyof ProductWizardFormValues)[]
  ) => {
    const isValid = await trigger(fieldsToValidate);
    if (isValid) {
      setActiveStep(step);
    } else {
      toast.error("Vui lòng điền đầy đủ thông tin bắt buộc ở bước này.");
    }
  };

  // Submit handler
  const onSubmit = async (data: ProductWizardFormValues) => {
    if (publishMutation.isPending) {
      toast.info("Đang xử lý, vui lòng chờ...");
      return;
    }
    if (!selectedAsset) {
      toast.error("Lỗi: Phôi chưa được chọn.");
      setActiveStep(1);
      return;
    }

    publishMutation.mutate(data);
  };

  // Error handler
  const onError = (errors: any) => {
    console.error("❌ Form validation errors:", errors);
    toast.error("Dữ liệu nhập chưa hợp lệ, vui lòng kiểm tra lại các bước.");
    if (errors.assetId) setActiveStep(1);
    else if (errors.name || errors.categoryDisplay) setActiveStep(2);
    else if (errors.images) setActiveStep(3);
    else if (errors.pricing) setActiveStep(4);
    else setActiveStep(1);
  };

  return {
    form,
    isLoading,
    isSubmitting: publishMutation.isPending,
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
    // ✨ NEW: Draft status
    draftStatus,
    saveDraft: saveDraftMutation.mutate,
  };
}

