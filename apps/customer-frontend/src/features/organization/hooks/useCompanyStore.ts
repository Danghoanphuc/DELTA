// src/features/organization/hooks/useCompanyStore.ts
// ✅ SOLID: Single Responsibility - Company store state management

import { useState, useEffect } from "react";
import { toast } from "sonner";
import {
  companyStoreService,
  CompanyStore,
  StoreProductData,
} from "@/features/company-store/services/company-store.service";

export function useCompanyStore() {
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [store, setStore] = useState<CompanyStore | null>(null);
  const [hasStore, setHasStore] = useState(false);

  useEffect(() => {
    loadStore();
  }, []);

  const loadStore = async () => {
    try {
      setLoading(true);
      const data = await companyStoreService.getMyStore();
      if (data) {
        setStore(data);
        setHasStore(true);
      }
    } catch {
      // No store yet
    } finally {
      setLoading(false);
    }
  };

  const createStore = async (name: string) => {
    const created = await companyStoreService.createStore({ name });
    setStore(created);
    setHasStore(true);
    toast.success("Đã tạo Company Store");
    return created;
  };

  const saveStore = async () => {
    if (!store) return;
    setSaving(true);
    try {
      await companyStoreService.updateStore({
        name: store.name,
        tagline: store.tagline,
        description: store.description,
        branding: store.branding,
        access: store.access,
        settings: store.settings,
      });
      toast.success("Đã lưu thay đổi");
    } catch (err: any) {
      toast.error(err.message || "Không thể lưu");
    } finally {
      setSaving(false);
    }
  };

  const publishStore = async () => {
    const updated = await companyStoreService.publishStore();
    setStore(updated);
    toast.success("Store đã được publish");
  };

  const unpublishStore = async () => {
    const updated = await companyStoreService.unpublishStore();
    setStore(updated);
    toast.success("Store đã tạm dừng");
  };

  const addProduct = async (product: StoreProductData) => {
    const updated = await companyStoreService.addProduct(product);
    setStore(updated);
    toast.success("Đã thêm sản phẩm");
    return updated;
  };

  const removeProduct = async (productId: string) => {
    const updated = await companyStoreService.removeProduct(productId);
    setStore(updated);
    toast.success("Đã xóa sản phẩm");
  };

  // Update helpers
  const updateStore = (updates: Partial<CompanyStore>) => {
    if (!store) return;
    setStore({ ...store, ...updates });
  };

  const updateBranding = (updates: Partial<CompanyStore["branding"]>) => {
    if (!store) return;
    setStore({ ...store, branding: { ...store.branding, ...updates } });
  };

  const updateSettings = (updates: Partial<CompanyStore["settings"]>) => {
    if (!store) return;
    setStore({ ...store, settings: { ...store.settings, ...updates } });
  };

  const updateAccess = (type: CompanyStore["access"]["type"]) => {
    if (!store) return;
    setStore({ ...store, access: { ...store.access, type } });
  };

  return {
    loading,
    saving,
    store,
    hasStore,
    createStore,
    saveStore,
    publishStore,
    unpublishStore,
    addProduct,
    removeProduct,
    updateStore,
    updateBranding,
    updateSettings,
    updateAccess,
  };
}
