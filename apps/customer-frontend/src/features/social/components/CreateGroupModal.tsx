// apps/customer-frontend/src/features/social/components/CreateGroupModal.tsx
import { useState } from "react";
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
import { Search, Check, Loader2, Users, X } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getFriends } from "@/services/api/connection.api.service";
import { createGroupConversation } from "../../chat/services/chat.api.service";
import { useSocialChatStore } from "../hooks/useSocialChatStore";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";

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

  const friendsList = friendsData?.data?.friends || friendsData?.data?.connections || [];

  // Logic filter (giữ nguyên logic cũ)
  const filteredFriends = friendsList.filter((f: any) => {
     const friend = f.friend || (f.requester?._id ? (f.requester._id === "ME" ? f.recipient : f.requester) : f);
     const name = friend.displayName || friend.username || "";
     return name.toLowerCase().includes(searchTerm.toLowerCase());
  });

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
        onClose();
        setGroupName("");
        setSelectedMembers([]);
      }
    } catch (error) {
      toast.error("Lỗi khi tạo nhóm");
    } finally {
      setIsCreating(false);
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      {/* On Mobile: Full screen or Bottom Sheet style */}
      <DialogContent className="w-full h-full sm:h-auto sm:max-w-[425px] p-0 gap-0 overflow-hidden bg-white sm:rounded-xl rounded-none flex flex-col">
        
        <DialogHeader className="p-4 border-b border-gray-100 flex flex-row items-center justify-between shrink-0">
          <DialogTitle className="text-lg font-bold flex items-center gap-2">
            <Users size={20} className="text-blue-600"/>
            Tạo nhóm mới
          </DialogTitle>
          <DialogClose asChild>
             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full"><X size={18}/></Button>
          </DialogClose>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto p-4 space-y-5">
          {/* Tên nhóm */}
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-700">Đặt tên nhóm</label>
            <Input 
              placeholder="Nhóm thiết kế, Team Building..." 
              value={groupName}
              onChange={(e) => setGroupName(e.target.value)}
              className="bg-gray-50 border-gray-200 focus-visible:ring-blue-500"
              autoFocus
            />
          </div>

          {/* Tìm thành viên */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
                <label className="text-sm font-medium text-gray-700">Thêm thành viên</label>
                <span className="text-xs text-blue-600 font-medium bg-blue-50 px-2 py-1 rounded-full">
                    Đã chọn: {selectedMembers.length}
                </span>
            </div>
            
            <div className="relative">
               <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
               <Input 
                  placeholder="Tìm theo tên..." 
                  className="pl-9 h-10 text-sm bg-white"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
               />
            </div>
            
            {/* List */}
            <div className="border border-gray-100 rounded-xl overflow-hidden">
               {isLoadingFriends ? (
                 <div className="flex justify-center py-8"><Loader2 className="animate-spin text-gray-400"/></div>
               ) : filteredFriends.length === 0 ? (
                 <p className="text-center text-xs text-gray-400 py-8">Không tìm thấy bạn bè nào</p>
               ) : (
                 <div className="divide-y divide-gray-50 max-h-[300px] overflow-y-auto">
                    {filteredFriends.map((conn: any) => {
                       const friend = conn.friend || (conn.requester?._id ? conn.recipient : conn);
                       const displayName = friend.displayName || friend.username || "Người dùng";
                       const avatarUrl = friend.avatarUrl;
                       const userId = friend._id || friend.id;
                       if(!userId) return null;
                       const isSelected = selectedMembers.includes(userId);

                       return (
                         <div 
                            key={userId} 
                            onClick={() => toggleMember(userId)}
                            className={cn(
                              "flex items-center gap-3 p-3 cursor-pointer transition-colors active:bg-gray-100",
                              isSelected ? "bg-blue-50/50" : "hover:bg-gray-50"
                            )}
                         >
                            {/* Checkbox fake */}
                            <div className={cn(
                                "w-5 h-5 rounded-full border flex items-center justify-center transition-all",
                                isSelected ? "bg-blue-600 border-blue-600" : "border-gray-300 bg-white"
                            )}>
                                {isSelected && <Check size={12} className="text-white" strokeWidth={3} />}
                            </div>

                            <div className="w-9 h-9 rounded-full bg-gray-200 flex-shrink-0 overflow-hidden">
                               {avatarUrl ? <img src={avatarUrl} className="w-full h-full object-cover"/> : null}
                            </div>
                            
                            <div className="flex-1 min-w-0">
                               <p className="text-sm font-medium truncate text-gray-900">{displayName}</p>
                            </div>
                         </div>
                       )
                    })}
                 </div>
               )}
            </div>
          </div>
        </div>

        <DialogFooter className="p-4 border-t border-gray-100 bg-gray-50/50 shrink-0 flex-row gap-3">
           <Button variant="outline" onClick={onClose} disabled={isCreating} className="flex-1">Hủy</Button>
           <Button 
                onClick={handleCreate} 
                disabled={isCreating || !groupName || selectedMembers.length < 1} 
                className="flex-1 bg-blue-600 hover:bg-blue-700"
            >
              {isCreating && <Loader2 className="w-4 h-4 mr-2 animate-spin"/>}
              Tạo ({selectedMembers.length})
           </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}