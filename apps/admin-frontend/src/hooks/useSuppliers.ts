// apps/admin-frontend/src/hooks/useSuppliers.ts
// ✅ SOLID: Single Responsibility - State management only

import { useState, useEffect, useCallback } from "react";
import { supplierApi, Supplier } from "@/services/catalog.service";

export function useSuppliers(typeFilter: string = "all") {
  const [suppliers, setSuppliers] = useState<Supplier[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const fetchSuppliers = useCallback(async () => {
    setIsLoading(true);
    try {
      const data = await supplierApi.getAll({
        type: typeFilter !== "all" ? typeFilter : undefined,
      });
      setSuppliers(data);
    } catch (error) {
      console.error("Error fetching suppliers:", error);
    } finally {
      setIsLoading(false);
    }
  }, [typeFilter]);

  useEffect(() => {
    fetchSuppliers();
  }, [fetchSuppliers]);

  const createSupplier = async (data: Partial<Supplier>) => {
    await supplierApi.create(data);
    fetchSuppliers();
  };

  const updateSupplier = async (id: string, data: Partial<Supplier>) => {
    await supplierApi.update(id, data);
    fetchSuppliers();
  };

  const deleteSupplier = async (id: string) => {
    await supplierApi.delete(id);
    fetchSuppliers();
  };

  return {
    suppliers,
    isLoading,
    fetchSuppliers,
    createSupplier,
    updateSupplier,
    deleteSupplier,
  };
}
