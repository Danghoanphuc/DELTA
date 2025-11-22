// apps/customer-frontend/src/features/social/components/CreateGroupModal.tsx
import { useState, useMemo } from "react";
import { 
  Dialog, 
  DialogContent, 
  DialogHeader, 
  DialogTitle,
  DialogFooter,
  DialogClose
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Search, Check, Loader2, Users, X, UserPlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getFriends } from "@/services/api/connection.api.service";
import { createGroupConversation } from "../../chat/services/chat.api.service";
import { useSocialChatStore } from "../hooks/useSocialChatStore";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (conversationId: string) => void;
}

export function CreateGroupModal({ isOpen, onClose, onSuccess }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  const { setConversations, conversations } = useSocialChatStore();

  const { data: friendsData, isLoading: isLoadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
    enabled: isOpen,
  });

  const friendsList = useMemo(() => 
    friendsData?.data?.friends || friendsData?.data?.connections || [], 
  [friendsData]);

  // Logic filter
  const filteredFriends = useMemo(() => {
    return friendsList.filter((f: any) => {
       const friend = f.friend || (f.requester?._id ? (f.requester._id === "ME" ? f.recipient : f.requester) : f);
       const name = friend.displayName || friend.username || "";
       return name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [friendsList, searchTerm]);

  const toggleMember = (userId: string) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return toast.error("Vui lòng nhập tên nhóm");
    if (selectedMembers.length < 2) return toast.error("Nhóm cần ít nhất 3 người (bạn và 2 người khác)");

    setIsCreating(true);
    try {
      const res = await createGroupConversation(groupName, selectedMembers);
      if (res.success && res.data?.conversation) {
        const newConv = res.data.conversation;
        setConversations([newConv, ...conversations]);
        toast.success("Tạo nhóm thành công");
        onSuccess(newConv._id);
        handleClose();
      }
    } catch (error) {
      toast.error("Lỗi khi tạo nhóm");
    } finally {
      setIsCreating(false);
    }
  };

  const handleClose = () => {
    onClose();
    setTimeout(() => {
      setGroupName("");
      setSelectedMembers([]);
      setSearchTerm("");
    }, 300); // Reset state after animation
  };

  // Lấy danh sách object user đã chọn để hiển thị avatar
  const selectedUsersInfo = friendsList.filter((f: any) => {
    const friend = f.friend || (f.requester?._id ? (f.requester._id === "ME" ? f.recipient : f.requester) : f);
    return selectedMembers.includes(friend._id || friend.id);
  }).map((f: any) => f.friend || (f.requester?._id ? (f.requester._id === "ME" ? f.recipient : f.requester) : f));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full h-[100dvh] sm:h-[85vh] sm:max-w-[500px] p-0 gap-0 overflow-hidden bg-white sm:rounded-2xl rounded-none flex flex-col shadow-2xl border-0">
        
        {/* === HEADER === */}
        <DialogHeader className="p-5 border-b border-gray-100 flex flex-row items-center justify-between shrink-0 bg-white z-20">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
               <Users size={18} />
            </div>
            Tạo nhóm mới
          </DialogTitle>
          <DialogClose asChild>
             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100 hover:text-gray-600 transition-colors"><X size={20}/></Button>
          </DialogClose>
        </DialogHeader>

        {/* === BODY === */}
        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          <div className="p-5 space-y-6">
            
            {/* 1. Group Name Input */}
            <div className="space-y-3">
              <label className="text-sm font-semibold text-gray-700 ml-1">Tên nhóm</label>
              <div className="relative">
                <Input 
                  placeholder="VD: Team Thiết kế Printz..." 
                  value={groupName}
                  onChange={(e) => setGroupName(e.target.value)}
                  className="bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 focus:ring-4 focus:ring-blue-500/10 transition-all h-12 text-base pl-4 rounded-xl"
                  autoFocus
                />
              </div>
            </div>

            {/* 2. Selected Members (Horizontal Scroll) */}
            <AnimatePresence>
              {selectedUsersInfo.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden"
                >
                  <label className="text-sm font-semibold text-gray-700 ml-1 mb-2 block">
                    Thành viên đã chọn <span className="text-blue-600">({selectedMembers.length})</span>
                  </label>
                  <div className="flex gap-3 overflow-x-auto pb-2 px-1 no-scrollbar">
                    {selectedUsersInfo.map((user: any) => (
                      <motion.div 
                        key={user._id}
                        initial={{ scale: 0 }}
                        animate={{ scale: 1 }}
                        exit={{ scale: 0 }}
                        className="flex flex-col items-center gap-1 shrink-0 w-14 group cursor-pointer"
                        onClick={() => toggleMember(user._id)}
                      >
                        <div className="relative">
                          <div className="w-12 h-12 rounded-full overflow-hidden border-2 border-white shadow-sm ring-2 ring-blue-100 group-hover:ring-red-100 transition-all">
                            {user.avatarUrl ? (
                              <img src={user.avatarUrl} className="w-full h-full object-cover" />
                            ) : (
                              <div className="w-full h-full bg-blue-100 flex items-center justify-center text-blue-600 font-bold text-sm">
                                {user.displayName?.[0] || user.username?.[0]}
                              </div>
                            )}
                          </div>
                          <div className="absolute -top-1 -right-1 w-5 h-5 bg-white rounded-full flex items-center justify-center shadow-sm border border-gray-100">
                             <div className="w-4 h-4 bg-gray-200 rounded-full flex items-center justify-center text-gray-500 group-hover:bg-red-500 group-hover:text-white transition-colors">
                                <X size={10} />
                             </div>
                          </div>
                        </div>
                        <span className="text-[10px] text-center text-gray-600 truncate w-full px-1">
                          {user.displayName?.split(" ").pop() || user.username}
                        </span>
                      </motion.div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 3. Friend List Search & Selection */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                  <label className="text-sm font-semibold text-gray-700 ml-1">Thêm thành viên</label>
              </div>
              
              <div className="relative group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18}/>
                 <Input 
                    placeholder="Tìm bạn bè..." 
                    className="pl-10 h-11 bg-white border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              
              <ScrollArea className="h-[300px] pr-3 -mr-3">
                 {isLoadingFriends ? (
                   <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-400"/></div>
                 ) : filteredFriends.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <div className="w-12 h-12 bg-gray-50 rounded-full flex items-center justify-center mb-2">
                        <UserPlus size={20} className="opacity-50" />
                      </div>
                      <p className="text-sm">Không tìm thấy bạn bè</p>
                   </div>
                 ) : (
                   <div className="space-y-1">
                      {filteredFriends.map((conn: any) => {
                         const friend = conn.friend || (conn.requester?._id ? (conn.requester._id === "ME" ? conn.recipient : conn.requester) : conn);
                         const displayName = friend.displayName || friend.username || "Người dùng";
                         const avatarUrl = friend.avatarUrl;
                         const userId = friend._id || friend.id;
                         if(!userId) return null;
                         const isSelected = selectedMembers.includes(userId);

                         return (
                           <motion.div 
                              key={userId} 
                              onClick={() => toggleMember(userId)}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border border-transparent",
                                isSelected 
                                  ? "bg-blue-50/80 border-blue-200 shadow-sm" 
                                  : "hover:bg-gray-50 hover:border-gray-100"
                              )}
                              whileTap={{ scale: 0.98 }}
                           >
                              <div className="relative">
                                <div className={cn(
                                    "w-10 h-10 rounded-full flex-shrink-0 overflow-hidden transition-all",
                                    isSelected ? "ring-2 ring-blue-500 ring-offset-2" : "bg-gray-100"
                                )}>
                                   {avatarUrl ? (
                                     <img src={avatarUrl} className="w-full h-full object-cover"/>
                                   ) : (
                                     <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-gray-100 to-gray-200 text-gray-500 font-medium text-sm">
                                       {displayName[0]?.toUpperCase()}
                                     </div>
                                   )}
                                </div>
                                {isSelected && (
                                  <motion.div 
                                    initial={{ scale: 0 }} animate={{ scale: 1 }}
                                    className="absolute -bottom-1 -right-1 w-5 h-5 bg-blue-500 rounded-full border-2 border-white flex items-center justify-center shadow-sm"
                                  >
                                    <Check size={10} className="text-white" strokeWidth={4} />
                                  </motion.div>
                                )}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                 <p className={cn(
                                   "text-sm font-medium truncate transition-colors",
                                   isSelected ? "text-blue-700" : "text-gray-900"
                                 )}>
                                   {displayName}
                                 </p>
                                 <p className="text-xs text-gray-500 truncate">@{friend.username}</p>
                              </div>

                              {/* Checkbox visual (Optional, since we have ring effect) */}
                              <div className={cn(
                                  "w-5 h-5 rounded-full border-2 flex items-center justify-center transition-all",
                                  isSelected 
                                    ? "bg-blue-500 border-blue-500" 
                                    : "border-gray-300 group-hover:border-gray-400"
                              )}>
                                  {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                              </div>
                           </motion.div>
                         )
                      })}
                   </div>
                 )}
              </ScrollArea>
            </div>
          </div>
        </div>

        {/* === FOOTER === */}
        <DialogFooter className="p-5 border-t border-gray-100 bg-white shrink-0 flex-row gap-3 items-center shadow-[0_-4px_20px_rgba(0,0,0,0.03)]">
           <div className="flex-1 text-xs text-gray-500 pl-1">
              Đã chọn: <span className="font-bold text-gray-900">{selectedMembers.length}</span>
           </div>
           <div className="flex gap-3 w-full sm:w-auto">
             <Button variant="outline" onClick={handleClose} disabled={isCreating} className="flex-1 sm:flex-none rounded-xl border-gray-200 hover:bg-gray-50">
               Hủy
             </Button>
             <Button 
                  onClick={handleCreate} 
                  disabled={isCreating || !groupName || selectedMembers.length < 1} 
                  className="flex-1 sm:flex-none bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20 transition-all hover:shadow-blue-600/30"
              >
                {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Users size={18} className="mr-2" />}
                Tạo nhóm
             </Button>
           </div>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}