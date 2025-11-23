// apps/customer-frontend/src/features/social/components/SocialChatListener.tsx
// ✅ CHUYÊN GIA FIX: Rich Toast UI, Sound Policy Unlock

import { useEffect, useRef } from "react";
import { useSocket } from "@/contexts/SocketProvider";
import { useAuthStore } from "@/stores/useAuthStore";
import { useConnectionStore } from "@/stores/useConnectionStore";
import { toast } from "sonner";
import { useNavigate, useLocation } from "react-router-dom";
import { useSocialChatStore } from "../hooks/useSocialChatStore";
import { fetchConversationById } from "../../chat/services/chat.api.service";

// Sound effect
const NOTIFICATION_SOUND = "/sounds/message-pop.mp3";

export const SocialChatListener = () => {
  const { socket } = useSocket();
  const { user } = useAuthStore();
  const { updateFriendStatus } = useConnectionStore();
  const navigate = useNavigate();
  const location = useLocation();
  const audioRef = useRef<HTMLAudioElement | null>(null);
  const { 
    handleSocketMessage, 
    conversations, 
    addConversation, 
    updateParticipantStatus // ✅ Lấy hàm update Chat List
  } = useSocialChatStore();

  // 1. Init Audio
  useEffect(() => {
    audioRef.current = new Audio(NOTIFICATION_SOUND);
    audioRef.current.volume = 0.6; // Âm lượng vừa phải

    // Mẹo: Unlock audio context khi user click bất kỳ đâu lần đầu
    const unlockAudio = () => {
      if (audioRef.current) {
        audioRef.current
          .play()
          .then(() => {
            audioRef.current!.pause();
            audioRef.current!.currentTime = 0;
          })
          .catch(() => {});
      }
      document.removeEventListener("click", unlockAudio);
    };
    document.addEventListener("click", unlockAudio);

    return () => document.removeEventListener("click", unlockAudio);
  }, []);

  // 2. Request Permission Notification
  useEffect(() => {
    if ("Notification" in window && Notification.permission === "default") {
      Notification.requestPermission();
    }
  }, []);

  useEffect(() => {
    if (!socket || !user) return;

    // Xử lý tin nhắn đến (để cập nhật badge số lượng tin chưa đọc)
    // ✅ FIXED: Chỉ xử lý messages từ social chat (không phải bot chat)
    const handleNewMessage = async (data: any) => {
      // Bỏ qua messages từ AI bot
      if (data.senderType === "AI") {
        return;
      }

      // ✅ FIXED: Nếu conversation chưa có trong list, fetch từ API
      const conversationExists = conversations.find(
        (c) => c._id === data.conversationId
      );
      
      if (!conversationExists) {
        try {
          const conv = await fetchConversationById(data.conversationId);
          if (conv) {
            addConversation(conv);
          }
        } catch (error) {
          console.warn("[Listener] Failed to fetch conversation:", error);
        }
      }

      handleSocketMessage(data);
    };

    // ✅ LẮNG NGHE EVENT "notification" TỪ BACKEND (Payload chuẩn cho thông báo)
    // ✅ FIXED: Chỉ social chat mới emit "notification", bot chat không emit
    const handleNotification = (data: any) => {
      // Data structure từ backend: { type, title, body, data: { conversationId, senderId } }
      // ✅ Đảm bảo chỉ xử lý notification từ social chat (không phải bot chat)

      // Kiểm tra: Nếu đang ở đúng trang chat của hội thoại này thì KHÔNG báo
      const currentPath = location.pathname;
      const currentParams = new URLSearchParams(location.search);
      const activeConvId = currentParams.get("conversationId");

      if (
        currentPath.includes("/messages") &&
        activeConvId === data.data.conversationId
      ) {
        return; // Đang chat với người này thì thôi, không hiện popup
      }

      // 1. Phát âm thanh
      try {
        audioRef.current
          ?.play()
          .catch((e) => console.warn("Audio blocked:", e));
      } catch (e) {}

      // 2. Browser Notification (Nếu tab ẩn)
      if (document.hidden && Notification.permission === "granted") {
        const n = new Notification(data.title, {
          body: data.body,
          icon: "/logo-printz.png",
          tag: "chat-msg",
        });
        n.onclick = () => {
          window.focus();
          navigate(`/messages?conversationId=${data.data.conversationId}`);
        };
      }

      // 3. ✅ RICH TOAST (Menu nổi xịn xò)
      toast.custom(
        (t) => (
          <div
            className="flex w-full max-w-md bg-white shadow-xl rounded-lg pointer-events-auto ring-1 ring-black ring-opacity-5 overflow-hidden cursor-pointer hover:bg-gray-50 transition-colors"
            onClick={() => {
              toast.dismiss(t);
              navigate(`/messages?conversationId=${data.data.conversationId}`);
            }}
          >
            <div className="flex-1 w-0 p-4">
              <div className="flex items-start">
                <div className="flex-shrink-0 pt-0.5">
                  <div className="h-10 w-10 rounded-full bg-gradient-to-br from-blue-500 to-purple-600 flex items-center justify-center text-white font-bold">
                    <span className="text-sm">MSG</span>
                  </div>
                </div>
                <div className="ml-3 flex-1">
                  <p className="text-sm font-medium text-gray-900">
                    {data.title}
                  </p>
                  <p className="mt-1 text-sm text-gray-500 line-clamp-2">
                    {data.body}
                  </p>
                </div>
              </div>
            </div>
            <div className="flex border-l border-gray-200">
              <button className="w-full border border-transparent rounded-none rounded-r-lg p-4 flex items-center justify-center text-sm font-medium text-blue-600 hover:text-blue-500 focus:outline-none">
                Trả lời
              </button>
            </div>
          </div>
        ),
        { duration: 5000, position: "top-right" }
      );
    };

    // ✅ LẮNG NGHE STATUS CHANGE: Cập nhật CẢ HAI store
    const handleStatusChange = (data: { userId: string; isOnline: boolean }) => {
      // 1. Cập nhật store Danh bạ (ConnectionStore)
      updateFriendStatus(data.userId, data.isOnline);
      
      // 2. Cập nhật store Tin nhắn (SocialChatStore) -> Để ChatWindow và ConversationList đổi màu
      updateParticipantStatus(data.userId, data.isOnline);
      
      console.log(`[Status] User ${data.userId} is now ${data.isOnline ? 'Online' : 'Offline'}`);
    };

    socket.on("new_message", handleNewMessage);
    socket.on("notification", handleNotification); // Backend bạn có emit cái này trong social-chat.service.js
    socket.on("user_status_change", handleStatusChange); // ✅ Lắng nghe status change

    return () => {
      socket.off("new_message", handleNewMessage);
      socket.off("notification", handleNotification);
      socket.off("user_status_change", handleStatusChange);
    };
  }, [socket, user, location, navigate, handleSocketMessage, conversations, addConversation, updateFriendStatus, updateParticipantStatus]);

  return null;
};
