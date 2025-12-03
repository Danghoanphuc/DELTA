// FileItemMenu.tsx - Dropdown menu for file actions
import {
  MoreVertical,
  Download,
  MessageSquare,
  Trash2,
  Users,
} from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/shared/components/ui/dropdown-menu";
import { Button } from "@/shared/components/ui/button";
import { ConfirmDialog } from "@/shared/components/ui/ConfirmDialog";
import { useConfirmDialog } from "@/shared/hooks/useConfirmDialog";
import type { FileItem } from "./types";

interface FileItemMenuProps {
  file: FileItem;
  isSender: boolean;
  onDownload: () => void;
  onGoToMessage: () => void;
  onDelete: (deleteForEveryone: boolean) => void;
  isDeleting?: boolean;
}

export function FileItemMenu({
  file,
  isSender,
  onDownload,
  onGoToMessage,
  onDelete,
  isDeleting,
}: FileItemMenuProps) {
  const confirmDialog = useConfirmDialog();

  const handleDeleteClick = (deleteForEveryone: boolean) => {
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

  return (
    <>
      <DropdownMenu modal={false}>
        <DropdownMenuTrigger asChild>
          <Button
            variant="ghost"
            size="icon"
            className="h-8 w-8 text-stone-400 hover:text-stone-600"
            onClick={(e) => e.stopPropagation()}
          >
            <MoreVertical size={16} />
          </Button>
        </DropdownMenuTrigger>

        <DropdownMenuContent
          align="end"
          className="w-56 bg-white z-50 shadow-xl border border-stone-100 rounded-xl p-1"
          sideOffset={5}
        >
          <DropdownMenuItem
            onClick={onDownload}
            className="rounded-lg cursor-pointer"
          >
            <Download size={14} className="mr-2" />
            Tải xuống
          </DropdownMenuItem>
          <DropdownMenuItem
            onClick={onGoToMessage}
            className="rounded-lg cursor-pointer"
          >
            <MessageSquare size={14} className="mr-2" />
            Xem tin nhắn gốc
          </DropdownMenuItem>
          <DropdownMenuSeparator className="my-1 bg-stone-100" />
          {isSender ? (
            <>
              <DropdownMenuItem
                onClick={() => handleDeleteClick(false)}
                className="text-orange-600 focus:text-orange-600 focus:bg-orange-50 rounded-lg cursor-pointer"
              >
                <Trash2 size={14} className="mr-2" />
                Xóa ở phía tôi
              </DropdownMenuItem>
              <DropdownMenuItem
                onClick={() => handleDeleteClick(true)}
                className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg cursor-pointer"
              >
                <Users size={14} className="mr-2" />
                Xóa cho mọi người
              </DropdownMenuItem>
            </>
          ) : (
            <DropdownMenuItem
              onClick={() => handleDeleteClick(false)}
              className="text-red-600 focus:text-red-600 focus:bg-red-50 rounded-lg cursor-pointer"
            >
              <Trash2 size={14} className="mr-2" />
              Xóa ở phía tôi
            </DropdownMenuItem>
          )}
        </DropdownMenuContent>
      </DropdownMenu>

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
