// src/features/printer/services/productWizardService.ts
import api from "@/shared/lib/axios";
import { ProductWizardFormValues } from "@/features/printer/schemas/productWizardSchema";
import { Asset } from "@/types/asset";
import { toast } from "sonner";

export const submitProductWizard = async (
  data: ProductWizardFormValues,
  selectedAsset: Asset,
  productId?: string
) => {
  if (!selectedAsset || selectedAsset._id !== data.assetId) {
    // Ném lỗi để hook bắt được
    throw new Error("Lỗi: Phôi đã chọn không hợp lệ. Vui lòng chọn lại.");
  }

  const formData = new FormData();
  const { images, assetId, ...jsonData } = data;

  const finalProductData = {
    ...jsonData,
    assets: selectedAsset.assets, // Gắn cấu trúc assets của phôi vào sản phẩm
  };

  formData.append("productData", JSON.stringify(finalProductData));

  images.forEach((file) => {
    formData.append("images", file);
  });

  const headers = { "Content-Type": "multipart/form-data" };
  const toastId = toast.loading(
    productId ? "Đang cập nhật sản phẩm..." : "Đang đăng bán sản phẩm..."
  );

  try {
    const apiCall = productId
      ? api.put(`/products/${productId}`, formData, { headers })
      : api.post("/products", formData, { headers });

    const response = await apiCall;

    toast.success(
      productId
        ? "Cập nhật sản phẩm thành công!"
        : "Đăng bán sản phẩm thành công!",
      { id: toastId }
    );

    return response.data; // Trả về data nếu hook cần
  } catch (err: any) {
    // Ném lỗi để hook bắt và xử lý (vd: setIsSubmitting(false))
    toast.error(err.response?.data?.message || "Đã xảy ra lỗi", {
      id: toastId,
    });
    throw err;
  }
};
