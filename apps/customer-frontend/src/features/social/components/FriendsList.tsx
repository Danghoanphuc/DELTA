// apps/customer-frontend/src/features/social/components/FriendsList.tsx
// ✅ SOCIAL: Display list of friends

import { useQuery } from "@tanstack/react-query";
import { getFriends, type Connection } from "../../../services/api/connection.api.service";
import { useConnectionStore } from "../../../stores/useConnectionStore";
import { useEffect } from "react";
import { Link } from "react-router-dom";
import { useAuthStore } from "../../../stores/useAuthStore";

// Helper to extract friend info from Connection
const getFriendInfo = (connection: Connection, currentUserId: string) => {
  const friend = connection.requester._id === currentUserId 
    ? connection.recipient 
    : connection.requester;
  return {
    _id: friend._id,
    username: friend.username,
    displayName: friend.displayName,
    avatarUrl: friend.avatarUrl,
  };
};

export const FriendsList: React.FC = () => {
  const { friends, setFriends } = useConnectionStore();
  const currentUser = useAuthStore((s) => s.user);

  const { data, isLoading, error } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
  });

  useEffect(() => {
    if (data?.data?.connections) {
      setFriends(data.data.connections);
    }
  }, [data, setFriends]);

  if (isLoading) {
    return (
      <div className="p-6 text-center">
        <div className="animate-spin w-8 h-8 border-4 border-blue-600 border-t-transparent rounded-full mx-auto"></div>
        <p className="mt-2 text-gray-600">Đang tải danh sách bạn bè...</p>
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-6 text-center text-red-600">
        Không thể tải danh sách bạn bè
      </div>
    );
  }

  if (!friends || friends.length === 0) {
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
            d="M17 20h5v-2a3 3 0 00-5.356-1.857M17 20H7m10 0v-2c0-.656-.126-1.283-.356-1.857M7 20H2v-2a3 3 0 015.356-1.857M7 20v-2c0-.656.126-1.283.356-1.857m0 0a5.002 5.002 0 019.288 0M15 7a3 3 0 11-6 0 3 3 0 016 0zm6 3a2 2 0 11-4 0 2 2 0 014 0zM7 10a2 2 0 11-4 0 2 2 0 014 0z"
          />
        </svg>
        <p className="text-lg font-medium">Chưa có bạn bè nào</p>
        <p className="text-sm mt-1">Hãy kết bạn để bắt đầu trò chuyện!</p>
      </div>
    );
  }

  if (!currentUser) return null;

  return (
    <div className="divide-y divide-gray-200">
      {friends.map((connection) => {
        const friend = getFriendInfo(connection, currentUser._id);
        return (
          <div
            key={connection._id}
            className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
          >
            <Link
              to={`/profile/${friend._id}`}
              className="flex items-center gap-3 flex-1"
            >
              <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold">
                {friend.avatarUrl ? (
                  <img
                    src={friend.avatarUrl}
                    alt={friend.displayName || friend.username}
                    className="w-full h-full rounded-full object-cover"
                  />
                ) : (
                  <span className="text-xl">
                    {(friend.displayName || friend.username)?.[0]?.toUpperCase() || "?"}
                  </span>
                )}
              </div>
              <div>
                <h3 className="font-semibold text-gray-900">
                  {friend.displayName || friend.username}
                </h3>
                <p className="text-sm text-gray-500">@{friend.username}</p>
              </div>
            </Link>
            <Link
              to={`/messages?userId=${friend._id}`}
              className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition text-sm"
            >
              Nhắn tin
            </Link>
          </div>
        );
      })}
    </div>
  );
};

