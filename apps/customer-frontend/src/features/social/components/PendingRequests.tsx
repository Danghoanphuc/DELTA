// apps/customer-frontend/src/features/social/components/PendingRequests.tsx
// ✅ FIXED: Mapping Data Key (requests vs connections)

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPendingRequests,
  acceptConnectionRequest,
  declineConnectionRequest,
} from "../../../services/api/connection.api.service";
import { useConnectionStore } from "../../../stores/useConnectionStore";
import { useEffect } from "react";
import { toast } from "@/shared/utils/toast";
import { Loader2, UserCheck, UserX } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export const PendingRequests: React.FC = () => {
  const queryClient = useQueryClient();
  const { setPendingRequests } = useConnectionStore();

  // Fetch dữ liệu
  const { data, isLoading, error } = useQuery({
    queryKey: ["pendingRequests"],
    queryFn: getPendingRequests,
    // Refetch mỗi 5s để đảm bảo user thấy lời mời nhanh nhất
    refetchInterval: 5000,
  });

  useEffect(() => {
    // ✅ FIX: Hỗ trợ cả 2 cấu trúc dữ liệu (requests hoặc connections)
    const list = data?.data?.requests || data?.data?.connections || [];
    if (list) {
      setPendingRequests(list);
    }
  }, [data, setPendingRequests]);

  // Mutations
  const acceptMutation = useMutation({
    mutationFn: (connectionId: string) => acceptConnectionRequest(connectionId),
    onSuccess: (res) => {
      toast.success("Đã chấp nhận kết bạn");
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["connectionStatus"] });
      // Nếu server trả về conversationId, có thể redirect chat ở đây nếu muốn
    },
    onError: (err: any) => toast.error("Lỗi khi chấp nhận"),
  });

  const declineMutation = useMutation({
    mutationFn: (connectionId: string) =>
      declineConnectionRequest(connectionId),
    onSuccess: () => {
      toast.success("Đã từ chối");
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
    },
  });

  if (isLoading) {
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return <div className="p-6 text-center text-red-500">Lỗi tải dữ liệu</div>;
  }

  // ✅ FIX: Lấy list chuẩn xác
  const requests = data?.data?.requests || data?.data?.connections || [];

  // ✅ FIX 1: Logic lọc an toàn hơn - chỉ lọc bỏ nếu requester hoàn toàn null/undefined
  const validRequests = requests.filter((req: any) => {
    return !!req.requester;
  });

  if (validRequests.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500 flex flex-col items-center">
        <div className="w-12 h-12 bg-gray-100 rounded-full flex items-center justify-center mb-3">
          <UserCheck className="text-gray-400" />
        </div>
        <p>Không có lời mời kết bạn nào</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {validRequests.map((request: any) => {
        // ✅ FIX 2: Fallback an toàn khi lấy thông tin requester
        const requester = request.requester || {};
        const displayName = requester.displayName || requester.username || "Người dùng ẩn danh";
        const avatarUrl = requester.avatarUrl;
        const username = requester.username || "unknown";
        const initial = displayName[0]?.toUpperCase() || "?";

        return (
          <div
            key={request._id}
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition animate-in fade-in"
          >
            <div className="flex items-center gap-3 flex-1 min-w-0">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-500 to-indigo-600 flex items-center justify-center text-white font-bold shadow-sm">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span>{initial}</span>
                )}
              </div>
              <div className="truncate">
                <h4 className="font-semibold text-sm text-gray-900 truncate">
                  {displayName}
                </h4>
                <p className="text-xs text-gray-500 truncate">@{username}</p>
                {/* Debug info: in case _id is missing */}
                {!requester._id && (
                  <p className="text-[10px] text-red-400">Data error: Missing ID</p>
                )}
              </div>
            </div>

            <div className="flex gap-2 flex-shrink-0">
              <Button
                size="sm"
                onClick={() => acceptMutation.mutate(request._id)}
                disabled={acceptMutation.isPending}
                className="bg-blue-600 hover:bg-blue-700 text-white h-8 px-3"
              >
                {acceptMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  "Chấp nhận"
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => declineMutation.mutate(request._id)}
                disabled={declineMutation.isPending}
                className="h-8 px-3 text-gray-600"
              >
                <UserX className="w-4 h-4" />
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
