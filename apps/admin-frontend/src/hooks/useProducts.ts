// apps/admin-frontend/src/hooks/useProducts.ts
// ✅ SOLID: Single Responsibility - State management only

import { useState, useEffect, useCallback } from "react";
import {
  productApi,
  categoryApi,
  Product,
  Category,
} from "@/services/catalog.service";

interface UseProductsParams {
  categoryFilter?: string;
  statusFilter?: string;
  search?: string;
  page?: number;
}

export function useProducts(params: UseProductsParams = {}) {
  const [products, setProducts] = useState<Product[]>([]);
  const [categories, setCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [pagination, setPagination] = useState({
    page: 1,
    totalPages: 1,
  });

  const fetchProducts = useCallback(async () => {
    setIsLoading(true);
    try {
      const [productData, categoryData] = await Promise.all([
        productApi.getAll({
          categoryId:
            params.categoryFilter !== "all" ? params.categoryFilter : undefined,
          status:
            params.statusFilter !== "all" ? params.statusFilter : undefined,
          search: params.search || undefined,
          page: params.page || 1,
          limit: 20,
        }),
        categoryApi.getAll(true),
      ]);

      setProducts(productData.products);
      setPagination({
        page: productData.pagination.page,
        totalPages: productData.pagination.totalPages,
      });
      setCategories(categoryData);
    } catch (error) {
      console.error("Error fetching products:", error);
    } finally {
      setIsLoading(false);
    }
  }, [params.categoryFilter, params.statusFilter, params.search, params.page]);

  useEffect(() => {
    fetchProducts();
  }, [fetchProducts]);

  const duplicateProduct = async (id: string) => {
    await productApi.duplicate(id);
    fetchProducts();
  };

  const deleteProduct = async (id: string) => {
    await productApi.delete(id);
    fetchProducts();
  };

  return {
    products,
    categories,
    isLoading,
    pagination,
    fetchProducts,
    duplicateProduct,
    deleteProduct,
  };
}
