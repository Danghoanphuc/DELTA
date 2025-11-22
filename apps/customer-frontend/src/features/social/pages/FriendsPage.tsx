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

  const friendsCount = useConnectionStore(s => s.friends.length);
  const pendingCount = useConnectionStore(s => s.pendingRequests.length);

  return (
    <div className="flex w-full bg-gray-50/50 h-[calc(100vh-4rem)] overflow-hidden">      
      <SocialNavSidebar />

      <div className="flex-1 flex flex-col min-w-0 max-w-5xl mx-auto w-full">
        
        {/* HEADER & TABS */}
        <div className="bg-white border-b border-gray-200 px-6 py-4 sticky top-0 z-10">
           <div className="flex flex-col md:flex-row md:items-center justify-between gap-4 mb-4">
              <h1 className="text-2xl font-bold text-gray-900">Mối quan hệ</h1>
              
              {/* Search Global */}
              <div className="relative w-full md:w-64">
                 <Search size={16} className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" />
                 <Input 
                    placeholder="Tìm bạn bè..." 
                    className="pl-9 bg-gray-50 border-transparent focus:bg-white focus:border-blue-200 transition-all"
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
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border",
                  activeTab === "list" 
                    ? "bg-blue-600 text-white border-blue-600 shadow-md" 
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                )}
              >
                <Users size={16} /> Bạn bè
                <span className={cn("ml-1 text-xs px-1.5 rounded-full", activeTab === "list" ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600")}>{friendsCount}</span>
              </button>

              <button
                onClick={() => setActiveTab("requests")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border",
                  activeTab === "requests" 
                    ? "bg-blue-600 text-white border-blue-600 shadow-md" 
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                )}
              >
                <Mail size={16} /> Lời mời
                {pendingCount > 0 && (
                   <span className="ml-1 text-xs px-1.5 rounded-full bg-red-500 text-white animate-pulse">{pendingCount}</span>
                )}
              </button>

              <button
                onClick={() => setActiveTab("search")}
                className={cn(
                  "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all border",
                  activeTab === "search" 
                    ? "bg-blue-600 text-white border-blue-600 shadow-md" 
                    : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                )}
              >
                <UserPlus size={16} /> Tìm bạn mới
              </button>
           </div>
        </div>

        {/* CONTENT AREA */}
        <div className="flex-1 overflow-y-auto p-4 md:p-6">
           {activeTab === "list" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[300px]">
                 <FriendsList />
              </div>
           )}

           {activeTab === "requests" && (
              <div className="bg-white rounded-2xl border border-gray-100 shadow-sm overflow-hidden min-h-[300px]">
                 <PendingRequests />
              </div>
           )}

           {activeTab === "search" && (
              <div className="max-w-2xl mx-auto">
                 <div className="text-center mb-8">
                    <div className="w-16 h-16 bg-blue-50 rounded-full flex items-center justify-center mx-auto mb-4 text-blue-500">
                       <UserPlus size={32} />
                    </div>
                    <h3 className="text-lg font-semibold text-gray-900">Khám phá cộng đồng Printz</h3>
                    <p className="text-gray-500">Kết nối với các nhà thiết kế và chủ nhà in khác.</p>
                 </div>
                 
                 <div className="bg-white p-1 rounded-2xl shadow-lg border border-gray-100">
                    <UserSearchResults searchQuery={searchTerm || "a"} /> 
                    {/* Trick: pass 'a' to show some default users if search is empty, or handle in component */}
                 </div>
              </div>
           )}
        </div>
      </div>
    </div>
  );
}