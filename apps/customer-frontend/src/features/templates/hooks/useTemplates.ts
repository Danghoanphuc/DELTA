// apps/customer-frontend/src/features/templates/hooks/useTemplates.ts
// ✅ PHASE 9.2: Template Hooks - State management for templates

import { useState, useCallback } from "react";
import { toast } from "sonner";
import {
  templateService,
  ProductTemplate,
  LoadTemplateResult,
  SubstituteProduct,
  CreateTemplateData,
} from "../services/template.service";

/**
 * Hook for managing templates
 */
export function useTemplates() {
  const [templates, setTemplates] = useState<ProductTemplate[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Fetch templates list
   */
  const fetchTemplates = useCallback(
    async (filters?: {
      type?: string;
      isPublic?: boolean;
      isActive?: boolean;
    }) => {
      setIsLoading(true);
      setError(null);
      try {
        const data = await templateService.getTemplates(filters);
        setTemplates(data);
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Không thể tải danh sách template";
        setError(message);
        toast.error(message);
        console.error("Error fetching templates:", err);
      } finally {
        setIsLoading(false);
      }
    },
    []
  );

  /**
   * Create template from order
   */
  const createFromOrder = useCallback(
    async (orderId: string, data: CreateTemplateData) => {
      try {
        const template = await templateService.createFromOrder(orderId, data);
        toast.success("Đã tạo template thành công!");
        return template;
      } catch (err: any) {
        const message = err.response?.data?.message || "Không thể tạo template";
        toast.error(message);
        throw err;
      }
    },
    []
  );

  /**
   * Update template
   */
  const updateTemplate = useCallback(
    async (templateId: string, data: Partial<CreateTemplateData>) => {
      try {
        const template = await templateService.updateTemplate(templateId, data);
        toast.success("Đã cập nhật template thành công!");
        return template;
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Không thể cập nhật template";
        toast.error(message);
        throw err;
      }
    },
    []
  );

  /**
   * Delete template
   */
  const deleteTemplate = useCallback(async (templateId: string) => {
    try {
      await templateService.deleteTemplate(templateId);
      toast.success("Đã xóa template thành công!");
    } catch (err: any) {
      const message = err.response?.data?.message || "Không thể xóa template";
      toast.error(message);
      throw err;
    }
  }, []);

  return {
    templates,
    isLoading,
    error,
    fetchTemplates,
    createFromOrder,
    updateTemplate,
    deleteTemplate,
  };
}

/**
 * Hook for template reorder flow
 */
export function useTemplateReorder() {
  const [templateData, setTemplateData] = useState<LoadTemplateResult | null>(
    null
  );
  const [substitutes, setSubstitutes] = useState<
    Record<string, SubstituteProduct[]>
  >({});
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  /**
   * Load template for reorder
   */
  const loadTemplate = useCallback(async (templateId: string) => {
    setIsLoading(true);
    setError(null);
    try {
      const data = await templateService.loadForReorder(templateId);
      setTemplateData(data);

      // If there are unavailable products, fetch substitutes
      if (!data.availability.allAvailable) {
        const substitutePromises = data.availability.unavailableProducts.map(
          async (unavailable) => {
            const subs = await templateService.getSuggestedSubstitutes(
              templateId,
              unavailable.productId
            );
            return { productId: unavailable.productId, substitutes: subs };
          }
        );

        const results = await Promise.all(substitutePromises);
        const subsMap: Record<string, SubstituteProduct[]> = {};
        results.forEach((result) => {
          subsMap[result.productId] = result.substitutes;
        });
        setSubstitutes(subsMap);
      }

      return data;
    } catch (err: any) {
      const message = err.response?.data?.message || "Không thể tải template";
      setError(message);
      toast.error(message);
      console.error("Error loading template:", err);
      throw err;
    } finally {
      setIsLoading(false);
    }
  }, []);

  /**
   * Update substitutes for a product
   */
  const updateSubstitutes = useCallback(
    async (
      templateId: string,
      productId: string,
      substituteProductIds: string[]
    ) => {
      try {
        await templateService.updateSubstitutes(
          templateId,
          productId,
          substituteProductIds
        );
        toast.success("Đã cập nhật sản phẩm thay thế!");
      } catch (err: any) {
        const message =
          err.response?.data?.message || "Không thể cập nhật sản phẩm thay thế";
        toast.error(message);
        throw err;
      }
    },
    []
  );

  return {
    templateData,
    substitutes,
    isLoading,
    error,
    loadTemplate,
    updateSubstitutes,
  };
}
