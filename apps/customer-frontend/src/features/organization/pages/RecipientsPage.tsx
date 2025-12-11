// src/features/organization/pages/RecipientsPage.tsx
// ✅ SOLID Refactored - Compose components only

import { useState } from "react";
import { Upload, Plus, Search, Trash2 } from "lucide-react";
import { Card, CardContent } from "@/shared/components/ui/card";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { toast } from "@/shared/utils/toast";

import { useRecipients } from "../hooks/useRecipients";
import {
  RecipientTable,
  RecipientFormModal,
  ImportCSVModal,
  RecipientStats,
} from "../components/recipients";

export function RecipientsPage() {
  const {
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
  } = useRecipients();

  const [showAddModal, setShowAddModal] = useState(false);
  const [showImportModal, setShowImportModal] = useState(false);

  const handleDelete = async (id: string) => {
    if (!confirm("Bạn có chắc muốn xóa người nhận này?")) return;
    try {
      await deleteRecipient(id);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleBulkDelete = async () => {
    if (!confirm(`Bạn có chắc muốn xóa ${selectedIds.length} người nhận?`))
      return;
    try {
      await bulkDelete();
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
    }
  };

  const handleAddRecipient = async (data: any) => {
    try {
      await addRecipient(data);
      setShowAddModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Có lỗi xảy ra");
      throw error;
    }
  };

  const handleImport = async (file: File) => {
    try {
      await importCSV(file);
      setShowImportModal(false);
    } catch (error: any) {
      toast.error(error.response?.data?.message || "Import thất bại");
      throw error;
    }
  };

  return (
    <div className="flex-1 overflow-auto bg-[#FAFAF8]">
      <div className="p-8 max-w-7xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-8">
          <div>
            <h1 className="text-2xl font-serif font-bold text-[#1C1917] mb-2">
              Người nhận
            </h1>
            <p className="text-[#57534E]">
              Quản lý danh sách người nhận quà tặng
              {filterOptions && ` • ${filterOptions.totalCount} người`}
            </p>
          </div>
          <div className="flex gap-3">
            <Button variant="outline" onClick={() => setShowImportModal(true)}>
              <Upload className="w-4 h-4 mr-2" />
              Import CSV
            </Button>
            <Button
              className="bg-[#C63321] hover:bg-[#A82A1A]"
              onClick={() => setShowAddModal(true)}
            >
              <Plus className="w-4 h-4 mr-2" />
              Thêm người nhận
            </Button>
          </div>
        </div>

        {/* Stats */}
        <RecipientStats
          filterOptions={filterOptions}
          selectedCount={selectedIds.length}
        />

        {/* Filters & Actions */}
        <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2] mb-6">
          <CardContent className="p-4">
            <div className="flex gap-4 items-center">
              <div className="flex-1 relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-[#A8A29E]" />
                <Input
                  placeholder="Tìm theo tên hoặc email..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
              {selectedIds.length > 0 && (
                <Button variant="destructive" onClick={handleBulkDelete}>
                  <Trash2 className="w-4 h-4 mr-2" />
                  Xóa ({selectedIds.length})
                </Button>
              )}
            </div>
          </CardContent>
        </Card>

        {/* Recipients Table */}
        <Card className="border-2 border-[#E5E3DC] shadow-[0_2px_8px_rgba(28,25,23,0.04)] bg-[#F7F6F2]">
          <CardContent className="p-0">
            <RecipientTable
              recipients={recipients}
              isLoading={isLoading}
              selectedIds={selectedIds}
              onToggleSelect={toggleSelect}
              onToggleSelectAll={toggleSelectAll}
              onDelete={handleDelete}
              onShowEmpty={() => (
                <>
                  <Button
                    variant="outline"
                    onClick={() => setShowImportModal(true)}
                  >
                    <Upload className="w-4 h-4 mr-2" />
                    Import CSV
                  </Button>
                  <Button
                    className="bg-[#C63321] hover:bg-[#A82A1A]"
                    onClick={() => setShowAddModal(true)}
                  >
                    <Plus className="w-4 h-4 mr-2" />
                    Thêm thủ công
                  </Button>
                </>
              )}
            />
          </CardContent>
        </Card>

        {/* Pagination */}
        {pagination.totalPages > 1 && (
          <div className="flex justify-center gap-2 mt-6">
            {Array.from({ length: pagination.totalPages }, (_, i) => (
              <Button
                key={i}
                variant={pagination.page === i + 1 ? "default" : "outline"}
                size="sm"
                onClick={() => goToPage(i + 1)}
              >
                {i + 1}
              </Button>
            ))}
          </div>
        )}
      </div>

      {/* Modals */}
      <RecipientFormModal
        open={showAddModal}
        onOpenChange={setShowAddModal}
        onSubmit={handleAddRecipient}
      />

      <ImportCSVModal
        open={showImportModal}
        onOpenChange={setShowImportModal}
        onImport={handleImport}
        onDownloadTemplate={downloadTemplate}
      />
    </div>
  );
}

export default RecipientsPage;
