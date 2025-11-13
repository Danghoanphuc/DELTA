// apps/admin-frontend/src/pages/UserListPage.tsx
import { useState } from "react";
import {
  useQuery,
  useMutation,
  useQueryClient,
  keepPreviousData, // <-- SỬA LỖI API v5
} from "@tanstack/react-query";
import {
  getListUsers,
  updateUserStatus,
  impersonateUser,
  type IGetUserParams,
} from "@/services/admin.user.service";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import { type IUser } from "@printz/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { Pagination } from "@/components/ui/Pagination";
import { Users, Search, UserCheck, UserX, Eye, RefreshCw } from "lucide-react";

const CUSTOMER_APP_URL = "http://localhost:5173";

export const UserListPage = () => {
  const queryClient = useQueryClient();
  const [params, setParams] = useState<IGetUserParams>({
    page: 1,
    limit: 10,
    status: "all",
    search: "",
  });
  const [searchInput, setSearchInput] = useState("");

  const currentAdminRole = useAdminAuthStore((state) => state.admin?.role);
  const isSuperAdmin = currentAdminRole === "superadmin";

  // === QUERIES (Lấy dữ liệu) ===
  const { data, isLoading, isError, error, isRefetching } = useQuery({
    queryKey: ["users", params],
    queryFn: () => getListUsers(params),
    placeholderData: keepPreviousData, // <-- SỬA LỖI API v5
  });

  // === MUTATIONS (Hành động) ===
  const updateStatusMutation = useMutation({
    mutationFn: ({
      userId,
      status,
    }: {
      userId: string;
      status: "active" | "banned";
    }) => updateUserStatus(userId, status),
    onSuccess: (updatedUser, variables) => {
      alert(`Đã cập nhật ${updatedUser.email} thành ${variables.status}`);
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: Error) => {
      alert(`Lỗi: ${err.message}`);
    },
  });

  const impersonateMutation = useMutation({
    mutationFn: impersonateUser,
    onSuccess: (data, userId) => {
      alert(`Đang đăng nhập với tư cách user ID: ${userId}`);
      const impersonateUrl = `${CUSTOMER_APP_URL}/auth/impersonate-callback?token=${data.accessToken}`;
      window.open(impersonateUrl, "_blank");
    },
    onError: (err: Error) => {
      alert(`Lỗi: ${err.message}`);
    },
  });

  // === HANDLERS (Xử lý sự kiện) ===
  const handlePageChange = (page: number) => {
    setParams((p) => ({ ...p, page }));
  };

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    setParams((p) => ({ ...p, search: searchInput, page: 1 }));
  };

  const handleStatusChange = (e: React.ChangeEvent<HTMLSelectElement>) => {
    setParams((p) => ({
      ...p,
      status: e.target.value as "all" | "active" | "banned",
      page: 1,
    }));
  };

  const handleBan = (user: IUser) => {
    if (!window.confirm(`Bạn có chắc muốn KHÓA (Ban) tài khoản ${user.email}?`))
      return;
    // Sửa lỗi ObjectId
    updateStatusMutation.mutate({
      userId: user._id.toString(),
      status: "banned",
    });
  };

  const handleUnban = (user: IUser) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn KÍCH HOẠT (Unban) tài khoản ${user.email}?`
      )
    )
      return;
    // Sửa lỗi ObjectId
    updateStatusMutation.mutate({
      userId: user._id.toString(),
      status: "active",
    });
  };

  const handleImpersonate = (user: IUser) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn GIẢ MẠO ĐĂNG NHẬP vào tài khoản ${user.email}?
Hành động này sẽ được ghi lại (Audit Log).`
      )
    )
      return;
    // Sửa lỗi ObjectId
    impersonateMutation.mutate(user._id.toString());
  };

  return (
    <div className="mx-auto max-w-7xl space-y-6 p-6">
      {/* 1. Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <Users className="h-8 w-8 text-gray-800" />
          <h1 className="text-3xl font-bold text-gray-900">Quản lý User</h1>
        </div>
        <button
          onClick={() => queryClient.invalidateQueries({ queryKey: ["users"] })}
          disabled={isRefetching}
          className="flex items-center rounded-md border border-gray-300 bg-white px-3 py-2 text-sm font-medium text-gray-700 hover:bg-gray-50 disabled:opacity-50"
        >
          <RefreshCw
            className={`mr-2 h-4 w-4 ${isRefetching ? "animate-spin" : ""}`}
          />
          Tải lại
        </button>
      </div>

      {/* 2. Filter & Search Bar */}
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

      {/* 3. Table Content Area */}
      <div className="overflow-hidden rounded-lg bg-white shadow">
        {isLoading && <div className="p-4 text-center">Đang tải user...</div>}
        {isError && (
          <div className="p-4 text-center text-red-600">
            Lỗi: {(error as Error).message}
          </div>
        )}
        {data && (
          <>
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      User
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Trạng thái
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Vai trò
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-left text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Ngày tham gia
                    </th>
                    <th
                      scope="col"
                      className="px-6 py-3 text-right text-xs font-medium uppercase tracking-wider text-gray-500"
                    >
                      Hành động
                    </th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-gray-200 bg-white">
                  {(data.data as IUser[]).map((user) => (
                    <tr key={user._id.toString()}>
                      <td className="whitespace-nowrap px-6 py-4">
                        <div className="flex items-center">
                          <div className="h-10 w-10 flex-shrink-0">
                            <img
                              className="h-10 w-10 rounded-full"
                              src={
                                user.avatarUrl ||
                                `https://ui-avatars.com/api/?name=${user.displayName}&background=random`
                              }
                              alt=""
                            />
                          </div>
                          <div className="ml-4">
                            <div className="text-sm font-medium text-gray-900">
                              {user.displayName}
                            </div>
                            <div className="text-sm text-gray-500">
                              {user.email}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td className="whitespace-nowrap px-6 py-4">
                        {/* Sửa lỗi logic: Dùng 'status' thay vì 'isActive' */}
                        <StatusBadge isActive={user.status === "active"} />
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {/* Sửa lỗi logic: Dùng 'printerProfile' */}
                        {user.printerProfile ? "Printer" : "Customer"}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                        {new Date(user.createdAt).toLocaleDateString("vi-VN")}
                      </td>
                      <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                        {/* Sửa lỗi logic: Dùng 'status' */}
                        {user.status === "active" ? (
                          <button
                            onClick={() => handleBan(user)}
                            disabled={updateStatusMutation.isPending} // Sửa lỗi API v5
                            className="text-red-600 hover:text-red-900"
                            title="Khóa tài khoản"
                          >
                            <UserX className="h-5 w-5" />
                          </button>
                        ) : (
                          <button
                            onClick={() => handleUnban(user)}
                            disabled={updateStatusMutation.isPending} // Sửa lỗi API v5
                            className="text-green-600 hover:text-green-900"
                            title="Mở khóa tài khoản"
                          >
                            <UserCheck className="h-5 w-5" />
                          </button>
                        )}
                        {isSuperAdmin && (
                          <button
                            onClick={() => handleImpersonate(user)}
                            disabled={impersonateMutation.isPending} // Sửa lỗi API v5
                            className="ml-4 text-blue-600 hover:text-blue-900"
                            title="Giả mạo đăng nhập"
                          >
                            <Eye className="h-5 w-5" />
                          </button>
                        )}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
            {/* 4. Pagination */}
            {data.totalPages > 1 && (
              <div className="border-t border-gray-200 bg-white px-4 py-3">
                <Pagination
                  currentPage={data.page}
                  totalPages={data.totalPages}
                  onPageChange={handlePageChange}
                />
              </div>
            )}
          </>
        )}
      </div>
    </div>
  );
};

export default UserListPage;
