// apps/customer-frontend/src/features/chat/hooks/useSmartChatInput.ts
import { useState, useCallback, useRef } from "react";

export type LinkType = "canva" | "drive" | "general";

export interface LinkAttachment {
  id: string;
  url: string;
  type: LinkType;
  title: string;
}

interface UseSmartInputProps {
  onSendRaw: (text: string) => void | Promise<void>;
  triggerActions?: {
    openCanva?: () => void;
    openDrive?: () => void;
    openUpload?: () => void;
  };
}

// Regex an toàn hơn, tránh bắt nhầm dấu chấm câu cuối câu
const URL_REGEX = /(https?:\/\/[^\s]+)/g;

export function useSmartChatInput({
  onSendRaw,
  triggerActions,
}: UseSmartInputProps) {
  const [message, setMessage] = useState("");
  const [links, setLinks] = useState<LinkAttachment[]>([]);
  const [showSlashMenu, setShowSlashMenu] = useState(false);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  // ✅ SAFE PARSER: Bọc try-catch để không bao giờ crash UI
  const detectLinkType = (url: string): { type: LinkType; title: string } => {
    try {
      const lowerUrl = url.toLowerCase();
      if (lowerUrl.includes("canva.com"))
        return { type: "canva", title: "Canva Design" };
      if (
        lowerUrl.includes("drive.google.com") ||
        lowerUrl.includes("docs.google.com")
      )
        return { type: "drive", title: "Google Drive" };

      const hostname = new URL(url).hostname.replace("www.", "");
      return {
        type: "general",
        title: hostname,
      };
    } catch (e) {
      return { type: "general", title: "Liên kết" };
    }
  };

  const addLink = useCallback((url: string) => {
    // Validate URL cơ bản trước khi add
    if (!url.startsWith("http")) return;

    const { type, title } = detectLinkType(url);
    setLinks((prev) => {
      if (prev.some((l) => l.url === url)) return prev;
      return [
        ...prev,
        { id: Date.now() + Math.random().toString(), url, type, title },
      ];
    });
  }, []);

  const removeLink = useCallback((id: string) => {
    setLinks((prev) => prev.filter((l) => l.id !== id));
  }, []);

  const handleInputChange = (e: React.ChangeEvent<HTMLTextAreaElement>) => {
    const val = e.target.value;
    setMessage(val);

    // Trigger menu Slash thông minh hơn (chỉ hiện khi gõ / ở đầu dòng hoặc sau dấu cách)
    if (val === "/" || val.endsWith(" /") || val.endsWith("\n/")) {
      setShowSlashMenu(true);
    } else if (showSlashMenu && !val.includes("/")) {
      setShowSlashMenu(false);
    }
  };

  const handlePaste = (e: React.ClipboardEvent) => {
    // 1. Paste File (Xử lý ở tầng ChatInput, return false để ChatInput biết mà handle tiếp)
    const items = e.clipboardData.items;
    let hasFile = false;
    for (const item of items) {
      if (item.kind === "file") hasFile = true;
    }
    if (hasFile) return { handled: false };

    // 2. Paste Text/Link
    const pastedText = e.clipboardData.getData("text");
    const matches = pastedText.match(URL_REGEX);

    if (matches && matches.length > 0) {
      e.preventDefault();
      matches.forEach((url) => {
        // Clean URL (bỏ dấu chấm/phẩy cuối câu nếu có)
        const cleanUrl = url.replace(/[.,;!)]+$/, "");
        addLink(cleanUrl);
      });

      // Xóa link khỏi text paste để ô nhập liệu gọn gàng
      const cleanText = pastedText.replace(URL_REGEX, "").trim();
      if (cleanText) setMessage((prev) => prev + " " + cleanText);

      return { handled: true };
    }
    return { handled: false };
  };

  const handleKeyDown = (e: React.KeyboardEvent) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
      return;
    }
    if (
      showSlashMenu &&
      (e.key === "Escape" || (e.key === "Backspace" && message.endsWith("/")))
    ) {
      setShowSlashMenu(false);
    }
  };

  const executeSlashCommand = (command: "canva" | "drive" | "upload") => {
    const cleanMsg = message.replace(/\/+$/, "").replace(/^\/+/, "").trim();
    setMessage(cleanMsg);
    setShowSlashMenu(false);

    if (command === "canva") triggerActions?.openCanva?.();
    if (command === "drive") triggerActions?.openDrive?.();
    if (command === "upload") triggerActions?.openUpload?.();

    setTimeout(() => textareaRef.current?.focus(), 50);
  };

  const handleSend = async () => {
    let finalMsg = message.trim();

    if (finalMsg.startsWith("/")) {
      finalMsg = finalMsg.substring(1).trim();
    }

    if (!finalMsg && links.length === 0) return;

    // Encode links vào message body để Backend/AI nhận biết context
    if (links.length > 0) {
      const linkString = links
        .map((l) => `[LINK_ATTACHMENT: ${l.type.toUpperCase()}] ${l.url}`)
        .join("\n");

      if (finalMsg) {
        finalMsg += `\n\n${linkString}`;
      } else {
        finalMsg = linkString;
      }
    }

    await onSendRaw(finalMsg);

    // Reset
    setMessage("");
    setLinks([]);
    setShowSlashMenu(false);
  };

  return {
    message,
    setMessage,
    links,
    addLink,
    removeLink,
    showSlashMenu,
    executeSlashCommand,
    handleInputChange,
    handlePaste,
    handleKeyDown,
    handleSend,
    textareaRef,
  };
}
