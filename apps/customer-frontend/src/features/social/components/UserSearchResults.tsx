// apps/customer-frontend/src/features/social/components/UserSearchResults.tsx
// ✅ SOCIAL: Search results with connection buttons

import { useQuery } from "@tanstack/react-query";
import { Loader2 } from "lucide-react";
import api from "@/shared/lib/axios";
import { ConnectionButton } from "./ConnectionButton";

interface UserSearchResultsProps {
  searchQuery: string;
}

interface SearchUser {
  _id: string;
  username: string;
  displayName?: string;
  avatarUrl?: string;
  bio?: string;
  connectionStatus: "none" | "pending" | "accepted" | "declined" | "blocked";
  connectionId?: string;
}

export function UserSearchResults({ searchQuery }: UserSearchResultsProps) {
  const { data, isLoading, error } = useQuery({
    queryKey: ["searchUsers", searchQuery],
    queryFn: async () => {
      if (!searchQuery || searchQuery.trim().length < 2) {
        return { users: [] };
      }
      const res = await api.get(`/users/search?q=${encodeURIComponent(searchQuery)}`);
      return res.data.data;
    },
    enabled: searchQuery.trim().length >= 2,
  });

  if (!searchQuery || searchQuery.trim().length < 2) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Nhập ít nhất 2 ký tự để tìm kiếm</p>
      </div>
    );
  }

  if (isLoading) {
    return (
      <div className="p-8 flex items-center justify-center">
        <Loader2 size={32} className="animate-spin text-gray-400" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="p-8 text-center text-red-600">
        Có lỗi xảy ra khi tìm kiếm
      </div>
    );
  }

  const users: SearchUser[] = data?.users || [];

  if (users.length === 0) {
    return (
      <div className="p-8 text-center text-gray-500">
        <p>Không tìm thấy người dùng nào</p>
      </div>
    );
  }

  return (
    <div className="divide-y divide-gray-200">
      {users.map((user) => (
        <div
          key={user._id}
          className="flex items-center justify-between p-4 hover:bg-gray-50 transition"
        >
          <div className="flex items-center gap-3 flex-1 min-w-0">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-blue-400 to-purple-500 flex items-center justify-center text-white font-bold flex-shrink-0">
              {user.avatarUrl ? (
                <img
                  src={user.avatarUrl}
                  alt={user.displayName || user.username}
                  className="w-full h-full rounded-full object-cover"
                />
              ) : (
                <span className="text-xl">
                  {(user.displayName || user.username)[0].toUpperCase()}
                </span>
              )}
            </div>
            <div className="min-w-0 flex-1">
              <h3 className="font-semibold text-gray-900 truncate">
                {user.displayName || user.username}
              </h3>
              <p className="text-sm text-gray-500 truncate">@{user.username}</p>
              {user.bio && (
                <p className="text-sm text-gray-600 mt-1 truncate">{user.bio}</p>
              )}
            </div>
          </div>
          <div className="ml-4 flex-shrink-0">
            <ConnectionButton
              userId={user._id}
              userName={user.displayName || user.username}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

