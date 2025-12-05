// apps/customer-frontend/src/features/social/components/FriendsList.tsx

import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import {
  getFriends,
  removeConnection,
  blockUser,
} from "../../../services/api/connection.api.service";
import { useConnectionStore } from "../../../stores/useConnectionStore";
import { useEffect, useState } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../stores/useAuthStore";
import { Loader2, MessageCircle, MoreHorizontal } from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { toast } from "@/shared/utils/toast";

export const FriendsList: React.FC = () => {
  const { setFriends } = useConnectionStore();
  const currentUser = useAuthStore((s) => s.user);
  const queryClient = useQueryClient();

  const [unfriendId, setUnfriendId] = useState<string | null>(null);
  const [blockId, setBlockId] = useState<string | null>(null);

  const { data, isLoading, error } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
  });

  useEffect(() => {
    const list = data?.data?.friends || data?.data?.connections || [];
    if (list) setFriends(list);
  }, [data, setFriends]);

  const unfriendMutation = useMutation({
    mutationFn: (connectionId: string) => removeConnection(connectionId),
    onSuccess: () => {
      toast.success("Đã hủy kết bạn");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      queryClient.invalidateQueries({ queryKey: ["socialConversations"] });
      setUnfriendId(null);
    },
    onError: () => {
      toast.error("Có lỗi xảy ra");
    },
  });

  const blockMutation = useMutation({
    mutationFn: (userId: string) => blockUser(userId),
    onSuccess: () => {
      toast.success("Đã chặn người dùng");
      queryClient.invalidateQueries({ queryKey: ["friends"] });
      setBlockId(null);
    },
    onError: () => {
      toast.error("Có lỗi xảy ra");
    },
  });

  if (isLoading)
    return (
      <div className="flex justify-center p-10">
        <Loader2 className="animate-spin text-stone-300" />
      </div>
    );
  if (error)
    return (
      <div className="p-10 text-center text-red-500 text-sm font-medium">
        Không thể tải danh sách
      </div>
    );

  const friendsList = data?.data?.friends || data?.data?.connections || [];

  if (friendsList.length === 0) {
    return (
      <div className="flex flex-col items-center justify-center p-16 text-stone-400">
        <div className="mb-4 h-20 w-20 rounded-full bg-stone-50 flex items-center justify-center">
          <MessageCircle size={32} className="opacity-20" />
        </div>
        <p className="font-serif text-lg text-stone-600">Chưa có kết nối nào</p>
        <p className="text-xs">Hãy tìm kiếm và kết bạn với mọi người.</p>
      </div>
    );
  }

  return (
    <>
      <div className="grid grid-cols-1 gap-4 p-4 sm:grid-cols-2 lg:grid-cols-3">
        {friendsList.map((connection: any) => {
          const requesterId =
            typeof connection.requester === "string"
              ? connection.requester
              : connection.requester?._id;
          const currentUserIdStr = currentUser?._id?.toString();
          const friend =
            requesterId?.toString() === currentUserIdStr
              ? connection.recipient
              : connection.requester;

          if (!friend || typeof friend !== "object") return null;

          return (
            <div
              key={connection._id}
              className="group relative flex flex-col items-center rounded-2xl border border-stone-100 bg-white p-6 shadow-sm transition-all hover:-translate-y-1 hover:border-primary/20 hover:shadow-md"
            >
              {/* Avatar - Large & Centered */}
              <div className="mb-4 relative">
                <div className="h-20 w-20 overflow-hidden rounded-full border-4 border-stone-50 shadow-inner">
                  {friend.avatarUrl ? (
                    <img
                      src={friend.avatarUrl}
                      className="h-full w-full object-cover"
                      loading="lazy"
                    />
                  ) : (
                    <div className="flex h-full w-full items-center justify-center bg-gradient-to-tr from-stone-200 to-stone-300 text-2xl font-bold text-stone-500">
                      {(friend.displayName ||
                        friend.username)?.[0]?.toUpperCase()}
                    </div>
                  )}
                </div>
                {/* Online Indicator */}
                {friend.isOnline && (
                  <span className="absolute bottom-1 right-1 h-4 w-4 rounded-full border-2 border-white bg-green-500 shadow-sm" />
                )}
              </div>

              {/* Info */}
              <div className="text-center mb-6">
                <h4 className="font-serif text-lg font-bold text-stone-900 line-clamp-1">
                  {friend.displayName || friend.username}
                </h4>
                <p className="text-xs font-medium text-stone-400">
                  @{friend.username}
                </p>
              </div>

              {/* Actions Footer */}
              <div className="w-full flex items-center gap-2 mt-auto">
                <Button
                  asChild
                  className="flex-1 rounded-xl bg-stone-900 text-white hover:bg-primary shadow-md transition-all font-bold text-xs h-9"
                >
                  <Link to={`/messages?userId=${friend._id}`}>Nhắn tin</Link>
                </Button>

                <DropdownMenu modal={false}>
                  <DropdownMenuTrigger asChild>
                    <Button
                      variant="outline"
                      size="icon"
                      className="h-9 w-9 rounded-xl border-stone-200 text-stone-400 hover:text-stone-900"
                    >
                      <MoreHorizontal size={16} />
                    </Button>
                  </DropdownMenuTrigger>
                  <DropdownMenuContent
                    align="end"
                    className="bg-white z-50 shadow-xl border border-stone-100 rounded-xl p-1"
                  >
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setUnfriendId(connection._id);
                      }}
                      className="text-red-600 rounded-lg cursor-pointer"
                    >
                      Hủy kết bạn
                    </DropdownMenuItem>
                    <DropdownMenuItem
                      onClick={(e) => {
                        e.stopPropagation();
                        setBlockId(friend._id);
                      }}
                      className="rounded-lg cursor-pointer"
                    >
                      Chặn người này
                    </DropdownMenuItem>
                  </DropdownMenuContent>
                </DropdownMenu>
              </div>
            </div>
          );
        })}
      </div>

      {/* Unfriend Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!unfriendId}
        onClose={() => setUnfriendId(null)}
        onConfirm={() => unfriendId && unfriendMutation.mutate(unfriendId)}
        title="Hủy kết bạn?"
        description="Bạn sẽ không còn là bạn bè với người này. Cuộc trò chuyện sẽ bị vô hiệu hóa."
        confirmText="Hủy kết bạn"
        cancelText="Giữ lại"
        variant="danger"
        isLoading={unfriendMutation.isPending}
      />

      {/* Block Confirmation Dialog */}
      <ConfirmDialog
        isOpen={!!blockId}
        onClose={() => setBlockId(null)}
        onConfirm={() => blockId && blockMutation.mutate(blockId)}
        title="Chặn người dùng?"
        description="Người này sẽ không thể gửi tin nhắn hoặc kết bạn với bạn nữa."
        confirmText="Chặn ngay"
        cancelText="Hủy"
        variant="danger"
        isLoading={blockMutation.isPending}
      />
    </>
  );
};
