// apps/admin-frontend/src/hooks/useCategories.ts
// ✅ SOLID: Single Responsibility - State management only

import { useState, useEffect, useCallback } from "react";
import { categoryApi, Category } from "@/services/catalog.service";

export function useCategories() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [flatCategories, setFlatCategories] = useState<Category[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [expandedIds, setExpandedIds] = useState<Set<string>>(new Set());

  const fetchCategories = useCallback(async () => {
    setIsLoading(true);
    try {
      const [tree, flat] = await Promise.all([
        categoryApi.getAll(false),
        categoryApi.getAll(true),
      ]);
      setCategories(tree);
      setFlatCategories(flat);
    } catch (error) {
      console.error("Error fetching categories:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  useEffect(() => {
    fetchCategories();
  }, [fetchCategories]);

  const toggleExpand = (id: string) => {
    setExpandedIds((prev) => {
      const next = new Set(prev);
      if (next.has(id)) next.delete(id);
      else next.add(id);
      return next;
    });
  };

  const createCategory = async (data: Partial<Category>) => {
    try {
      console.log("[useCategories] Creating category with data:", data);
      await categoryApi.create(data);
      await fetchCategories();
    } catch (error: any) {
      console.error("[useCategories] Error creating category:", error);
      const errorMessage =
        error.response?.data?.message ||
        error.response?.data?.error ||
        "Không thể tạo danh mục";
      alert(errorMessage);
      throw error;
    }
  };

  const updateCategory = async (id: string, data: Partial<Category>) => {
    await categoryApi.update(id, data);
    fetchCategories();
  };

  const deleteCategory = async (id: string) => {
    await categoryApi.delete(id);
    fetchCategories();
  };

  return {
    categories,
    flatCategories,
    isLoading,
    expandedIds,
    toggleExpand,
    fetchCategories,
    createCategory,
    updateCategory,
    deleteCategory,
  };
}
