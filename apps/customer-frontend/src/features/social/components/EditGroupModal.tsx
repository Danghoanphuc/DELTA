import { useState, useRef, useEffect, useMemo } from "react";
import { Dialog, DialogContent, DialogHeader, DialogTitle, DialogFooter } from "@/shared/components/ui/dialog";
import { Input } from "@/shared/components/ui/input";
import { Button } from "@/shared/components/ui/button";
import { Camera, Save, Loader2, Trash2, UserPlus, ArrowLeft, Search, Check, X } from "lucide-react";
import { toast } from "sonner";
import { updateGroupConversation } from "../../chat/services/chat.api.service";
import { useQueryClient, useQuery } from "@tanstack/react-query";
import { useAuthStore } from "@/stores/useAuthStore";
import { useSocialChatStore } from "../hooks/useSocialChatStore";
import { getFriends } from "@/services/api/connection.api.service";
import { cn } from "@/shared/lib/utils";
import { ScrollArea } from "@/shared/components/ui/scroll-area";

interface EditGroupModalProps {
  isOpen: boolean;
  onClose: () => void;
  conversation: any;
}

export function EditGroupModal({ isOpen, onClose, conversation }: EditGroupModalProps) {
  const [groupName, setGroupName] = useState("");
  const [avatarPreview, setAvatarPreview] = useState<string | null>(null);
  const [avatarFile, setAvatarFile] = useState<File | null>(null);
  const [membersToRemove, setMembersToRemove] = useState<string[]>([]);
  const [membersToAdd, setMembersToAdd] = useState<string[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  
  // State chuyển màn hình: 'info' | 'add-member'
  const [mode, setMode] = useState<'info' | 'add-member'>('info');
  const [searchTerm, setSearchTerm] = useState("");
  
  const fileInputRef = useRef<HTMLInputElement>(null);
  const queryClient = useQueryClient();
  const currentUser = useAuthStore(s => s.user);
  const { addConversation } = useSocialChatStore(); // ✅ Import store để update Optimistic UI

  // 1. Fetch danh sách bạn bè để chọn thêm
  const { data: friendsData } = useQuery({
    queryKey: ["friends"],
    queryFn: getFriends,
    enabled: mode === 'add-member', // Chỉ fetch khi mở màn hình thêm
  });

  const isAdmin = useMemo(() => {
    if (!conversation || !currentUser) return false;
    const me = conversation.participants.find((p: any) => (p.userId._id || p.userId) === currentUser._id);
    return me?.role === 'admin';
  }, [conversation, currentUser]);

  // ✅ FIX 1: Bỏ logic revokeObjectURL trong useEffect đi
  // Vì chúng ta sẽ dùng Base64, không cần revoke thủ công
  useEffect(() => {
     if(isOpen && conversation) {
         setGroupName(conversation.title || "");
         setAvatarPreview(conversation.avatarUrl);
         setAvatarFile(null);
         setMembersToRemove([]);
         setMembersToAdd([]);
         setMode('info');
         setSearchTerm("");
     }
  }, [isOpen, conversation]);

  // ✅ FIX 2: Dùng FileReader để tạo Base64 (Thay vì createObjectURL)
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) return toast.error("Ảnh tối đa 5MB");
      setAvatarFile(file);

      // Dùng FileReader đọc file thành chuỗi Base64
      const reader = new FileReader();
      reader.onloadend = () => {
        setAvatarPreview(reader.result as string); // Chuỗi này vĩnh cửu trong session
      };
      reader.readAsDataURL(file);
    }
  };

  const handleToggleRemove = (userId: string) => {
    if(userId === currentUser?._id) return toast.error("Không thể tự xóa mình ở đây");
    if(membersToRemove.includes(userId)) {
        setMembersToRemove(membersToRemove.filter(id => id !== userId));
    } else {
        setMembersToRemove([...membersToRemove, userId]);
    }
  };

  const handleToggleAdd = (userId: string) => {
      if(membersToAdd.includes(userId)) {
          setMembersToAdd(membersToAdd.filter(id => id !== userId));
      } else {
          setMembersToAdd([...membersToAdd, userId]);
      }
  };

  const handleUpdate = async () => {
      if (!conversation?._id) return;
      // Không cần isLoading block UI
      
      // 1. OPTIMISTIC UPDATE (Giao diện lạc quan)
      const optimisticConversation = {
          ...conversation,
          title: groupName,
          // ✅ Avatar Base64 sẽ hiển thị ngay lập tức ở List bên ngoài
          // và nó KHÔNG bị mất khi đóng Modal này
          avatarUrl: avatarPreview || conversation.avatarUrl, 
          // Giả lập members đã update (lọc bỏ removed, thêm pending added)
          participants: [
              ...conversation.participants.filter((p: any) => {
                  const pId = p.userId._id || p.userId;
                  return !membersToRemove.includes(pId);
              }),
              // Thêm preview của members mới (sẽ được replace bằng data thật từ server)
              ...membersToAdd.map((id: string) => ({
                  userId: { _id: id, displayName: "Đang thêm...", avatarUrl: null },
                  role: "member",
                  isVisible: true,
                  joinedAt: new Date(),
              })),
          ],
      };
      
      // 2. UPDATE STORE NGAY LẬP TỨC
      addConversation(optimisticConversation);
      toast.success("Đã cập nhật thông tin nhóm");
      
      // 3. ĐÓNG MODAL NGAY (User cảm thấy "nhanh như điện")
      onClose();
      
      try {
          // 4. GỌI API NGẦM (Background Sync)
          const response = await updateGroupConversation({
              conversationId: conversation._id,
              title: groupName,
              avatarFile, // File gốc
              membersToRemove,
              membersToAdd
          });
          
          // 5. KHI SERVER TRẢ VỀ -> Cập nhật lại URL thật từ Cloudinary
          if (response?.data?.conversation) {
              addConversation(response.data.conversation);
          }
          
          // Invalidate queries để sync với server
          queryClient.invalidateQueries({ queryKey: ["socialConversations"] });
          queryClient.invalidateQueries({ queryKey: ["socialMsg", conversation._id] });
      } catch (error) {
          console.error(error);
          toast.error("Lỗi đồng bộ, đang khôi phục...");
          // Rollback nếu lỗi
          addConversation(conversation);
      }
  };

  // Logic lọc bạn bè: Chưa có trong nhóm hiện tại
  const availableFriends = useMemo(() => {
      const list = friendsData?.data?.friends || friendsData?.data?.connections || [];
      const currentParticipantIds = conversation?.participants?.map((p: any) => p.userId._id || p.userId) || [];
      
      return list.filter((f: any) => {
          const friend = f.friend || (f.requester?._id ? (f.requester._id === currentUser?._id ? f.recipient : f.requester) : f);
          const friendId = friend._id || friend.id;
          
          // Loại bỏ những người ĐÃ trong nhóm
          if (currentParticipantIds.includes(friendId)) return false;
          
          // Filter theo search
          const name = friend.displayName || friend.username || "";
          return name.toLowerCase().includes(searchTerm.toLowerCase());
      });
  }, [friendsData, conversation, searchTerm, currentUser]);

  const activeParticipants = conversation?.participants?.filter((p: any) => p.isVisible);

  // --- RENDER ---
  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[450px] bg-white p-0 overflow-hidden gap-0 border-0 shadow-2xl [&>button]:hidden">
        
        {/* HEADER */}
        <DialogHeader className="p-4 border-b border-gray-100 bg-white flex flex-row items-center space-y-0">
          {mode === 'add-member' ? (
              <Button variant="ghost" size="icon" onClick={() => setMode('info')} className="-ml-2 mr-2 h-8 w-8 rounded-full">
                  <ArrowLeft size={18} />
              </Button>
          ) : null}
          <DialogTitle className="text-lg font-bold text-gray-900 flex-1">
             {mode === 'info' ? "Chỉnh sửa nhóm" : "Thêm thành viên"}
          </DialogTitle>
          <Button variant="ghost" size="icon" onClick={onClose} className="h-8 w-8 rounded-full text-gray-400 hover:bg-gray-100">
             <X size={18} />
          </Button>
        </DialogHeader>
        
        <div className="max-h-[70vh] overflow-y-auto custom-scrollbar bg-white">
           
           {/* === MODE: INFO & EDIT === */}
           {mode === 'info' && (
             <div className="p-5 space-y-6">
                {/* Avatar Edit: Fix "Lỏ" bằng key={avatarPreview} */}
                <div className="flex flex-col items-center">
                    <div 
                        onClick={() => isAdmin && fileInputRef.current?.click()}
                        className={cn(
                            "w-24 h-24 rounded-full bg-gray-100 relative group border-4 border-white shadow-md overflow-hidden transition-all",
                            isAdmin ? "cursor-pointer hover:shadow-lg" : "cursor-default"
                        )}
                    >
                        {avatarPreview ? (
                            <img 
                                key={avatarPreview} // ✅ FIX: Force re-render ảnh ngay lập tức
                                src={avatarPreview} 
                                className="w-full h-full object-cover" 
                                alt="Group Avatar"
                                onError={(e) => { e.currentTarget.src = "/default-avatar.png"; }}
                            />
                        ) : (
                            <div className="w-full h-full flex items-center justify-center bg-gradient-to-br from-blue-500 to-purple-600">
                                <span className="text-3xl font-bold text-white">{groupName?.[0]?.toUpperCase() || "G"}</span>
                            </div>
                        )}
                        
                        {isAdmin && (
                            <div className="absolute inset-0 bg-black/30 flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity">
                                <Camera className="text-white drop-shadow-md" size={24}/>
                            </div>
                        )}
                    </div>
                    
                    <input type="file" ref={fileInputRef} className="hidden" accept="image/*" onChange={handleImageSelect}/>
                    
                    {isAdmin && (
                        <button onClick={() => fileInputRef.current?.click()} className="text-sm text-blue-600 font-medium mt-3 hover:underline">
                            Đổi ảnh nhóm
                        </button>
                    )}
                </div>

                {/* Name Edit */}
                <div>
                    <label className="text-xs font-bold text-gray-500 uppercase mb-1.5 block tracking-wider">Tên nhóm</label>
                    <Input 
                        value={groupName} 
                        onChange={(e) => setGroupName(e.target.value)} 
                        className="font-medium h-11 bg-gray-50 border-gray-200 focus:bg-white transition-all"
                        disabled={!isAdmin}
                        placeholder="Đặt tên cho nhóm..."
                    />
                </div>

                {/* Members List */}
                <div>
                    <div className="flex items-center justify-between mb-3">
                        <label className="text-xs font-bold text-gray-500 uppercase tracking-wider">
                            Thành viên ({activeParticipants?.length})
                        </label>
                        {isAdmin && (
                            <Button 
                                variant="ghost" size="sm" 
                                onClick={() => setMode('add-member')}
                                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50 px-2 h-7"
                            >
                                <UserPlus size={14} className="mr-1.5"/> Thêm người
                            </Button>
                        )}
                    </div>
                    
                    {/* List hiện tại */}
                    <div className="space-y-1">
                        {/* Hiển thị những người MỚI thêm (Pending save) */}
                        {membersToAdd.length > 0 && (
                            <div className="px-3 py-2 bg-blue-50 rounded-lg text-xs text-blue-700 mb-2 font-medium flex items-center">
                                <UserPlus size={14} className="mr-2"/> Đang thêm {membersToAdd.length} thành viên mới...
                            </div>
                        )}

                        {conversation?.participants?.filter((p: any) => p.isVisible).map((p: any) => {
                            const isRemoved = membersToRemove.includes(p.userId._id);
                            const isMe = p.userId._id === currentUser?._id;
                            const isRoleAdmin = p.role === 'admin';

                            return (
                                <div key={p.userId._id} className={cn("flex items-center justify-between p-2 rounded-lg hover:bg-gray-50 transition-colors", isRemoved && "opacity-50 bg-red-50 hover:bg-red-50")}>
                                    <div className="flex items-center gap-3 min-w-0">
                                        <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden shrink-0 border border-gray-100">
                                            {p.userId.avatarUrl ? (
                                                <img src={p.userId.avatarUrl} className="w-full h-full object-cover"/>
                                            ) : (
                                                <div className="w-full h-full flex items-center justify-center bg-gray-300 text-gray-600 text-xs font-bold">
                                                    {(p.userId.displayName?.[0] || "?").toUpperCase()}
                                                </div>
                                            )}
                                        </div>
                                        <div className="min-w-0">
                                            <p className={cn("text-sm font-medium truncate", isRemoved && "line-through text-red-500")}>
                                                {p.userId.displayName || p.userId.username} 
                                                {isMe && <span className="text-gray-400 font-normal ml-1">(Bạn)</span>}
                                            </p>
                                            <p className={cn("text-[10px] font-bold uppercase", isRoleAdmin ? "text-blue-600" : "text-gray-400")}>
                                                {p.role}
                                            </p>
                                        </div>
                                    </div>
                                    
                                    {isAdmin && !isMe && (
                                        <Button 
                                            variant="ghost" size="icon" 
                                            onClick={() => handleToggleRemove(p.userId._id)}
                                            className={cn("h-8 w-8 rounded-full", isRemoved ? "text-red-600 bg-red-100" : "text-gray-400 hover:text-red-600 hover:bg-red-50")}
                                        >
                                            {isRemoved ? <ArrowLeft size={14}/> : <Trash2 size={16}/>}
                                        </Button>
                                    )}
                                </div>
                            );
                        })}
                    </div>
                </div>
             </div>
           )}

           {/* === MODE: ADD MEMBER === */}
           {mode === 'add-member' && (
               <div className="p-0 h-[400px] flex flex-col">
                   <div className="p-4 border-b border-gray-100 bg-gray-50/50">
                       <div className="relative">
                           <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={16}/>
                           <Input 
                               placeholder="Tìm tên bạn bè..." 
                               value={searchTerm}
                               onChange={(e) => setSearchTerm(e.target.value)}
                               className="pl-9 bg-white border-gray-200"
                               autoFocus
                           />
                       </div>
                   </div>
                   
                   <ScrollArea className="flex-1 p-2">
                       {availableFriends.length === 0 ? (
                           <div className="text-center py-10 text-gray-400 text-sm">
                               {searchTerm ? "Không tìm thấy ai" : "Không có bạn bè nào khả dụng"}
                           </div>
                       ) : (
                           <div className="space-y-1">
                               {availableFriends.map((f: any) => {
                                   const friend = f.friend || (f.requester?._id ? (f.requester._id === currentUser?._id ? f.recipient : f.requester) : f);
                                   const friendId = friend._id || friend.id;
                                   const isSelected = membersToAdd.includes(friendId);

                                   return (
                                       <div 
                                           key={friendId} 
                                           onClick={() => handleToggleAdd(friendId)}
                                           className={cn(
                                               "flex items-center gap-3 p-3 rounded-xl cursor-pointer transition-all border",
                                               isSelected ? "bg-blue-50 border-blue-200" : "bg-white border-transparent hover:bg-gray-50"
                                           )}
                                       >
                                            <div className="relative">
                                                <div className="w-10 h-10 rounded-full bg-gray-200 overflow-hidden">
                                                    {friend.avatarUrl ? <img src={friend.avatarUrl} className="w-full h-full object-cover"/> : null}
                                                </div>
                                                {isSelected && (
                                                    <div className="absolute -bottom-1 -right-1 bg-blue-500 text-white rounded-full p-0.5 border-2 border-white">
                                                        <Check size={10} strokeWidth={4}/>
                                                    </div>
                                                )}
                                            </div>
                                            <div className="flex-1">
                                                <p className={cn("text-sm font-medium", isSelected ? "text-blue-700" : "text-gray-900")}>
                                                    {friend.displayName || friend.username}
                                                </p>
                                                <p className="text-xs text-gray-500">@{friend.username}</p>
                                            </div>
                                       </div>
                                   )
                               })}
                           </div>
                       )}
                   </ScrollArea>
               </div>
           )}
        </div>

        {/* FOOTER */}
        <DialogFooter className="p-4 border-t border-gray-100 bg-gray-50 flex gap-3">
          {mode === 'info' ? (
              <>
                <Button variant="outline" onClick={onClose} className="flex-1 rounded-xl border-gray-200">
                    Hủy
                </Button>
                {isAdmin && (
                    <Button 
                        onClick={handleUpdate} 
                        className="flex-1 bg-blue-600 hover:bg-blue-700 text-white shadow-lg shadow-blue-600/20 rounded-xl"
                    >
                        <Save size={16} className="mr-2"/> 
                        Lưu thay đổi {membersToAdd.length > 0 && `(+${membersToAdd.length})`}
                    </Button>
                )}
              </>
          ) : (
              <Button onClick={() => setMode('info')} className="w-full bg-blue-600 hover:bg-blue-700 text-white rounded-xl">
                  Xong ({membersToAdd.length})
              </Button>
          )}
        </DialogFooter>
      </DialogContent>
    </Dialog>
  );
}