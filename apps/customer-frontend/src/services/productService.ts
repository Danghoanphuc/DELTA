// src/services/productService.ts
// ✅ Updated to use CatalogProduct from admin-backend

import api from "@/shared/lib/axios";
import { Product } from "@/types/product";
import {
  CatalogProduct,
  catalogProductToProduct,
} from "@/types/catalog-product";

type GetProductResponse = {
  success: boolean;
  data: {
    product: CatalogProduct;
  };
};

/**
 * Lấy chi tiết sản phẩm bằng ID hoặc slug (dùng cho shop)
 * ✅ Uses CatalogProduct from admin-backend public API
 */
export const getProductById = async (productId: string): Promise<Product> => {
  const res = await api.get<GetProductResponse>(`/products/${productId}`);
  const catalogProduct = res.data?.data?.product;
  if (!catalogProduct) {
    throw new Error("Không tìm thấy sản phẩm.");
  }
  // Convert CatalogProduct to Product format
  return catalogProductToProduct(catalogProduct);
};

// ✅ REMOVED: Printer product functions (getMyProducts, deleteProduct, updateProduct, createNewProduct)
// These were for printer dashboard which is no longer used.
// Products are now managed via admin-backend CatalogProduct.
