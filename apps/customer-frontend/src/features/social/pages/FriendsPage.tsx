// apps/customer-frontend/src/features/social/pages/FriendsPage.tsx
import { useState } from "react";
import { Users, Mail, UserPlus, Search } from "lucide-react";
import { SocialNavSidebar } from "../components/SocialNavSidebar";
import { FriendsList } from "../components/FriendsList";
import { PendingRequests } from "../components/PendingRequests";
import { UserSearchResults } from "../components/UserSearchResults";
import { Input } from "@/shared/components/ui/input";
import { cn } from "@/shared/lib/utils";
import { useConnectionStore } from "@/stores/useConnectionStore";

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");

  const friendsCount = useConnectionStore((s) => s.friends.length);
  const pendingCount = useConnectionStore((s) => s.pendingRequests.length);

  return (
    // 🔥 FIX MẠNH TAY: Dùng fixed inset-0 để thoát khỏi mọi ràng buộc layout cha
    // z-40 để đè lên các thành phần khác nhưng dưới Modal/Toast (thường là z-50+)
    <div className="fixed inset-0 z-40 flex w-full bg-[#FAFAF9] overflow-hidden">
      {/* Sidebar nằm cố định bên trái */}
      <SocialNavSidebar />

      {/* Main Content chiếm phần còn lại */}
      <div className="flex-1 flex flex-col min-w-0 w-full h-full relative">
        {/* HEADER & TABS */}
        <div className="bg-white/80 backdrop-blur-md border-b border-stone-200 px-6 py-4 sticky top-0 z-10 shrink-0">
          <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
            <h1 className="font-serif text-2xl font-bold text-stone-900">
              Mối quan hệ
            </h1>

            {/* Search Global */}
            <div className="relative w-full md:w-72">
              <Search
                size={16}
                className="absolute left-3 top-1/2 -translate-y-1/2 text-stone-400"
              />
              <Input
                placeholder="Tìm đối tác, bạn bè..."
                className="pl-9 h-10 bg-stone-50 border-stone-200 focus:bg-white focus:border-stone-400 focus:ring-0 transition-all rounded-xl"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
              />
            </div>
          </div>

          {/* Modern Tabs */}
          <div className="flex items-center gap-2 overflow-x-auto no-scrollbar pb-1">
            <button
              onClick={() => setActiveTab("list")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border",
                activeTab === "list"
                  ? "bg-stone-900 text-white border-stone-900 shadow-lg shadow-stone-200"
                  : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50 hover:text-stone-900"
              )}
            >
              <Users size={16} /> Bạn bè
              <span
                className={cn(
                  "ml-1 text-[10px] px-1.5 py-0.5 rounded-full",
                  activeTab === "list"
                    ? "bg-white/20 text-white"
                    : "bg-stone-100 text-stone-600"
                )}
              >
                {friendsCount}
              </span>
            </button>

            <button
              onClick={() => setActiveTab("requests")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border",
                activeTab === "requests"
                  ? "bg-stone-900 text-white border-stone-900 shadow-lg shadow-stone-200"
                  : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50 hover:text-stone-900"
              )}
            >
              <Mail size={16} /> Lời mời
              {pendingCount > 0 && (
                <span className="ml-1 text-[10px] px-1.5 py-0.5 rounded-full bg-red-500 text-white animate-pulse">
                  {pendingCount}
                </span>
              )}
            </button>

            <button
              onClick={() => setActiveTab("search")}
              className={cn(
                "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-bold transition-all border",
                activeTab === "search"
                  ? "bg-stone-900 text-white border-stone-900 shadow-lg shadow-stone-200"
                  : "bg-white text-stone-500 border-stone-200 hover:bg-stone-50 hover:text-stone-900"
              )}
            >
              <UserPlus size={16} /> Tìm mới
            </button>
          </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-8 custom-scrollbar">
          <div className="max-w-7xl mx-auto w-full">
            {activeTab === "list" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <FriendsList />
              </div>
            )}

            {activeTab === "requests" && (
              <div className="animate-in fade-in slide-in-from-bottom-2 duration-500">
                <PendingRequests />
              </div>
            )}

            {activeTab === "search" && (
              <div className="max-w-3xl mx-auto animate-in fade-in slide-in-from-bottom-2 duration-500">
                <div className="text-center mb-10 mt-4">
                  <div className="w-20 h-20 bg-stone-100 rounded-[2rem] flex items-center justify-center mx-auto mb-6 text-stone-400 rotate-3 hover:rotate-6 transition-transform">
                    <UserPlus size={40} strokeWidth={1.5} />
                  </div>
                  <h3 className="text-2xl font-serif font-bold text-stone-900 mb-2">
                    Mở rộng mạng lưới Printz
                  </h3>
                  <p className="text-stone-500 max-w-md mx-auto">
                    Kết nối với các nhà thiết kế tài năng và các đơn vị in ấn uy
                    tín để cùng tạo ra sản phẩm tuyệt vời.
                  </p>
                </div>

                <div className="bg-white rounded-2xl shadow-xl shadow-stone-200/50 border border-stone-100 overflow-hidden">
                  <UserSearchResults searchQuery={searchTerm || "a"} />
                </div>
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  );
}
