// apps/customer-frontend/src/features/social/components/ConnectionButton.tsx
// ✅ FIXED: Handle 409 Conflict Gracefully & Optimistic UI

import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  declineConnectionRequest,
  removeConnection,
  getConnectionStatus,
} from "../../../services/api/connection.api.service";
import { useConnectionStore } from "../../../stores/useConnectionStore";
import { toast } from "@/shared/utils/toast";
import { UserPlus, UserCheck, UserMinus, Clock, Loader2 } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog";

interface ConnectionButtonProps {
  userId: string;
  userName?: string;
  className?: string;
}

export const ConnectionButton: React.FC<ConnectionButtonProps> = ({
  userId,
  userName = "người dùng",
  className = "",
}) => {
  const queryClient = useQueryClient();
  const confirmDialog = useConfirmDialog();

  // Check connection status
  const { data: statusData, isLoading } = useQuery({
    queryKey: ["connectionStatus", userId],
    queryFn: () => getConnectionStatus(userId),
    // Refetch aggressive để tránh sai state
    staleTime: 0,
  });

  const connection = statusData?.data?.connection;
  const status = statusData?.data?.status || "none";
  const isSender = statusData?.data?.isSender;

  // Helper refresh UI
  const refreshUI = () => {
    queryClient.invalidateQueries({ queryKey: ["connectionStatus", userId] });
    queryClient.invalidateQueries({ queryKey: ["sentRequests"] });
    queryClient.invalidateQueries({ queryKey: ["friends"] });
    queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
  };

  // 1. Send Request
  const sendRequestMutation = useMutation({
    mutationFn: () => sendConnectionRequest(userId),
    onSuccess: () => {
      toast.success(`Đã gửi lời mời đến ${userName}`);
      refreshUI();
    },
    onError: (error: any) => {
      // ✅ FIX QUAN TRỌNG: Nếu lỗi 409 (đã gửi rồi) -> Coi như thành công & Refresh
      if (error?.response?.status === 409) {
        refreshUI();
        toast.info("Đã cập nhật trạng thái kết nối");
      } else {
        toast.error(error.response?.data?.message || "Không thể gửi lời mời");
      }
    },
  });

  // 2. Accept Request
  const acceptRequestMutation = useMutation({
    mutationFn: () => acceptConnectionRequest(connection?._id!),
    onSuccess: () => {
      toast.success(`Đã kết bạn với ${userName}`);
      refreshUI();
    },
    onError: (e: any) => toast.error("Lỗi chấp nhận kết bạn"),
  });

  // 3. Remove / Cancel
  const removeConnectionMutation = useMutation({
    mutationFn: () => removeConnection(connection?._id!),
    onSuccess: () => {
      refreshUI();
      toast.success("Đã cập nhật mối quan hệ");
    },
    onError: (e: any) => toast.error("Không thể thực hiện"),
  });

  // 4. Decline
  const declineRequestMutation = useMutation({
    mutationFn: () => declineConnectionRequest(connection?._id!),
    onSuccess: () => {
      refreshUI();
      toast.success("Đã từ chối");
    },
  });

  if (isLoading) {
    return (
      <Button
        disabled
        variant="ghost"
        size="sm"
        className={cn("w-24", className)}
      >
        <Loader2 className="w-4 h-4 animate-spin" />
      </Button>
    );
  }

  // CASE: Bạn bè
  if (status === "accepted") {
    return (
      <div className="flex gap-2">
        <Button
          variant="outline"
          size="sm"
          className="text-green-600 border-green-200 bg-green-50 hover:bg-green-100 hover:text-green-700 cursor-default"
        >
          <UserCheck size={16} className="mr-1" /> Bạn bè
        </Button>
        <Button
          variant="ghost"
          size="sm"
          onClick={() => {
            confirmDialog.confirm(
              {
                title: "Hủy kết bạn?",
                description: `Bạn có chắc muốn hủy kết bạn với ${userName}? Cuộc trò chuyện giữa hai bạn cũng sẽ bị xóa.`,
                confirmText: "Hủy kết bạn",
                cancelText: "Giữ lại",
                variant: "danger",
              },
              () => removeConnectionMutation.mutate()
            );
          }}
          disabled={removeConnectionMutation.isPending}
          className="text-red-500 hover:text-red-600 hover:bg-red-50"
          title="Hủy kết bạn"
        >
          <UserMinus size={16} />
        </Button>
      </div>
    );
  }

  // CASE: Đang chờ (Pending)
  if (status === "pending") {
    // Nếu mình là người gửi -> Hiển thị "Đã gửi" + Nút hủy
    if (isSender) {
      return (
        <div className="flex gap-2">
          <Button
            disabled
            variant="secondary"
            size="sm"
            className="text-gray-500"
          >
            <Clock size={16} className="mr-1" /> Đã gửi
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={() => removeConnectionMutation.mutate()}
            disabled={removeConnectionMutation.isPending}
            className="text-red-500 hover:text-red-600 hover:bg-red-50 px-2"
            title="Thu hồi lời mời"
          >
            Thu hồi
          </Button>
        </div>
      );
    }

    // Nếu người kia gửi -> Hiển thị Chấp nhận / Từ chối
    return (
      <div className="flex gap-2">
        <Button
          size="sm"
          onClick={() => acceptRequestMutation.mutate()}
          disabled={acceptRequestMutation.isPending}
          className="bg-blue-600 hover:bg-blue-700 text-white"
        >
          {acceptRequestMutation.isPending ? (
            <Loader2 className="animate-spin w-4 h-4" />
          ) : (
            "Chấp nhận"
          )}
        </Button>
        <Button
          variant="outline"
          size="sm"
          onClick={() => declineRequestMutation.mutate()}
          disabled={declineRequestMutation.isPending}
        >
          Từ chối
        </Button>
      </div>
    );
  }

  // CASE: Mặc định (Chưa kết bạn) -> Nút Kết bạn
  return (
    <>
      <Button
        size="sm"
        onClick={() => sendRequestMutation.mutate()}
        disabled={sendRequestMutation.isPending}
        className={cn("bg-blue-600 hover:bg-blue-700 text-white", className)}
      >
        {sendRequestMutation.isPending ? (
          <Loader2 className="w-4 h-4 animate-spin mr-1" />
        ) : (
          <UserPlus size={16} className="mr-1" />
        )}
        Kết bạn
      </Button>
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.handleClose}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.options.title}
        description={confirmDialog.options.description}
        confirmText={confirmDialog.options.confirmText}
        cancelText={confirmDialog.options.cancelText}
        variant={confirmDialog.options.variant}
        isLoading={removeConnectionMutation.isPending}
      />
    </>
  );
};
