// src/hooks/useUsers.ts
// ✅ SOLID: Single Responsibility - State management cho Users

import { useState } from "react";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getListUsers,
  updateUserStatus,
  impersonateUser,
  toggleShipperRole,
  type IGetUserParams,
} from "@/services/admin.user.service";
import { useAdminAuthStore } from "@/store/useAdminAuthStore";
import { type IUser } from "@printz/types";
import { useToast } from "./use-toast";

const CUSTOMER_APP_URL = "http://localhost:5173";

export function useUsers() {
  const { toast } = useToast();
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

  // Fetch users
  const { data, isLoading, isError, error, isRefetching } = useQuery({
    queryKey: ["users", params],
    queryFn: () => getListUsers(params),
  });

  // Update user status mutation
  const updateStatusMutation = useMutation({
    mutationFn: ({
      userId,
      status,
    }: {
      userId: string;
      status: "active" | "banned";
    }) => updateUserStatus(userId, status),
    onSuccess: (updatedUser, variables) => {
      toast({
        title: "Thành công",
        description: `Đã cập nhật ${updatedUser.email} thành ${variables.status}`,
      });
      queryClient.invalidateQueries({ queryKey: ["users"] });
    },
    onError: (err: Error) => {
      toast({
        title: "Lỗi",
        description: `Lỗi: ${err.message}`,
        variant: "destructive",
      });
    },
  });

  // Impersonate user mutation
  const impersonateMutation = useMutation({
    mutationFn: impersonateUser,
    onSuccess: (data, userId) => {
      toast({
        title: "Thành công",
        description: `Đang đăng nhập với tư cách user ID: ${userId}`,
      });
      const impersonateUrl = `${CUSTOMER_APP_URL}/auth/impersonate-callback?token=${data.accessToken}`;
      window.open(impersonateUrl, "_blank");
    },
    onError: (err: Error) => {
      toast({
        title: "Lỗi",
        description: `Lỗi: ${err.message}`,
        variant: "destructive",
      });
    },
  });

  // Toggle shipper role mutation
  const toggleShipperMutation = useMutation({
    mutationFn: (userId: string) => toggleShipperRole(userId),
    onSuccess: async (data) => {
      toast({
        title: "Thành công",
        description: data.message,
      });

      // Force refetch to bypass cache
      await queryClient.refetchQueries({
        queryKey: ["users"],
        type: "active",
      });
    },
    onError: (err: Error) => {
      toast({
        title: "Lỗi",
        description: `Lỗi: ${err.message}`,
        variant: "destructive",
      });
    },
  });

  // Handlers
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

  const banUser = (user: IUser) => {
    if (!window.confirm(`Bạn có chắc muốn KHÓA (Ban) tài khoản ${user.email}?`))
      return;
    updateStatusMutation.mutate({
      userId: user._id.toString(),
      status: "banned",
    });
  };

  const unbanUser = (user: IUser) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn KÍCH HOẠT (Unban) tài khoản ${user.email}?`
      )
    )
      return;
    updateStatusMutation.mutate({
      userId: user._id.toString(),
      status: "active",
    });
  };

  const impersonate = (user: IUser) => {
    if (
      !window.confirm(
        `Bạn có chắc muốn GIẢ MẠO ĐĂNG NHẬP vào tài khoản ${user.email}?\nHành động này sẽ được ghi lại (Audit Log).`
      )
    )
      return;
    impersonateMutation.mutate(user._id.toString());
  };

  const [shipperDialogUser, setShipperDialogUser] = useState<IUser | null>(
    null
  );

  const openShipperDialog = (user: IUser) => {
    setShipperDialogUser(user);
  };

  const closeShipperDialog = () => {
    setShipperDialogUser(null);
  };

  const confirmToggleShipper = () => {
    if (!shipperDialogUser) return;

    toggleShipperMutation.mutate(shipperDialogUser._id.toString(), {
      onSuccess: () => {
        closeShipperDialog();
      },
    });
  };

  const refreshUsers = () => {
    queryClient.invalidateQueries({ queryKey: ["users"] });
  };

  return {
    users: (data?.data as IUser[]) || [],
    pagination: {
      page: data?.page || 1,
      totalPages: data?.totalPages || 1,
    },
    isLoading,
    isError,
    error,
    isRefetching,
    isProcessing:
      updateStatusMutation.isPending ||
      impersonateMutation.isPending ||
      toggleShipperMutation.isPending,
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
  };
}
