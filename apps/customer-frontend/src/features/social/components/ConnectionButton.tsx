// apps/customer-frontend/src/features/social/components/ConnectionButton.tsx
// ✅ SOCIAL: Smart button for connection actions

import { useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  sendConnectionRequest,
  acceptConnectionRequest,
  declineConnectionRequest,
  removeConnection,
  getConnectionStatus,
} from "../../../services/api/connection.api.service";
import { useConnectionStore } from "../../../stores/useConnectionStore";
import { toast } from "sonner";

interface ConnectionButtonProps {
  userId: string;
  userName?: string;
  className?: string;
}

export const ConnectionButton: React.FC<ConnectionButtonProps> = ({
  userId,
  userName = "người dùng này",
  className = "",
}) => {
  const queryClient = useQueryClient();
  const { isFriend, hasPendingRequest, hasSentRequest } = useConnectionStore();
  
  // Check connection status
  const { data: statusData, isLoading } = useQuery({
    queryKey: ["connectionStatus", userId],
    queryFn: () => getConnectionStatus(userId),
  });

  const connection = statusData?.data?.connection;
  const status = connection?.status;

  // Mutations
  const sendRequestMutation = useMutation({
    mutationFn: () => sendConnectionRequest(userId),
    onSuccess: () => {
      toast.success(`Đã gửi lời mời kết bạn đến ${userName}`);
      queryClient.invalidateQueries({ queryKey: ["connectionStatus", userId] });
      queryClient.invalidateQueries({ queryKey: ["sentRequests"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Không thể gửi lời mời");
    },
  });

  const acceptRequestMutation = useMutation({
    mutationFn: () => acceptConnectionRequest(connection?._id!),
    onSuccess: () => {
      toast.success(`Đã chấp nhận lời mời kết bạn từ ${userName}`);
      queryClient.invalidateQueries({ queryKey: ["connectionStatus", userId] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Không thể chấp nhận");
    },
  });

  const declineRequestMutation = useMutation({
    mutationFn: () => declineConnectionRequest(connection?._id!),
    onSuccess: () => {
      toast.success("Đã từ chối lời mời");
      queryClient.invalidateQueries({ queryKey: ["connectionStatus", userId] });
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Không thể từ chối");
    },
  });

  const removeConnectionMutation = useMutation({
    mutationFn: () => removeConnection(connection?._id!),
    onSuccess: () => {
      // Check if it was a friend or just a sent request
      const wasFriend = status === "accepted";
      const wasSentRequest = status === "pending" && connection?.recipient?._id === userId;
      
      if (wasSentRequest) {
        toast.success("Đã thu hồi lời mời");
        queryClient.invalidateQueries({ queryKey: ["sentRequests"] });
      } else if (wasFriend) {
        toast.success("Đã hủy kết bạn");
        queryClient.invalidateQueries({ queryKey: ["friends"] });
      }
      
      queryClient.invalidateQueries({ queryKey: ["connectionStatus", userId] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Không thể thực hiện");
    },
  });

  if (isLoading) {
    return (
      <button
        disabled
        className={`px-4 py-2 rounded-lg bg-gray-200 text-gray-500 ${className}`}
      >
        Đang tải...
      </button>
    );
  }

  // Status: Already friends
  if (status === "accepted") {
    return (
      <div className={`flex gap-2 ${className}`}>
        <button className="px-4 py-2 rounded-lg bg-green-100 text-green-700 font-medium">
          ✓ Bạn bè
        </button>
        <button
          onClick={() => removeConnectionMutation.mutate()}
          disabled={removeConnectionMutation.isPending}
          className="px-4 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition"
        >
          {removeConnectionMutation.isPending ? "..." : "Hủy kết bạn"}
        </button>
      </div>
    );
  }

  // Status: Pending - Need to check who is the requester
  if (status === "pending") {
    // If the OTHER user (userId) is the requester, current user received the request → Show Accept/Decline
    const isReceivedRequest = connection?.requester?._id === userId;
    // If the OTHER user (userId) is the recipient, current user sent the request → Show "Sent"
    const isSentRequest = connection?.recipient?._id === userId;

    if (isReceivedRequest) {
      // Current user received request from userId
      return (
        <div className={`flex gap-2 ${className}`}>
          <button
            onClick={() => acceptRequestMutation.mutate()}
            disabled={acceptRequestMutation.isPending}
            className="px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition"
          >
            {acceptRequestMutation.isPending ? "..." : "Chấp nhận"}
          </button>
          <button
            onClick={() => declineRequestMutation.mutate()}
            disabled={declineRequestMutation.isPending}
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-700 hover:bg-gray-300 transition"
          >
            {declineRequestMutation.isPending ? "..." : "Từ chối"}
          </button>
        </div>
      );
    }

    if (isSentRequest) {
      // Current user sent request to userId
      return (
        <div className={`flex gap-2 ${className}`}>
          <button
            disabled
            className="px-4 py-2 rounded-lg bg-gray-200 text-gray-600"
          >
            Đã gửi lời mời
          </button>
          <button
            onClick={() => removeConnectionMutation.mutate()}
            disabled={removeConnectionMutation.isPending}
            className="px-3 py-2 rounded-lg bg-red-50 text-red-600 hover:bg-red-100 transition text-sm"
            title="Thu hồi lời mời"
          >
            {removeConnectionMutation.isPending ? "..." : "Thu hồi"}
          </button>
        </div>
      );
    }
  }

  // Status: Declined
  if (status === "declined") {
    return (
      <button
        disabled
        className={`px-4 py-2 rounded-lg bg-gray-200 text-gray-500 ${className}`}
      >
        Đã từ chối
      </button>
    );
  }

  // Status: Blocked
  if (status === "blocked") {
    return (
      <button
        disabled
        className={`px-4 py-2 rounded-lg bg-red-200 text-red-700 ${className}`}
      >
        Đã chặn
      </button>
    );
  }

  // Default: No connection
  return (
    <button
      onClick={() => sendRequestMutation.mutate()}
      disabled={sendRequestMutation.isPending}
      className={`px-4 py-2 rounded-lg bg-blue-600 text-white hover:bg-blue-700 transition disabled:opacity-50 ${className}`}
    >
      {sendRequestMutation.isPending ? "Đang gửi..." : "Kết bạn"}
    </button>
  );
};

