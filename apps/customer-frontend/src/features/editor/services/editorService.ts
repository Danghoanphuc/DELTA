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

// ✅ THÊM: Lưu draft design (auto-save)
export const saveDraftDesign = async (
  baseProductId: string,
  editorData: Record<string, any>
): Promise<string | null> => {
  try {
    const res = await api.post<SaveDesignResponse>("/designs/customized/draft", {
      baseProductId,
      editorData,
    });
    return res.data?.data?.design?._id || null;
  } catch (error: any) {
    console.error("Lỗi khi lưu draft:", error);
    // Không throw error để không làm gián đoạn user experience
    return null;
  }
};

// ✅ THÊM: Load draft design
export const getDraftDesign = async (
  productId: string
): Promise<{ editorData: any } | null> => {
  try {
    const res = await api.get<{
      data: { design: { editorData: any } | null };
    }>(`/designs/customized/draft?productId=${productId}`);
    return res.data?.data?.design || null;
  } catch (error: any) {
    // Không có draft hoặc lỗi → trả về null
    return null;
  }
};

// ✅ THÊM: Get customized design by ID
export const getCustomizedDesignById = async (
  designId: string
): Promise<{
  editorData: any;
  baseProductId?: string;
  status?: string;
}> => {
  const res = await api.get<{
    data: {
      design: {
        editorData: any;
        baseProductId?: string;
        status?: string;
      };
    };
  }>(`/designs/customized/${designId}`);
  return res.data?.data?.design;
};
