// src/components/Chatbar.tsx (ĐÃ SỬA)
// Component này SẼ NHẬN state và logic từ component cha (ChatAppPage)
// để trở thành một "dumb component"

import { Paperclip, Image, Send } from "lucide-react";
import { useState, useRef, useEffect } from "react";
import { toast } from "sonner";
import { ChatMessage } from "../types/chat"; // 👈 SỬA LỖI: Đổi thành đường dẫn tương đối
import { ChatMessages } from "./ChatMessages"; // 👈 SỬA LỖI: Đổi thành đường dẫn tương đối

// --- SỬA LẠI INTERFACE PROPS ---
// Thêm tất cả các props mà ChatAppPage sẽ truyền xuống
interface ChatBarProps {
  messages: ChatMessage[];
  isLoadingAI: boolean;
  isExpanded: boolean;
  setIsExpanded: (expanded: boolean) => void;
  onSendMessage: (
    text: string,
    latitude?: number,
    longitude?: number
  ) => Promise<void>;
}

export function ChatBar({
  messages, // 👈 Nhận từ props
  isLoadingAI, // 👈 Nhận từ props
  isExpanded, // 👈 Nhận từ props
  setIsExpanded, // 👈 Nhận từ props
  onSendMessage, // 👈 Nhận từ props
}: ChatBarProps) {
  const [message, setMessage] = useState("");
  const chatRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // --- BỎ CÁC STATE NỘI BỘ (ĐÃ CHUYỂN LÊN CHA) ---
  // const [messages, setMessages] = useState<ChatMessage[]>(initialMessages);
  // const [isLoadingAI, setIsLoadingAI] = useState(false);

  const handleInput = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    setMessage(e.target.value);
    if (textareaRef.current) {
      textareaRef.current.style.height = "auto";
      textareaRef.current.style.height =
        textareaRef.current.scrollHeight + "px";
    }
  };

  const suggestedPrompts = [
    { text: "Gợi ý : " },
    { text: "Làm 100 card visit cho công ty", color: "blue" },
    { text: "In poster sự kiện 60x90cm", color: "pink" },
  ];

  // Thu gọn khi click/touch ra ngoài
  useEffect(() => {
    const handleOutside = (event: Event) => {
      if (chatRef.current && !chatRef.current.contains(event.target as Node)) {
        setIsExpanded(false); // 👈 Sử dụng prop setIsExpanded
      }
    };

    document.addEventListener("mousedown", handleOutside);
    document.addEventListener("touchstart", handleOutside);

    return () => {
      document.removeEventListener("mousedown", handleOutside);
      document.removeEventListener("touchstart", handleOutside);
    };
  }, [setIsExpanded]); // 👈 Thêm dependency

  // --- SỬA LẠI HÀM SEND ---
  const handleSend = async () => {
    if (!message.trim() || isLoadingAI) return;

    setIsExpanded(true); // 👈 Sử dụng prop
    const textToSend = message.trim();
    setMessage(""); // Xóa input ngay lập tức
    if (textareaRef.current) textareaRef.current.style.height = "40px";

    try {
      // Lấy vị trí
      const position = await new Promise<GeolocationPosition | null>(
        (resolve) => {
          navigator.geolocation.getCurrentPosition(
            (pos) => resolve(pos),
            () => resolve(null) // Vẫn resolve null nếu bị từ chối
          );
        }
      );

      // Gọi hàm onSendMessage từ props (logic đã chuyển lên ChatAppPage)
      await onSendMessage(
        textToSend,
        position?.coords.latitude,
        position?.coords.longitude
      );
    } catch (err: any) {
      console.error(err);
      toast.error(
        err.response?.data?.message || "AI đang gặp lỗi, thử lại sau!"
      );
      // Logic rollback (xóa tin nhắn user) đã được xử lý ở ChatAppPage
    }
    // Không cần finally, vì isLoadingAI được quản lý bởi cha
  };

  return (
    <div
      ref={chatRef}
      className={`w-full max-w-4xl mx-auto rounded-3xl transition-all duration-500
        hover:border-gray-300 hover:shadow-lg hover:shadow-gray-200
        ${isExpanded ? "h-[550px]" : "h-[290px]"} 
      `} // 👈 Sử dụng prop isExpanded
    >
      <div className="relative bg-white/90 backdrop-blur-lg rounded-3xl shadow-xl border border-gray-200/50 p-6 h-full flex flex-col">
        {/* Header */}
        <div className="flex items-start gap-3 mb-4">
          <div className="w-10 h-10 rounded-full bg-gradient-to-br from-purple-500 to-blue-500 flex items-center justify-center flex-shrink-0">
            <span className="text-lg">🤖</span>
          </div>
          <div>
            <p className="text-gray-700 mb-1">
              Xin chào! Tôi là chuyên gia in ấn{" "}
              <span className="bg-gradient-to-r from-purple-600 to-blue-600 bg-clip-text text-transparent">
                PrintZ
              </span>{" "}
              👋
            </p>
            {messages.length === 0 && ( // 👈 Sử dụng prop messages
              <p className="text-xs text-gray-500">
                Chào bạn! Tôi là trợ lý in ấn thông minh. Tôi có thể tư vấn về
                mẫu, kích thước, tính giá, nhận file,... và giao đơn tận nơi.
                Bạn cần in gì ạ?
              </p>
            )}
          </div>
        </div>

        {/* Nội dung chat */}
        <div className="flex-1 overflow-hidden mb-3 -mx-6 px-2">
          {/* 👈 Truyền props messages và isLoadingAI xuống */}
          <ChatMessages messages={messages} isLoadingAI={isLoadingAI} />
        </div>

        {/* Suggested Prompts */}
        {messages.length === 0 &&
          message.length === 0 && ( // 👈 Sử dụng prop messages
            <div className="flex flex-wrap gap-2 mb-3">
              {suggestedPrompts.map((prompt, index) => (
                <button
                  key={index}
                  onClick={() => {
                    setMessage(prompt.text);
                    setIsExpanded(true); // 👈 Sử dụng prop
                    textareaRef.current?.focus();
                  }}
                  className={`px-3 py-1.5 rounded-full text-xs border transition-all flex items-center gap-1
                  bg-${prompt.color}-50 hover:bg-${prompt.color}-100 text-${prompt.color}-700 border-${prompt.color}-200
                  hover:shadow-md
                `}
                >
                  <span>{prompt.text}</span>
                </button>
              ))}
            </div>
          )}

        {/* Footer + Textarea */}
        <div className="flex-shrink-0 border-t border-gray-200 pt-3">
          <textarea
            ref={textareaRef}
            value={message}
            onChange={handleInput}
            onFocus={() => setIsExpanded(true)} // 👈 Sử dụng prop
            placeholder="Hãy nói cho PrintZ biết bạn muốn in gì nhé…"
            className="w-full border rounded-3xl px-3 py-2 mb-2 outline-none placeholder:text-gray-400 overflow-hidden disabled:bg-gray-50"
            style={{ fontSize: "16px", minHeight: "40px", maxHeight: "200px" }}
            disabled={isLoadingAI} // 👈 Sử dụng prop
            onKeyDown={(e) => {
              if (e.key === "Enter" && !e.shiftKey) {
                e.preventDefault();
                handleSend();
              }
            }}
          />

          {/* Nút bấm */}
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-3 mb-2">
              {[
                { icon: Paperclip, label: "Đính kèm file (sắp có)" },
                { icon: Image, label: "Gửi ảnh (sắp có)" },
              ].map(({ icon: Icon, label }, i) => (
                <button
                  key={i}
                  className="p-2 rounded-lg transition-colors text-gray-400 opacity-50 cursor-not-allowed"
                  disabled
                  title={label}
                >
                  <Icon size={20} />
                </button>
              ))}
            </div>
            <button
              onClick={handleSend}
              className="px-6 py-3 bg-blue-500 hover:bg-blue-600 text-white rounded-2xl flex items-center gap-2 shadow-md hover:shadow-blue-200 transition-all duration-200 disabled:bg-gray-400 disabled:cursor-not-allowed"
              disabled={isLoadingAI || !message.trim()} // 👈 Sử dụng prop
            >
              {isLoadingAI ? ( // 👈 Sử dụng prop
                "Đang nghĩ..."
              ) : (
                <>
                  <Send size={18} />
                  <span>Gửi</span>
                </>
              )}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
