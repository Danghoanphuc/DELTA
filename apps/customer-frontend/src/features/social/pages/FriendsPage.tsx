// apps/customer-frontend/src/features/social/pages/FriendsPage.tsx
import { useState } from "react";
import { 
  Users, UsersRound, Search, Mail, UserPlus, Filter, ArrowDownUp
} from "lucide-react";
import { SocialNavSidebar } from "../components/SocialNavSidebar";
import { FriendsList } from "../components/FriendsList";
import { PendingRequests } from "../components/PendingRequests";
import { UserSearchResults } from "../components/UserSearchResults";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { useConnectionStore } from "@/stores/useConnectionStore";

export default function FriendsPage() {
  const [activeTab, setActiveTab] = useState("list");
  const [searchTerm, setSearchTerm] = useState("");

  const friendsCount = useConnectionStore(s => s.friends.length);
  const pendingCount = useConnectionStore(s => s.pendingRequests.length);

  const menuItems = [
    { id: "list", icon: Users, label: "Bạn bè", mobileLabel: "Bạn bè", count: friendsCount },
    { id: "requests", icon: Mail, label: "Lời mời kết bạn", mobileLabel: "Lời mời", count: pendingCount },
    { id: "groups", icon: UsersRound, label: "Danh sách nhóm", mobileLabel: "Nhóm", count: 0 },
    { id: "search", icon: UserPlus, label: "Tìm bạn mới", mobileLabel: "Tìm mới", count: null },
  ];

  return (
    <div className="flex w-full bg-white h-[calc(100vh-3.5rem)] lg:h-[calc(100vh-4rem)] overflow-hidden">      
      {/* DESKTOP SIDEBAR (Giữ nguyên) */}
      <SocialNavSidebar />

      {/* SUB-SIDEBAR (Chỉ hiện trên Desktop) */}
      <div className="hidden lg:flex w-72 border-r border-gray-200 bg-white flex-col h-full">
        <div className="p-4 border-b border-gray-100">
           <h2 className="text-xl font-bold text-gray-800">Danh bạ</h2>
        </div>
        <div className="flex-1 overflow-y-auto py-2 px-2 space-y-1">
            {menuItems.map(item => (
                <button
                  key={item.id}
                  onClick={() => setActiveTab(item.id)}
                  className={cn(
                    "w-full flex items-center justify-between px-3 py-2.5 rounded-lg text-sm font-medium transition-colors",
                    activeTab === item.id 
                      ? "bg-blue-50 text-blue-700" 
                      : "text-gray-700 hover:bg-gray-100"
                  )}
                >
                  <div className="flex items-center gap-3">
                     <item.icon size={20} />
                     <span>{item.label}</span>
                  </div>
                  {item.count !== null && item.count > 0 && (
                    <span className="bg-gray-200 text-gray-600 text-xs py-0.5 px-2 rounded-full">
                       {item.count}
                    </span>
                  )}
                </button>
            ))}
        </div>
      </div>

      {/* MAIN CONTENT */}
      <div className="flex-1 flex flex-col min-w-0 bg-gray-50">
        
        {/* MOBILE TABS (Thay thế Sidebar trên Mobile) */}
        <div className="lg:hidden bg-white border-b border-gray-200 overflow-x-auto hide-scrollbar sticky top-0 z-10">
            <div className="flex p-2 gap-2 min-w-max">
                {menuItems.map(item => (
                    <button
                        key={item.id}
                        onClick={() => setActiveTab(item.id)}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-full text-sm font-medium transition-all whitespace-nowrap border",
                            activeTab === item.id 
                                ? "bg-blue-600 text-white border-blue-600 shadow-sm" 
                                : "bg-white text-gray-600 border-gray-200 hover:bg-gray-50"
                        )}
                    >
                        <item.icon size={16} />
                        {item.mobileLabel}
                        {item.count !== null && item.count > 0 && (
                             <span className={cn(
                                 "ml-1 text-xs px-1.5 py-0.5 rounded-full",
                                 activeTab === item.id ? "bg-white/20 text-white" : "bg-gray-100 text-gray-600"
                             )}>
                                {item.count}
                             </span>
                        )}
                    </button>
                ))}
            </div>
        </div>

        {/* HEADER CONTENT (Desktop only - Mobile dùng tabs rồi) */}
        <div className="hidden lg:flex h-16 bg-white border-b border-gray-200 px-6 items-center justify-between shrink-0">
           <h2 className="text-base font-bold text-gray-900">
                {menuItems.find(i => i.id === activeTab)?.label}
           </h2>
        </div>

        {/* TOOLBAR & SEARCH (Responsive) */}
        {activeTab === "list" && (
           <div className="bg-white px-4 py-3 border-b border-gray-200 flex flex-col sm:flex-row gap-3">
              <div className="relative flex-1">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                 <Input 
                    placeholder="Tìm bạn bè..." 
                    className="pl-10 h-10 bg-gray-50 border-gray-200 w-full"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              <div className="flex items-center gap-2 justify-end">
                 <Button variant="outline" size="sm" className="h-10 text-gray-600 gap-2 flex-1 sm:flex-none">
                    <ArrowDownUp size={16}/>
                    <span>Tên</span>
                 </Button>
                 <Button variant="outline" size="sm" className="h-10 text-gray-600 gap-2 flex-1 sm:flex-none">
                    <Filter size={16}/>
                    <span>Lọc</span>
                 </Button>
              </div>
           </div>
        )}

        {/* LIST CONTENT SCROLLABLE */}
        <div className="flex-1 overflow-y-auto p-0 lg:p-6">
           <div className="bg-white lg:rounded-xl lg:shadow-sm lg:border border-gray-200 min-h-full lg:min-h-[400px]">
              
              {activeTab === "list" && (
                 <div className="divide-y divide-gray-100">
                    <FriendsList />
                 </div>
              )}

              {activeTab === "groups" && (
                 <div className="flex flex-col items-center justify-center h-64 text-gray-500">
                    <UsersRound size={48} className="opacity-20 mb-4"/>
                    <p>Tính năng Nhóm đang phát triển</p>
                 </div>
              )}

              {activeTab === "requests" && (
                 <div className="divide-y divide-gray-100">
                    <PendingRequests />
                 </div>
              )}

              {activeTab === "search" && (
                 <div className="p-4">
                    <div className="relative mb-6">
                       <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
                       <Input 
                          placeholder="Nhập tên, số điện thoại hoặc email..." 
                          className="pl-10 h-12 text-base"
                          autoFocus
                       />
                    </div>
                    <UserSearchResults searchQuery="" />
                 </div>
              )}

           </div>
        </div>
      </div>
    </div>
  );
}