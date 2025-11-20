// apps/customer-frontend/src/features/social/pages/FriendsPage.tsx
// ✅ SOCIAL: Friends page with search, pending requests, and friends list

import { useState } from "react";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/shared/components/ui/tabs";
import { Input } from "@/shared/components/ui/input";
import { Search, Users, UserPlus, Clock } from "lucide-react";
import { UserSearchResults } from "../components/UserSearchResults";
import { FriendsList } from "../components/FriendsList";
import { PendingRequests } from "../components/PendingRequests";
import { useDebounce } from "@/shared/hooks/useDebounce";

export default function FriendsPage() {
  const [searchTerm, setSearchTerm] = useState("");
  const debouncedSearch = useDebounce(searchTerm, 500);

  return (
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <div className="bg-white border-b border-gray-200">
        <div className="max-w-4xl mx-auto px-4 py-6">
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Bạn bè</h1>
          <p className="text-gray-600">Kết nối và chat với bạn bè trên Printz</p>
        </div>
      </div>

      {/* Content */}
      <div className="max-w-4xl mx-auto px-4 py-6">
        <Tabs defaultValue="friends" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="friends" className="flex items-center gap-2">
              <Users size={18} />
              <span className="hidden sm:inline">Bạn bè</span>
            </TabsTrigger>
            <TabsTrigger value="pending" className="flex items-center gap-2">
              <Clock size={18} />
              <span className="hidden sm:inline">Lời mời</span>
            </TabsTrigger>
            <TabsTrigger value="search" className="flex items-center gap-2">
              <UserPlus size={18} />
              <span className="hidden sm:inline">Tìm kiếm</span>
            </TabsTrigger>
          </TabsList>

          {/* Tab: Friends List */}
          <TabsContent value="friends">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Danh sách bạn bè</h2>
              </div>
              <FriendsList />
            </div>
          </TabsContent>

          {/* Tab: Pending Requests */}
          <TabsContent value="pending">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900">Lời mời kết bạn</h2>
              </div>
              <PendingRequests />
            </div>
          </TabsContent>

          {/* Tab: Search Users */}
          <TabsContent value="search">
            <div className="bg-white rounded-lg shadow-sm border border-gray-200">
              <div className="p-4 border-b border-gray-200">
                <h2 className="font-semibold text-gray-900 mb-4">Tìm kiếm người dùng</h2>
                <div className="relative">
                  <Search
                    size={20}
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                  />
                  <Input
                    type="text"
                    placeholder="Tìm theo tên hoặc username..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <UserSearchResults searchQuery={debouncedSearch} />
            </div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
}

