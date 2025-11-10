// src/services/productService.ts
// ✅ BÀN GIAO: Sửa lỗi 404 endpoint và chuyển sang FormData

import api from "@/shared/lib/axios";
import { PrinterProduct, Product } from "@/types/product";

// Kiểu dữ liệu trả về từ API (giả định)
type MyProductsResponse = {
  data: {
    products: PrinterProduct[];
  };
};

type ProductResponse = {
  data: {
    product: PrinterProduct;
  };
};

type GetProductResponse = {
  data: {
    product: Product; // Dùng kiểu 'Product' chi tiết
  };
};

/**
 * Lấy chi tiết sản phẩm bằng ID (dùng cho cả editor và admin)
 */
export const getProductById = async (productId: string): Promise<Product> => {
  const res = await api.get<GetProductResponse>(`/products/${productId}`);
  const product = res.data?.data?.product;
  if (!product) {
    throw new Error("Không tìm thấy sản phẩm.");
  }
  return product;
};

/**
 * Lấy danh sách sản phẩm của nhà in
 */
export const getMyProducts = async (): Promise<PrinterProduct[]> => {
  // ✅ SỬA LỖI 404: Endpoint đúng là /products/my-products
  const res = await api.get<MyProductsResponse>("/products/my-products");
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
 * (Giữ nguyên logic FormData)
 */
export const updateProduct = async (
  productId: string,
  data: FormData
): Promise<PrinterProduct> => {
  const res = await api.put<ProductResponse>(`/products/${productId}`, data, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.data?.product;
};

/**
 * Tạo một sản phẩm (phôi) mới
 * (Giữ nguyên logic FormData)
 */
export const createNewProduct = async (
  productData: FormData
): Promise<PrinterProduct> => {
  const res = await api.post<ProductResponse>("/products", productData, {
    headers: { "Content-Type": "multipart/form-data" },
  });
  return res.data?.data?.product;
};
