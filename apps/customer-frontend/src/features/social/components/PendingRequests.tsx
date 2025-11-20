// apps/customer-frontend/src/features/social/components/PendingRequests.tsx
// ✅ SOCIAL: Display pending connection requests (received)

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPendingRequests,
  acceptConnectionRequest,
  declineConnectionRequest,
} from "../../../services/api/connection.api.service";
import { useConnectionStore } from "../../../stores/useConnectionStore";
import { useEffect } from "react";
import { toast } from "sonner";

export const PendingRequests: React.FC = () => {
  const queryClient = useQueryClient();
  const { pendingRequests, setPendingRequests } = useConnectionStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["pendingRequests"],
    queryFn: getPendingRequests,
  });

  useEffect(() => {
    if (data?.data?.connections) {
      setPendingRequests(data.data.connections);
    }
  }, [data, setPendingRequests]);

  const acceptMutation = useMutation({
    mutationFn: (connectionId: string) => acceptConnectionRequest(connectionId),
    onSuccess: () => {
      toast.success("Đã chấp nhận lời mời kết bạn");
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Không thể chấp nhận");
    },
  });

  const declineMutation = useMutation({
    mutationFn: (connectionId: string) =>
      declineConnectionRequest(connectionId),
    onSuccess: () => {
      toast.success("Đã từ chối lời mời");
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
    },
    onError: (error: any) => {
      toast.error(error.response?.data?.message || "Không thể từ chối");
    },
  });

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-gray-600">Đang tải...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        Không thể tải lời mời kết bạn
      </div>
    );
  }

  if (!pendingRequests || pendingRequests.length === 0) {
    return (
      <div className="p-6 text-center text-gray-500">
        <svg
          className="w-16 h-16 mx-auto mb-4 text-gray-300"
          fill="none"
          stroke="currentColor"
          viewBox="0 0 24 24"
        >
          <path
            strokeLinecap="round"
            strokeLinejoin="round"
            strokeWidth={2}
            d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z"
          />
        </svg>
        <p className="text-lg font-medium">Không có lời mời nào</p>
        <p className="text-sm mt-1">Bạn không có lời mời kết bạn nào</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {pendingRequests.map((request) => {
        const requester = request.requester;

        return (
          <div
            key={request._id}
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-green-400 to-blue-500 flex items-center justify-center text-white font-bold">
                {requester.avatarUrl ? (
                  <img
                    src={requester.avatarUrl}
                    alt={requester.displayName || requester.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xl">
                    {(requester.displayName || requester.username)[0].toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {requester.displayName || requester.username}
                </h3>
                <p className="text-sm text-gray-500">@{requester.username}</p>
                <p className="text-xs text-gray-400 mt-1">
                  Đã gửi lời mời kết bạn
                </p>
              </div>
            </div>
            <div className="flex gap-2">
              <button
                onClick={() => acceptMutation.mutate(request._id)}
                disabled={acceptMutation.isPending}
                className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition disabled:opacity-50"
              >
                {acceptMutation.isPending ? "..." : "Chấp nhận"}
              </button>
              <button
                onClick={() => declineMutation.mutate(request._id)}
                disabled={declineMutation.isPending}
                className="px-4 py-2 bg-gray-200 text-gray-700 rounded-lg hover:bg-gray-300 transition disabled:opacity-50"
              >
                {declineMutation.isPending ? "..." : "Từ chối"}
              </button>
            </div>
          </div>
        );
      })}
    </div>
  );
};

