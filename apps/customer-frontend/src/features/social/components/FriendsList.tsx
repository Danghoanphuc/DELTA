// apps/customer-frontend/src/features/social/components/FriendsList.tsx
// ✅ FIXED: Mapping Data Key (friends vs connections)

import { useQuery } from "@tanstack/react-query";
import { getFriends } from "../../../services/api/connection.api.service";
import { useConnectionStore } from "../../../stores/useConnectionStore";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../stores/useAuthStore";
import { Loader2, MessageCircle } from "lucide-react";
import { Button } from "@/shared/components/ui/button";

export const FriendsList: React.FC = () => {
  const { setFriends } = useConnectionStore();
  const currentUser = useAuthStore((s) => s.user);

  const { data, isLoading, error } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
  });

  useEffect(() => {
    // ✅ FIX: Đọc đúng key 'friends' từ backend mới
    const list = data?.data?.friends || data?.data?.connections || [];
    if (list) {
      setFriends(list);
    }
  }, [data, setFriends]);

  if (isLoading)
    return (
      <div className="p-8 flex justify-center">
        <Loader2 className="animate-spin text-gray-400" />
      </div>
    );
  if (error)
    return (
      <div className="p-6 text-center text-red-500">
        Không thể tải danh sách
      </div>
    );
  if (!currentUser) return null;

  const friendsList = data?.data?.friends || data?.data?.connections || [];

  if (friendsList.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Chưa có bạn bè nào</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-100">
      {friendsList.map((connection: any) => {
        // ✅ FIX: Logic tìm người kia CHUẨN XÁC
        // Kiểm tra an toàn cả trường hợp populate (object) và chưa populate (string ID)
        const requesterId =
          typeof connection.requester === "string"
            ? connection.requester
            : connection.requester?._id;

        const currentUserIdStr = currentUser?._id?.toString();
        const requesterIdStr = requesterId?.toString();

        // Nếu mình là requester -> bạn là recipient, và ngược lại
        const friend =
          requesterIdStr === currentUserIdStr
            ? connection.recipient
            : connection.requester;

        // Nếu friend bị null (do data lỗi), skip thay vì crash
        if (!friend || typeof friend !== "object") return null;

        return (
          <div
            key={connection._id}
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition group"
          >
            <div className="flex items-center gap-3 flex-1">
              <div className="w-10 h-10 rounded-full bg-gray-200 flex items-center justify-center overflow-hidden">
                {friend.avatarUrl ? (
                  <img
                    src={friend.avatarUrl}
                    className="w-full h-full object-cover"
                  />
                ) : (
                  <span className="font-bold text-gray-500">
                    {(friend.displayName ||
                      friend.username)?.[0]?.toUpperCase()}
                  </span>
                )}
              </div>
              <div>
                <h4 className="font-semibold text-sm text-gray-900">
                  {friend.displayName || friend.username}
                </h4>
                <p className="text-xs text-gray-500">@{friend.username}</p>
              </div>
            </div>
            <Button
              asChild
              size="sm"
              variant="ghost"
              className="text-blue-600 bg-blue-50 hover:bg-blue-100"
            >
              <Link to={`/messages?userId=${friend._id}`}>
                <MessageCircle size={16} className="mr-1" /> Nhắn tin
              </Link>
            </Button>
          </div>
        );
      })}
    </div>
  );
};
