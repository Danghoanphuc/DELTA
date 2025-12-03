// FileItemMenuSimple.tsx - Simple menu without Radix UI issues
import { useState, useRef, useEffect } from "react";
import {
  MoreVertical,
  Download,
  MessageSquare,
  Trash2,
  Users,
} from "lucide-react";
import { Button } from "@/shared/components/ui/button";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog";
import type { FileItem } from "./types";

interface FileItemMenuSimpleProps {
  file: FileItem;
  isSender: boolean;
  onDownload: () => void;
  onGoToMessage: () => void;
  onDelete: (deleteForEveryone: boolean) => void;
  isDeleting?: boolean;
}

export function FileItemMenuSimple({
  file,
  isSender,
  onDownload,
  onGoToMessage,
  onDelete,
  isDeleting,
}: FileItemMenuSimpleProps) {
  const [isOpen, setIsOpen] = useState(false);
  const menuRef = useRef<HTMLDivElement>(null);
  const confirmDialog = useConfirmDialog();

  // Close menu when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    };

    if (isOpen) {
      document.addEventListener("mousedown", handleClickOutside);
      return () =>
        document.removeEventListener("mousedown", handleClickOutside);
    }
  }, [isOpen]);

  const handleDeleteClick = (deleteForEveryone: boolean) => {
    setIsOpen(false);
    confirmDialog.confirm(
      {
        title: deleteForEveryone ? "Xóa cho mọi người?" : "Xóa ở phía bạn?",
        description: deleteForEveryone
          ? "File này sẽ bị xóa cho tất cả mọi người trong cuộc trò chuyện."
          : "File này chỉ bị xóa ở phía bạn. Người khác vẫn có thể xem.",
        confirmText: "Xóa",
        cancelText: "Hủy",
        variant: "danger",
      },
      () => onDelete(deleteForEveryone)
    );
  };

  const handleAction = (action: () => void) => {
    setIsOpen(false);
    action();
  };

  return (
    <>
      <div className="relative" ref={menuRef}>
        <Button
          variant="ghost"
          size="icon"
          className="h-8 w-8 text-stone-400 hover:text-stone-600"
          onClick={(e) => {
            e.stopPropagation();
            setIsOpen(!isOpen);
          }}
        >
          <MoreVertical size={16} />
        </Button>

        {isOpen && (
          <div className="absolute right-0 top-full mt-1 w-56 bg-white rounded-xl shadow-xl border border-stone-100 p-1 z-50 animate-in fade-in-0 zoom-in-95 duration-100">
            <button
              onClick={() => handleAction(onDownload)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded-lg transition-colors"
            >
              <Download size={14} />
              Tải xuống
            </button>
            <button
              onClick={() => handleAction(onGoToMessage)}
              className="w-full flex items-center gap-2 px-3 py-2 text-sm text-stone-700 hover:bg-stone-50 rounded-lg transition-colors"
            >
              <MessageSquare size={14} />
              Xem tin nhắn gốc
            </button>
            <div className="my-1 h-px bg-stone-100" />
            {isSender ? (
              <>
                <button
                  onClick={() => handleDeleteClick(false)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-orange-600 hover:bg-orange-50 rounded-lg transition-colors"
                >
                  <Trash2 size={14} />
                  Xóa ở phía tôi
                </button>
                <button
                  onClick={() => handleDeleteClick(true)}
                  className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
                >
                  <Users size={14} />
                  Xóa cho mọi người
                </button>
              </>
            ) : (
              <button
                onClick={() => handleDeleteClick(false)}
                className="w-full flex items-center gap-2 px-3 py-2 text-sm text-red-600 hover:bg-red-50 rounded-lg transition-colors"
              >
                <Trash2 size={14} />
                Xóa ở phía tôi
              </button>
            )}
          </div>
        )}
      </div>

      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={confirmDialog.handleClose}
        onConfirm={confirmDialog.handleConfirm}
        title={confirmDialog.options.title}
        description={confirmDialog.options.description}
        confirmText={confirmDialog.options.confirmText}
        cancelText={confirmDialog.options.cancelText}
        variant={confirmDialog.options.variant}
        isLoading={isDeleting}
      />
    </>
  );
}
