// src/features/editor/services/editorService.ts
import api from "@/shared/lib/axios";
import { Product } from "@/types/product";
import { CartItem } from "@/types/cart"; // Giả sử bạn có type này

// Kiểu dữ liệu trả về từ API (giả định)
type ProductResponse = {
  data: {
    product: Product;
  };
};

type SaveDesignResponse = {
  data: {
    design: {
      _id: string;
    };
  };
};

/**
 * Lấy chi tiết sản phẩm bằng ID
 */
export const getProductById = async (productId: string): Promise<Product> => {
  const res = await api.get<ProductResponse>(`/products/${productId}`);
  const product = res.data?.data?.product;
  if (!product || !product.assets?.surfaces?.length) {
    throw new Error("Sản phẩm này không hỗ trợ chỉnh sửa (thiếu 'surfaces').");
  }
  return product;
};

/**
 * Lưu thiết kế tùy chỉnh
 */
export const saveCustomDesign = async (
  baseProductId: string,
  editorData: Record<string, any>,
  finalPreviewImageUrl?: string
): Promise<string> => {
  const res = await api.post<SaveDesignResponse>("/designs/customized", {
    baseProductId,
    editorData,
    finalPreviewImageUrl,
  });
  const newDesignId = res.data?.data?.design?._id;
  if (!newDesignId) {
    throw new Error("Không nhận được ID thiết kế đã lưu");
  }
  return newDesignId;
};

// Bạn cũng có thể thêm logic `addToCart` vào đây nếu nó là một lệnh gọi API
// thay vì chỉ cập nhật state (như trong useCartStore)
