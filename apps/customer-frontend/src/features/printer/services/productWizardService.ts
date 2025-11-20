// src/features/printer/services/productWizardService.ts
// ✅ BÀN GIAO: Refactor sang useMutation (Bước 4)

import api from "@/shared/lib/axios";
import { ProductWizardFormValues } from "@/features/printer/schemas/productWizardSchema";
import { Asset } from "@/types/asset";
import { toast } from "sonner";
import { useMutation, useQueryClient } from "@tanstack/react-query"; // ✅ Import

// ✅ Tách riêng hàm gọi API
const submitProductApi = async ({
  data,
  selectedAsset,
  productId,
}: {
  data: ProductWizardFormValues;
  selectedAsset: Asset;
  productId?: string;
}) => {
  if (!selectedAsset || selectedAsset._id !== data.assetId) {
    throw new Error("Lỗi: Phôi đã chọn không hợp lệ. Vui lòng chọn lại.");
  }

  // (Logic FormData giữ nguyên)
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
  
  // ✅ Tăng timeout lên 3 phút cho upload ảnh (vì Cloudinary có thể chậm)
  const config = {
    headers,
    timeout: 180000, // 3 minutes = 180,000ms
  };
  
  const apiCall = productId
    ? api.put(`/products/${productId}`, formData, config)
    : api.post("/products", formData, config);

  const response = await apiCall;
  return response.data;
};

/**
 * ✅ Hook (thay thế hàm cũ) để Tạo/Cập nhật sản phẩm
 * Tự động xử lý cache invalidation.
 */
export const useSubmitProduct = (productId?: string) => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: submitProductApi,
    onSuccess: () => {
      toast.success(
        productId
          ? "Cập nhật sản phẩm thành công!"
          : "Đăng bán sản phẩm thành công!"
      );

      // ✅✅✅ TỰ ĐỘNG XÓA CACHE (INVALIDATION) ✅✅✅

      // 1. Xóa cache 'products:all' (của useShop)
      queryClient.invalidateQueries({ queryKey: ["products", "all"] });

      // 2. Xóa cache 'printer-products:my-products' (của useProductManagement)
      queryClient.invalidateQueries({
        queryKey: ["printer-products", "my-products"],
      });

      // 3. Nếu là sửa, xóa cache chi tiết 'product:id' (của useProductDetail)
      if (productId) {
        queryClient.invalidateQueries({ queryKey: ["product", productId] });
      }
    },
    onError: (err: any) => {
      // (useMutation tự xử lý, hook chỉ cần toast)
      toast.error(
        err.response?.data?.message || err.message || "Đã xảy ra lỗi"
      );
    },
  });
};
