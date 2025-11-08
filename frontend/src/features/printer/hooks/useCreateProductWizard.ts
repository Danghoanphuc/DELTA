// src/features/printer/hooks/useCreateProductWizard.ts
// ✅ ĐÃ REFACTOR: Tách Schemas và Service (onSubmit)

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import api from "@/shared/lib/axios";
import { Asset } from "@/types/asset";

// ✅ IMPORT TỪ MODULES MỚI
import {
  productWizardSchema,
  ProductWizardFormValues,
} from "@/features/printer/schemas/productWizardSchema";
import { submitProductWizard } from "@/features/printer/services/productWizardService";

// --- Hook chính ---
export function useCreateProductWizard(
  productId?: string,
  onSuccess?: () => void
) {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);

  const [privateAssets, setPrivateAssets] = useState<Asset[]>([]);
  const [publicAssets, setPublicAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const form = useForm<ProductWizardFormValues>({
    resolver: zodResolver(productWizardSchema), // ✅ Dùng schema đã import
    defaultValues: {
      assetId: "",
      name: "",
      description: "",
      category: "other",
      images: [],
      pricing: [{ minQuantity: 100, pricePerUnit: 1000 }],
      isActive: true,
    },
  });

  // ... (Tất cả logic useEffect, handlers khác giữ nguyên) ...
  const { control, setValue, watch, trigger, getValues } = form;
  const watchedAssetId = watch("assetId");
  const watchedImages = watch("images");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "pricing",
  });

  // (useEffect loadInitialData giữ nguyên)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        const assetRes = await api.get("/assets/my-assets");
        setPrivateAssets(assetRes.data?.data?.privateAssets || []);
        setPublicAssets(assetRes.data?.data?.publicAssets || []);
        if (productId) {
          // ... (logic tải sản phẩm cũ giữ nguyên) ...
        }
      } catch (err) {
        toast.error("Không thể tải dữ liệu ban đầu");
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [productId, setValue]);

  // (useEffect theo dõi phôi giữ nguyên)
  useEffect(() => {
    const allAssets = [...privateAssets, ...publicAssets];
    const asset = allAssets.find((a) => a._id === watchedAssetId);
    if (asset) {
      setSelectedAsset(asset);
      if (!getValues("name")) {
        setValue("name", `In ${asset.name} theo yêu cầu`);
      }
      setValue("category", asset.category as any);
      if (activeStep === 1) {
        setActiveStep(2);
      }
    } else {
      setSelectedAsset(null);
    }
  }, [
    watchedAssetId,
    privateAssets,
    publicAssets,
    setValue,
    getValues,
    activeStep,
  ]);

  // (validateAndGoToStep giữ nguyên)
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

  /**
   * ✅ ONSUBMIT ĐÃ ĐƯỢC TINH GỌN
   * Chỉ còn gọi service
   */
  const onSubmit = async (data: ProductWizardFormValues) => {
    if (isSubmitting) {
      toast.info("Đang xử lý, vui lòng chờ...");
      return;
    }
    if (!selectedAsset) {
      toast.error("Lỗi: Phôi chưa được chọn.");
      setActiveStep(1);
      return;
    }

    setIsSubmitting(true);

    try {
      // ✅ Gọi service
      await submitProductWizard(data, selectedAsset, productId);

      if (onSuccess) {
        onSuccess();
      }
    } catch (err: any) {
      // Lỗi đã được service xử lý (toast), hook chỉ cần dừng submitting
      // Nếu lỗi là do phôi không hợp lệ, chuyển về bước 1
      if (err.message.includes("Phôi đã chọn không hợp lệ")) {
        setActiveStep(1);
      }
    } finally {
      setIsSubmitting(false);
    }
  };

  // (onError giữ nguyên)
  const onError = (errors: any) => {
    console.error("❌ Form validation errors:", errors);
    toast.error("Dữ liệu nhập chưa hợp lệ, vui lòng kiểm tra lại các bước.");
    if (errors.assetId) setActiveStep(1);
    else if (errors.name || errors.category) setActiveStep(2);
    else if (errors.images) setActiveStep(3);
    else if (errors.pricing) setActiveStep(4);
    else setActiveStep(1);
  };

  return {
    form,
    isLoading,
    isSubmitting,
    activeStep,
    setActiveStep,
    privateAssets,
    publicAssets,
    selectedAsset,
    watchedImages,
    pricingFields: fields,
    addPricingTier: append,
    removePricingTier: remove,
    validateAndGoToStep,
    onSubmit,
    onError,
  };
}
