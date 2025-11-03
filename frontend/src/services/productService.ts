// src/services/productService.ts
import api from "@/shared/lib/axios";
import { PrinterProduct } from "@/types/product";

// Kiểu dữ liệu trả về từ API (giả định)
type MyProductsResponse = {
  data: {
    products: PrinterProduct[];
  };
};

/**
 * Lấy danh sách sản phẩm của nhà in
 */
export const getMyProducts = async (): Promise<PrinterProduct[]> => {
  const res = await api.get<MyProductsResponse>("/products/my-products");
  // Cung cấp fallback an toàn
  return res.data?.data?.products || [];
};

/**
 * Xóa một sản phẩm
 */
export const deleteProduct = async (productId: string): Promise<void> => {
  await api.delete(`/products/${productId}`);
};

/**
 * Cập nhật một sản phẩm
 */
export const updateProduct = async (
  productId: string,
  data: Partial<PrinterProduct>
): Promise<PrinterProduct> => {
  const res = await api.put(`/products/${productId}`, data);
  return res.data?.data?.product;
};

// Bạn có thể thêm createProduct, v.v. ở đây
