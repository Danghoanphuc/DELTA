// features/products/hooks/useProductCustomization.ts
/**
 * Hook for managing product customization state and API calls
 * Phase 3.3
 */

import { useState, useEffect, useCallback } from "react";
import { productCustomizationService } from "../services/product-customization.service";
import {
  CustomizationOptions,
  PriceBreakdown,
} from "../types/customization.types";

export function useProductCustomization(productId: string) {
  const [variants, setVariants] = useState<any[]>([]);
  const [printMethods, setPrintMethods] = useState<any[]>([]);
  const [priceBreakdown, setPriceBreakdown] = useState<PriceBreakdown | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(false);
  const [isCalculating, setIsCalculating] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Fetch product variants
  const fetchVariants = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await productCustomizationService.getProductVariants(
        productId
      );
      setVariants(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải variants");
      console.error("Error fetching variants:", err);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  // Fetch print methods
  const fetchPrintMethods = useCallback(async () => {
    try {
      setIsLoading(true);
      const data = await productCustomizationService.getPrintMethods(productId);
      setPrintMethods(data);
    } catch (err: any) {
      setError(err.message || "Không thể tải print methods");
      console.error("Error fetching print methods:", err);
    } finally {
      setIsLoading(false);
    }
  }, [productId]);

  // Calculate price
  const calculatePrice = useCallback(
    async (variantId: string, quantity: number, customization?: any) => {
      try {
        setIsCalculating(true);
        const breakdown = await productCustomizationService.calculatePrice(
          productId,
          {
            variantId,
            quantity,
            customization,
          }
        );
        setPriceBreakdown(breakdown);
        return breakdown;
      } catch (err: any) {
        setError(err.message || "Không thể tính giá");
        console.error("Error calculating price:", err);
        return null;
      } finally {
        setIsCalculating(false);
      }
    },
    [productId]
  );

  // Load initial data
  useEffect(() => {
    fetchVariants();
    fetchPrintMethods();
  }, [fetchVariants, fetchPrintMethods]);

  return {
    variants,
    printMethods,
    priceBreakdown,
    isLoading,
    isCalculating,
    error,
    calculatePrice,
    refetch: () => {
      fetchVariants();
      fetchPrintMethods();
    },
  };
}
