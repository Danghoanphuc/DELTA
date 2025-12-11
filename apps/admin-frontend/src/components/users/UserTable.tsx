// src/components/users/UserTable.tsx
// ✅ SOLID: Single Responsibility - Display users table

import { type IUser } from "@printz/types";
import { StatusBadge } from "@/components/ui/StatusBadge";
import { UserCheck, UserX, Eye, MoreVertical, Truck } from "lucide-react";
import { useState } from "react";

interface UserTableProps {
  users: IUser[];
  isSuperAdmin: boolean;
  isProcessing: boolean;
  onBan: (user: IUser) => void;
  onUnban: (user: IUser) => void;
  onImpersonate: (user: IUser) => void;
  onToggleShipper: (user: IUser) => void;
}

export function UserTable({
  users,
  isSuperAdmin,
  isProcessing,
  onBan,
  onUnban,
  onImpersonate,
  onToggleShipper,
}: UserTableProps) {
  const [openMenuId, setOpenMenuId] = useState<string | null>(null);

  return (
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
          {users.map((user) => (
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
                    <div className="text-sm text-gray-500">{user.email}</div>
                  </div>
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <StatusBadge isActive={user.status === "active"} />
              </td>
              <td className="whitespace-nowrap px-6 py-4">
                <div className="flex flex-wrap gap-1">
                  {user.printerProfile && (
                    <span className="inline-flex rounded-full bg-purple-100 px-2 text-xs font-semibold leading-5 text-purple-800">
                      Printer
                    </span>
                  )}
                  {user.shipperProfileId && (
                    <span className="inline-flex rounded-full bg-blue-100 px-2 text-xs font-semibold leading-5 text-blue-800">
                      Shipper
                    </span>
                  )}
                  {!user.printerProfile && !user.shipperProfileId && (
                    <span className="inline-flex rounded-full bg-gray-100 px-2 text-xs font-semibold leading-5 text-gray-800">
                      Customer
                    </span>
                  )}
                </div>
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-sm text-gray-500">
                {new Date(user.createdAt).toLocaleDateString("vi-VN")}
              </td>
              <td className="whitespace-nowrap px-6 py-4 text-right text-sm font-medium">
                <div className="flex items-center justify-end gap-2">
                  {user.status === "active" ? (
                    <button
                      onClick={() => onBan(user)}
                      disabled={isProcessing}
                      className="text-red-600 hover:text-red-900 disabled:opacity-50"
                      title="Khóa tài khoản"
                    >
                      <UserX className="h-5 w-5" />
                    </button>
                  ) : (
                    <button
                      onClick={() => onUnban(user)}
                      disabled={isProcessing}
                      className="text-green-600 hover:text-green-900 disabled:opacity-50"
                      title="Mở khóa tài khoản"
                    >
                      <UserCheck className="h-5 w-5" />
                    </button>
                  )}
                  {isSuperAdmin && (
                    <button
                      onClick={() => onImpersonate(user)}
                      disabled={isProcessing}
                      className="text-blue-600 hover:text-blue-900 disabled:opacity-50"
                      title="Giả mạo đăng nhập"
                    >
                      <Eye className="h-5 w-5" />
                    </button>
                  )}

                  {/* More Menu */}
                  <div className="relative">
                    <button
                      onClick={() =>
                        setOpenMenuId(
                          openMenuId === user._id.toString()
                            ? null
                            : user._id.toString()
                        )
                      }
                      disabled={isProcessing}
                      className="text-gray-600 hover:text-gray-900 disabled:opacity-50"
                      title="Thêm hành động"
                    >
                      <MoreVertical className="h-5 w-5" />
                    </button>

                    {openMenuId === user._id.toString() && (
                      <div className="absolute right-0 z-10 mt-2 w-56 rounded-md bg-white shadow-lg ring-1 ring-black ring-opacity-5">
                        <div className="py-1">
                          <button
                            onClick={() => {
                              onToggleShipper(user);
                              setOpenMenuId(null);
                            }}
                            className="flex w-full items-center px-4 py-2 text-sm text-gray-700 hover:bg-gray-100"
                          >
                            <Truck className="mr-3 h-4 w-4" />
                            {user.shipperProfileId
                              ? "Xóa vai trò Shipper"
                              : "Đổi thành Shipper"}
                          </button>
                        </div>
                      </div>
                    )}
                  </div>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
