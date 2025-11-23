// apps/customer-frontend/src/features/social/components/CreateGroupModal.tsx
import { useState, useMemo, useRef } from "react";
import { 
  Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter, DialogClose 
} from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Search, Check, Loader2, Users, X, Camera, ImagePlus } from "lucide-react";
import { useQuery } from "@tanstack/react-query";
import { getFriends } from "@/services/api/connection.api.service";
import { createGroupConversation } from "../../chat/services/chat.api.service";
import { useSocialChatStore } from "../hooks/useSocialChatStore";
import { cn } from "@/shared/lib/utils";
import { toast } from "sonner";
import { motion, AnimatePresence } from "framer-motion";
import { ScrollArea } from "@/shared/components/ui/scroll-area";
import { useAuthStore } from "@/stores/useAuthStore";

interface CreateGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (conversationId: string) => void;
  initialMembers?: string[];
  // Context prop để nhận ngữ cảnh từ bên ngoài (VD: Trang Order)
  context?: {
    referenceId: string;
    referenceType: "ORDER" | "DESIGN" | "PRODUCT" | "NONE";
    metadata?: any;
  };
}

export function CreateGroupModal({ isOpen, onClose, onSuccess, initialMembers = [], context }: CreateGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [description, setDescription] = useState("");
  const [selectedMembers, setSelectedMembers] = useState<string[]>(initialMembers);
  const [searchTerm, setSearchTerm] = useState("");
  const [isCreating, setIsCreating] = useState(false);
  
  // Avatar State
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const { setConversations, conversations } = useSocialChatStore();
  const currentUser = useAuthStore(s => s.user);

  const { data: friendsData, isLoading: isLoadingFriends } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
    enabled: isOpen,
  });

  const friendsList = useMemo(() => 
    friendsData?.data?.friends || friendsData?.data?.connections || [], 
  [friendsData]);

  const filteredFriends = useMemo(() => {
    return friendsList.filter((f: any) => {
       const friend = f.friend || (f.requester?._id ? (f.requester._id === currentUser?._id ? f.recipient : f.requester) : f);
       const name = friend.displayName || friend.username || "";
       return name.toLowerCase().includes(searchTerm.toLowerCase());
    });
  }, [friendsList, searchTerm, currentUser]);

  const toggleMember = (userId: string) => {
    if (selectedMembers.includes(userId)) {
      setSelectedMembers(selectedMembers.filter(id => id !== userId));
    } else {
      setSelectedMembers([...selectedMembers, userId]);
    }
  };

  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error("Ảnh tối đa 5MB");
      setAvatarFile(file);
      const objectUrl = URL.createObjectURL(file);
      setAvatarPreview(objectUrl);
    }
  };

  const handleCreate = async () => {
    if (!groupName.trim()) return toast.error("Vui lòng nhập tên nhóm");
    if (selectedMembers.length < 1) return toast.error("Chọn ít nhất 1 thành viên");

    setIsCreating(true);
    try {
      const res = await createGroupConversation({
        title: groupName,
        description,
        members: selectedMembers,
        avatarFile,
        context // Truyền context nếu có (từ trang Order/Design)
      });
      
      if (res && res.conversation) {
        const newConv = res.conversation;
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
      setDescription("");
      setSelectedMembers(initialMembers);
      setSearchTerm("");
      setAvatarFile(null);
      setAvatarPreview(null);
    }, 300);
  };

  const selectedUsersInfo = friendsList.filter((f: any) => {
    const friend = f.friend || (f.requester?._id ? (f.requester._id === currentUser?._id ? f.recipient : f.requester) : f);
    return selectedMembers.includes(friend._id || friend.id);
  }).map((f: any) => f.friend || (f.requester?._id ? (f.requester._id === currentUser?._id ? f.recipient : f.requester) : f));

  return (
    <Dialog open={isOpen} onOpenChange={handleClose}>
      <DialogContent className="w-full h-[100dvh] sm:h-[85vh] sm:max-w-[550px] p-0 gap-0 overflow-hidden bg-white sm:rounded-2xl rounded-none flex flex-col shadow-2xl border-0">
        
        <DialogHeader className="p-5 border-b border-gray-100 flex flex-row items-center justify-between shrink-0 bg-white z-20">
          <DialogTitle className="text-xl font-bold flex items-center gap-2 text-gray-900">
            <div className="w-8 h-8 rounded-full bg-blue-50 flex items-center justify-center text-blue-600">
               <Users size={18} />
            </div>
            Tạo nhóm mới
          </DialogTitle>
          <DialogClose asChild>
             <Button variant="ghost" size="icon" className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100"><X size={20}/></Button>
          </DialogClose>
        </DialogHeader>

        <div className="flex-1 overflow-y-auto custom-scrollbar bg-white">
          <div className="p-5 space-y-6">
            
            {/* 1. Group Info (Avatar + Name) */}
            <div className="flex flex-col sm:flex-row gap-4 items-start">
                <div className="flex flex-col items-center gap-2 mx-auto sm:mx-0">
                    <div 
                        onClick={() => fileInputRef.current?.click()}
                        className="w-20 h-20 rounded-full bg-gray-100 border-2 border-dashed border-gray-300 flex items-center justify-center cursor-pointer hover:bg-gray-50 hover:border-blue-400 transition-all overflow-hidden relative group"
                    >
                        {avatarPreview ? (
                            <img src={avatarPreview} className="w-full h-full object-cover" />
                        ) : (
                            <Camera className="text-gray-400 group-hover:text-blue-500" size={24} />
                        )}
                        <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                            <ImagePlus className="text-white" size={20} />
                        </div>
                    </div>
                    <input 
                        type="file" 
                        ref={fileInputRef} 
                        className="hidden" 
                        accept="image/*"
                        onChange={handleImageSelect}
                    />
                    <span className="text-[10px] text-gray-400">Ảnh nhóm</span>
                </div>

                <div className="flex-1 w-full space-y-3">
                    <Input 
                        placeholder="Tên nhóm (Bắt buộc)" 
                        value={groupName}
                        onChange={(e) => setGroupName(e.target.value)}
                        className="bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 font-semibold text-gray-900"
                    />
                    <Input 
                        placeholder="Mô tả ngắn (Tùy chọn)" 
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        className="bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-500 text-sm"
                    />
                </div>
            </div>

            {/* 2. Selected Members */}
            <AnimatePresence>
              {selectedUsersInfo.length > 0 && (
                <motion.div 
                  initial={{ opacity: 0, height: 0 }}
                  animate={{ opacity: 1, height: "auto" }}
                  exit={{ opacity: 0, height: 0 }}
                  className="overflow-hidden bg-blue-50/50 rounded-xl p-3 border border-blue-100"
                >
                  <label className="text-xs font-semibold text-blue-700 mb-2 block uppercase tracking-wider">
                    Thành viên ({selectedMembers.length})
                  </label>
                  <div className="flex gap-2 overflow-x-auto pb-1 no-scrollbar">
                    {selectedUsersInfo.map((user: any) => (
                      <div 
                        key={user._id}
                        className="flex items-center gap-2 bg-white pl-1 pr-2 py-1 rounded-full border border-blue-100 shadow-sm shrink-0"
                      >
                         <div className="w-6 h-6 rounded-full bg-gray-200 overflow-hidden">
                             {user.avatarUrl ? <img src={user.avatarUrl} className="w-full h-full object-cover"/> : null}
                         </div>
                         <span className="text-xs font-medium text-gray-700 max-w-[80px] truncate">
                            {user.displayName || user.username}
                         </span>
                         <button onClick={() => toggleMember(user._id)} className="text-gray-400 hover:text-red-500">
                            <X size={14} />
                         </button>
                      </div>
                    ))}
                  </div>
                </motion.div>
              )}
            </AnimatePresence>

            {/* 3. Search List */}
            <div className="space-y-3">
              <div className="relative group">
                 <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 group-focus-within:text-blue-500 transition-colors" size={18}/>
                 <Input 
                    placeholder="Tìm người liên hệ..." 
                    className="pl-10 h-11 bg-white border-gray-200 rounded-xl focus:border-blue-500 focus:ring-0 transition-all"
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                 />
              </div>
              
              <ScrollArea className="h-[250px] pr-3 -mr-3">
                 {isLoadingFriends ? (
                   <div className="flex justify-center py-10"><Loader2 className="animate-spin text-gray-400"/></div>
                 ) : filteredFriends.length === 0 ? (
                   <div className="flex flex-col items-center justify-center py-10 text-gray-400">
                      <p className="text-sm">Không tìm thấy ai phù hợp</p>
                   </div>
                 ) : (
                   <div className="grid grid-cols-1 gap-1">
                      {filteredFriends.map((conn: any) => {
                         const friend = conn.friend || (conn.requester?._id ? (conn.requester._id === currentUser?._id ? conn.recipient : conn.requester) : conn);
                         const userId = friend._id || friend.id;
                         if(!userId) return null;
                         const isSelected = selectedMembers.includes(userId);

                         return (
                           <div 
                              key={userId} 
                              onClick={() => toggleMember(userId)}
                              className={cn(
                                "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border",
                                isSelected 
                                  ? "bg-blue-50 border-blue-200" 
                                  : "bg-white border-transparent hover:bg-gray-50 hover:border-gray-100"
                              )}
                           >
                              <div className="relative">
                                <div className="w-10 h-10 rounded-full bg-gray-100 overflow-hidden">
                                   {friend.avatarUrl ? (
                                     <img src={friend.avatarUrl} className="w-full h-full object-cover"/>
                                   ) : (
                                     <div className="w-full h-full flex items-center justify-center text-gray-500 font-bold text-sm">
                                       {(friend.displayName || friend.username)?.[0]?.toUpperCase()}
                                     </div>
                                   )}
                                </div>
                                {isSelected && <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white"><Check size={10} strokeWidth={4}/></div>}
                              </div>
                              
                              <div className="flex-1 min-w-0">
                                 <h4 className="text-sm font-semibold text-gray-900 truncate">{friend.displayName || friend.username}</h4>
                                 <p className="text-xs text-gray-500 truncate">@{friend.username}</p>
                              </div>
                           </div>
                         )
                      })}
                   </div>
                 )}
              </ScrollArea>
            </div>
          </div>
        </div>

        <DialogFooter className="p-5 border-t border-gray-100 bg-gray-50/50 flex-row gap-3">
             <Button variant="outline" onClick={handleClose} disabled={isCreating} className="flex-1 rounded-xl">Hủy</Button>
             <Button 
                  onClick={handleCreate} 
                  disabled={isCreating || !groupName || selectedMembers.length < 1} 
                  className="flex-1 bg-blue-600 hover:bg-blue-700 text-white rounded-xl shadow-lg shadow-blue-600/20"
              >
                {isCreating ? <Loader2 className="w-4 h-4 mr-2 animate-spin"/> : <Users size={18} className="mr-2" />}
                Tạo nhóm
             </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}