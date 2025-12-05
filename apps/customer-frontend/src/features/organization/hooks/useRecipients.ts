// src/features/organization/hooks/useRecipients.ts
// ✅ SOLID: Single Responsibility - State management & business logic

import { useState, useEffect, useCallback } from "react";
import { toast } from "@/shared/utils/toast";
import {
  recipientService,
  Recipient,
  FilterOptions,
  RecipientFormData,
  PaginationData,
} from "../services/recipient.service";

export function useRecipients() {
  const [recipients, setRecipients] = useState<Recipient[]>([]);
  const [pagination, setPagination] = useState<PaginationData>({
    page: 1,
    total: 0,
    totalPages: 1,
  });
  const [filterOptions, setFilterOptions] = useState<FilterOptions | null>(
    null
  );
  const [isLoading, setIsLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedIds, setSelectedIds] = useState<string[]>([]);

  const fetchRecipients = useCallback(async (page = 1, search = "") => {
    setIsLoading(true);
    try {
      const data = await recipientService.getRecipients(page, search);
      setRecipients(data.recipients);
      setPagination(data.pagination);
    } catch (error) {
      console.error("Error fetching recipients:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  const fetchFilterOptions = useCallback(async () => {
    try {
      const data = await recipientService.getFilterOptions();
      setFilterOptions(data);
    } catch (error) {
      console.error("Error fetching filters:", error);
    }
  }, []);

  // Initial fetch
  useEffect(() => {
    fetchRecipients();
    fetchFilterOptions();
  }, [fetchRecipients, fetchFilterOptions]);

  // Search debounce
  useEffect(() => {
    const timer = setTimeout(() => {
      fetchRecipients(1, searchTerm);
    }, 300);
    return () => clearTimeout(timer);
  }, [searchTerm, fetchRecipients]);

  const addRecipient = async (data: RecipientFormData) => {
    await recipientService.createRecipient(data);
    toast.success("Đã thêm người nhận!");
    fetchRecipients();
    fetchFilterOptions();
  };

  const deleteRecipient = async (id: string) => {
    await recipientService.deleteRecipient(id);
    toast.success("Đã xóa!");
    fetchRecipients();
    fetchFilterOptions();
  };

  const bulkDelete = async () => {
    if (selectedIds.length === 0) return;
    await recipientService.bulkArchive(selectedIds);
    toast.success(`Đã xóa ${selectedIds.length} người nhận!`);
    setSelectedIds([]);
    fetchRecipients();
    fetchFilterOptions();
  };

  const importCSV = async (file: File) => {
    const result = await recipientService.importCSV(file);
    toast.success(`Đã import ${result.imported} người nhận!`);
    if (result.skipped > 0) {
      toast.info(`${result.skipped} email đã tồn tại, bỏ qua`);
    }
    fetchRecipients();
    fetchFilterOptions();
    return result;
  };

  const downloadTemplate = async () => {
    try {
      await recipientService.downloadTemplate();
    } catch {
      toast.error("Không thể tải template");
    }
  };

  // Selection helpers
  const toggleSelect = (id: string) => {
    setSelectedIds((prev) =>
      prev.includes(id) ? prev.filter((i) => i !== id) : [...prev, id]
    );
  };

  const toggleSelectAll = () => {
    if (selectedIds.length === recipients.length) {
      setSelectedIds([]);
    } else {
      setSelectedIds(recipients.map((r) => r._id));
    }
  };

  const goToPage = (page: number) => {
    fetchRecipients(page, searchTerm);
  };

  return {
    recipients,
    pagination,
    filterOptions,
    isLoading,
    searchTerm,
    setSearchTerm,
    selectedIds,
    toggleSelect,
    toggleSelectAll,
    addRecipient,
    deleteRecipient,
    bulkDelete,
    importCSV,
    downloadTemplate,
    goToPage,
  };
}
