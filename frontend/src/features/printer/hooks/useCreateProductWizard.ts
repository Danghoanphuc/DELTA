// src/features/printer/hooks/useCreateProductWizard.ts
// ✅ BÀN GIAO: Cập nhật để sử dụng useSubmitProduct (Bước 4)

import { useState, useEffect } from "react";
import { useForm, useFieldArray } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { toast } from "sonner";
import api from "@/shared/lib/axios";
import { Asset } from "@/types/asset";
import { getProductById } from "@/services/productService";

import {
  productWizardSchema,
  ProductWizardFormValues,
} from "@/features/printer/schemas/productWizardSchema";
// ✅ Import hook useMutation
import { useSubmitProduct } from "@/features/printer/services/productWizardService";

// --- Hook chính ---
export function useCreateProductWizard(
  productId?: string,
  onSuccess?: () => void
) {
  // ❌ Bỏ isSubmitting
  // const [isSubmitting, setIsSubmitting] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [activeStep, setActiveStep] = useState(1);

  const [privateAssets, setPrivateAssets] = useState<Asset[]>([]);
  const [publicAssets, setPublicAssets] = useState<Asset[]>([]);
  const [selectedAsset, setSelectedAsset] = useState<Asset | null>(null);

  const form = useForm<ProductWizardFormValues>({
    resolver: zodResolver(productWizardSchema),
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

  const { control, setValue, watch, trigger, getValues, reset } = form;
  const watchedAssetId = watch("assetId");
  const watchedImages = watch("images");

  const { fields, append, remove } = useFieldArray({
    control,
    name: "pricing",
  });

  // ✅ Sử dụng hook useSubmitProduct, lấy về `isPending`
  const { mutate, isPending: isSubmitting } = useSubmitProduct(productId);

  // (useEffect loadInitialData - đã vá lỗi ở bước trước - giữ nguyên)
  useEffect(() => {
    const loadInitialData = async () => {
      try {
        setIsLoading(true);
        if (!productId) {
          const assetRes = await api.get("/assets/my-assets");
          setPrivateAssets(assetRes.data?.data?.privateAssets || []);
          setPublicAssets(assetRes.data?.data?.publicAssets || []);
          setActiveStep(1);
        } else {
          const product = await getProductById(productId);
          const assetId = (product as any).assetId || "unknown";
          reset({
            assetId: assetId,
            name: product.name,
            description: product.description || "",
            category: product.category,
            images: [],
            pricing: product.pricing,
            isActive: product.isActive,
          });
          setSelectedAsset({
            _id: assetId,
            name: product.name,
            category: product.category,
            assets: {
              modelUrl: product.assets.modelUrl ?? '',
              surfaces: product.assets.surfaces,
            },
            images: [],
          });
          setActiveStep(2);
        }
      } catch (err) {
        toast.error("Không thể tải dữ liệu ban đầu");
      } finally {
        setIsLoading(false);
      }
    };
    loadInitialData();
  }, [productId, reset]);

  // (useEffect theo dõi phôi - giữ nguyên)
  useEffect(() => {
    if (!productId) {
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

  // (validateAndGoToStep - giữ nguyên)
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
   * ✅ ONSUBMIT ĐÃ ĐƯỢC THAY THẾ
   * Ngắn gọn, sạch sẽ. Chỉ gọi 'mutate'.
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

    // setIsSubmitting(true); // ❌ Bỏ: useMutation đã quản lý

    // ❌ Bỏ: try...catch...finally

    // ✅ Gọi mutate, truyền callback onSuccess
    mutate(
      { data, selectedAsset, productId },
      {
        onSuccess: () => {
          if (onSuccess) {
            onSuccess(); // (Gọi hàm onSuccess từ props - thường là closeForm)
          }
        },
        onError: (err: any) => {
          if (err.message.includes("Phôi đã chọn không hợp lệ")) {
            setActiveStep(1);
          }
        },
      }
    );
  };

  // (onError - giữ nguyên)
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
    isSubmitting, // ✅ Vẫn là isSubmitting, nhưng giờ lấy từ isPending
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
