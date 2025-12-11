// apps/admin-frontend/src/pages/UserListPage.tsx
// ✅ SOLID Refactored: UI composition only

import { Users, Search, RefreshCw } from "lucide-react";
import { useUsers } from "@/hooks/useUsers";
import { UserTable } from "@/components/users/UserTable";
import { Pagination } from "@/components/ui/Pagination";
import { ToggleShipperDialog } from "@/components/users/ToggleShipperDialog";

export const UserListPage = () => {
  const {
    users,
    pagination,
    isLoading,
    isError,
    error,
    isRefetching,
    isProcessing,
    isSuperAdmin,
    params,
    searchInput,
    setSearchInput,
    handlePageChange,
    handleSearchSubmit,
    handleStatusChange,
    banUser,
    unbanUser,
    impersonate,
    openShipperDialog,
    closeShipperDialog,
    confirmToggleShipper,
    shipperDialogUser,
    refreshUsers,
  } = useUsers();

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-gray-800" />
          <h1 className="text-3xl font-bold text-gray-900">Quản lý User</h1>
        </div>
        <button
          onClick={refreshUsers}
          disabled={isRefetching}
          className="flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
          />
          Tải lại
        </button>
      </div>

      {/* Filter & Search Bar */}
      <div className="grid grid-cols-1 gap-4 md:grid-cols-3">
        <form onSubmit={handleSearchSubmit} className="md:col-span-2">
          <label htmlFor="search" className="sr-only">
            Tìm kiếm
          </label>
          <div className="relative rounded-md shadow-sm">
            <div className="pointer-events-none absolute inset-y-0 left-0 flex items-center pl-3">
              <Search className="h-5 w-5 text-gray-400" />
            </div>
            <input
              type="search"
              id="search"
              value={searchInput}
              onChange={(e) => setSearchInput(e.target.value)}
              className="block w-full rounded-md border-gray-300 pl-10 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
              placeholder="Tìm email hoặc tên user..."
            />
          </div>
        </form>
        <div>
          <label htmlFor="status" className="sr-only">
            Lọc theo trạng thái
          </label>
          <select
            id="status"
            value={params.status}
            onChange={handleStatusChange}
            className="block w-full rounded-md border-gray-300 shadow-sm focus:border-blue-500 focus:ring-blue-500 sm:text-sm"
          >
            <option value="all">Tất cả trạng thái</option>
            <option value="active">Đang hoạt động (Active)</option>
            <option value="banned">Đã khóa (Banned)</option>
          </select>
        </div>
      </div>

      {/* Table Content Area */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        {isLoading && <div className="p-4 text-center">Đang tải user...</div>}
        {isError && (
          <div className="p-4 text-center text-red-600">
            Lỗi: {(error as Error).message}
          </div>
        )}
        {!isLoading && !isError && users.length > 0 && (
          <>
            <UserTable
              users={users}
              isSuperAdmin={isSuperAdmin}
              isProcessing={isProcessing}
              onBan={banUser}
              onUnban={unbanUser}
              onImpersonate={impersonate}
              onToggleShipper={openShipperDialog}
            />
            {pagination.totalPages > 1 && (
              <div className="border-t border-gray-200 bg-white px-4 py-3">
                <Pagination
                  currentPage={pagination.page}
                  totalPages={pagination.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>

      {/* Toggle Shipper Dialog */}
      {shipperDialogUser && (
        <ToggleShipperDialog
          user={shipperDialogUser}
          isOpen={!!shipperDialogUser}
          onClose={closeShipperDialog}
          onConfirm={confirmToggleShipper}
          isProcessing={isProcessing}
        />
      )}
    </div>
  );
};

export default UserListPage;
