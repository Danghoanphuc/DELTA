import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getPendingRequests,
  acceptConnectionRequest,
  declineConnectionRequest,
} from "../../../services/api/connection.api.service";
import { useConnectionStore } from "../../../stores/useConnectionStore";
import { useEffect } from "react";
import { toast } from "@/shared/utils/toast";
import { Loader2, UserCheck, X, Check } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { createPeerConversation } from "../../chat/services/chat.api.service";

export const PendingRequests: React.FC = () => {
  const queryClient = useQueryClient();
  const { setPendingRequests } = useConnectionStore();

  const { data, isLoading, error } = useQuery({
    queryKey: ["pendingRequests"],
    queryFn: getPendingRequests,
    refetchInterval: 10000,
  });

  useEffect(() => {
    const list = data?.data?.requests || data?.data?.connections || [];
    if (list) setPendingRequests(list);
  }, [data, setPendingRequests]);

  const acceptMutation = useMutation({
    mutationFn: async ({
      connectionId,
      userId,
    }: {
      connectionId: string;
      userId: string;
    }) => {
      // Step 1: Accept the connection request
      await acceptConnectionRequest(connectionId);

      // Step 2: Auto-create peer conversation
      try {
        await createPeerConversation(userId);
      } catch (error) {
        console.warn("Failed to auto-create conversation:", error);
        // Don't fail the whole operation if conversation creation fails
      }
    },
    onSuccess: () => {
      toast.success("Đã kết nối thành công");
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["socialConversations"] });
    },
    onError: () => toast.error("Có lỗi xảy ra"),
  });

  const declineMutation = useMutation({
    mutationFn: (connectionId: string) =>
      declineConnectionRequest(connectionId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["pendingRequests"] });
      toast.success("Đã từ chối lời mời");
    },
  });

  if (isLoading)
    return (
      <div className="flex justify-center p-8">
        <Loader2 className="animate-spin text-stone-300" />
      </div>
    );
  if (error)
    return (
      <div className="p-6 text-center text-red-500 font-medium text-sm">
        Không thể tải dữ liệu
      </div>
    );

  const requests = data?.data?.requests || data?.data?.connections || [];
  const validRequests = requests.filter((req: any) => !!req.requester);

  if (validRequests.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-12 text-stone-400">
        <div className="mb-4 flex h-16 w-16 items-center justify-center rounded-full bg-stone-50 ring-1 ring-stone-100">
          <UserCheck size={32} strokeWidth={1.5} className="opacity-50" />
        </div>
        <p className="font-serif text-lg font-medium text-stone-600">
          Không có lời mời nào
        </p>
        <p className="text-xs">Bạn đã xử lý hết các yêu cầu kết bạn.</p>
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 gap-3 p-4 sm:grid-cols-2">
      {validRequests.map((request: any) => {
        const requester = request.requester || {};
        const displayName =
          requester.displayName || requester.username || "Ẩn danh";
        const avatarUrl = requester.avatarUrl;
        const initial = displayName[0]?.toUpperCase() || "?";

        return (
          <div
            key={request._id}
            className="group flex flex-col gap-3 rounded-2xl border border-stone-100 bg-white p-4 shadow-sm transition-all hover:border-stone-200 hover:shadow-md"
          >
            {/* Header: Avatar + Info */}
            <div className="flex items-center gap-3">
              <div className="h-12 w-12 shrink-0 rounded-full bg-stone-100 p-0.5 ring-1 ring-stone-100">
                {avatarUrl ? (
                  <img
                    src={avatarUrl}
                    className="h-full w-full rounded-full object-cover"
                    alt={displayName}
                  />
                ) : (
                  <div className="flex h-full w-full items-center justify-center rounded-full bg-stone-200 text-stone-500 font-bold">
                    {initial}
                  </div>
                )}
              </div>
              <div className="min-w-0 flex-1">
                <h4 className="truncate font-sans text-sm font-bold text-stone-900">
                  {displayName}
                </h4>
                <p className="truncate text-xs font-medium text-stone-400">
                  {requester.username
                    ? `@${requester.username}`
                    : "Người dùng mới"}
                </p>
                <div className="mt-1 flex items-center gap-1 text-[10px] text-stone-400">
                  <span>2 bạn chung</span> {/* Fake data for demo */}
                </div>
              </div>
            </div>

            {/* Actions: Full width buttons */}
            <div className="grid grid-cols-2 gap-2">
              <Button
                size="sm"
                onClick={() =>
                  acceptMutation.mutate({
                    connectionId: request._id,
                    userId: requester._id,
                  })
                }
                disabled={acceptMutation.isPending}
                className="w-full rounded-xl bg-primary hover:bg-red-700 text-white shadow-sm"
              >
                {acceptMutation.isPending ? (
                  <Loader2 className="w-3 h-3 animate-spin" />
                ) : (
                  <>
                    <Check size={14} className="mr-1.5" /> Đồng ý
                  </>
                )}
              </Button>
              <Button
                size="sm"
                variant="outline"
                onClick={() => declineMutation.mutate(request._id)}
                disabled={declineMutation.isPending}
                className="w-full rounded-xl border-stone-200 text-stone-600 hover:bg-stone-50"
              >
                <X size={14} className="mr-1.5" /> Xóa
              </Button>
            </div>
          </div>
        );
      })}
    </div>
  );
};
