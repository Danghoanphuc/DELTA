// hooks/useMessageActions.ts - Smart message actions hook
import { useState } from "react";
import { toast } from "@/shared/utils/toast";
import { useFileActions } from "../../ChatInfoSidebar/useFileActions";

interface UseMessageActionsProps {
  conversationId: string;
  currentUserId?: string;
  onReply?: (message: any) => void;
}

export function useMessageActions({
  conversationId,
  currentUserId,
  onReply,
}: UseMessageActionsProps) {
  const [isCopied, setIsCopied] = useState(false);
  const { handleDownload, handleDelete, isDeleting } = useFileActions(
    conversationId,
    currentUserId
  );

  // Smart Copy: Text or Image
  const handleCopy = async (message: any) => {
    const content = message.content;
    const attachments = content?.attachments || [];

    // Priority 1: Copy image if exists
    const imageAttachment = attachments.find(
      (att: any) =>
        att.type === "image" || att.url?.match(/\.(jpeg|jpg|png|webp|heic)$/i)
    );

    if (imageAttachment?.url) {
      try {
        // Check if Clipboard API supports images
        if (!navigator.clipboard.write) {
          throw new Error("Clipboard API not supported");
        }

        const imageUrl = imageAttachment.url;
        let blob: Blob;

        // Check if same origin or has CORS support
        const isSameOrigin =
          imageUrl.startsWith("/") ||
          imageUrl.startsWith(window.location.origin);

        if (isSameOrigin) {
          // Same origin - use fetch directly
          const response = await fetch(imageUrl);
          if (!response.ok) throw new Error("Failed to fetch image");
          blob = await response.blob();
        } else {
          // Cross-origin - use canvas method
          const img = new Image();
          img.crossOrigin = "anonymous";

          await new Promise((resolve, reject) => {
            img.onload = resolve;
            img.onerror = () =>
              reject(new Error("CORS blocked or load failed"));
            img.src = imageUrl;
          });

          // Convert to canvas
          const canvas = document.createElement("canvas");
          canvas.width = img.naturalWidth || img.width;
          canvas.height = img.naturalHeight || img.height;
          const ctx = canvas.getContext("2d");

          if (!ctx) throw new Error("Cannot get canvas context");

          ctx.drawImage(img, 0, 0);

          // Convert to blob
          blob = await new Promise<Blob>((resolve, reject) => {
            canvas.toBlob(
              (b) => {
                if (b) resolve(b);
                else reject(new Error("Failed to create blob"));
              },
              "image/png",
              1.0
            );
          });
        }

        // Ensure blob type is valid
        const validType =
          blob.type === "image/png" || blob.type === "image/jpeg"
            ? blob.type
            : "image/png";

        // Copy to clipboard
        await navigator.clipboard.write([
          new ClipboardItem({ [validType]: blob }),
        ]);

        setIsCopied(true);
        toast.success("Đã sao chép ảnh");
        setTimeout(() => setIsCopied(false), 2000);
        return;
      } catch (error: any) {
        console.error("Copy image failed:", error);

        // Fallback: Copy image URL instead
        try {
          await navigator.clipboard.writeText(imageAttachment.url);
          setIsCopied(true);
          toast.success("Đã sao chép link ảnh (CORS blocked)");
          setTimeout(() => setIsCopied(false), 2000);
          return;
        } catch (fallbackError) {
          toast.error("Không thể sao chép");
          return;
        }
      }
    }

    // Priority 2: Copy text
    const text = content?.text;
    if (text) {
      const div = document.createElement("div");
      div.innerHTML = text;
      const plainText = div.textContent || div.innerText || "";
      if (plainText) {
        try {
          await navigator.clipboard.writeText(plainText);
          setIsCopied(true);
          toast.success("Đã sao chép");
          setTimeout(() => setIsCopied(false), 2000);
          return;
        } catch (error) {
          toast.error("Không thể sao chép");
          return;
        }
      }
    }

    toast.info("Không có nội dung để sao chép");
  };

  // Smart Reply
  const handleReply = (message: any) => {
    if (onReply) {
      onReply(message);
    } else {
      toast.info("Chức năng trả lời đang phát triển");
    }
  };

  // Smart Download
  const handleDownloadAttachment = async (message: any) => {
    const attachments = message.content?.attachments || [];
    if (attachments.length === 0) {
      toast.info("Không có file để tải");
      return;
    }

    // Download first attachment (or all in future)
    const file = attachments[0];
    await handleDownload(file.url, file.originalName || "file");
  };

  // Smart Delete
  const handleDeleteMessage = (message: any, deleteForEveryone = false) => {
    const senderId =
      typeof message.sender === "string" ? message.sender : message.sender?._id;
    handleDelete(message._id, senderId, deleteForEveryone);
  };

  return {
    isCopied,
    isDeleting,
    handleCopy,
    handleReply,
    handleDownloadAttachment,
    handleDeleteMessage,
  };
}
