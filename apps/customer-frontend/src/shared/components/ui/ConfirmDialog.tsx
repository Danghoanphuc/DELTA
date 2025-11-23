// src/shared/components/ui/ConfirmDialog.tsx
import { useEffect, useRef } from "react";
import { createPortal } from "react-dom"; // ✅ IMPORT QUAN TRỌNG
import { AlertTriangle, Trash2, X, Info, Loader2 } from "lucide-react";
import { Button } from "./button";
import { cn } from "@/shared/lib/utils";

interface ConfirmDialogProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  isLoading?: boolean;
}

export function ConfirmDialog({
  isOpen,
  onClose,
  onConfirm,
  title,
  description,
  confirmText = "Xác nhận",
  cancelText = "Hủy",
  variant = "danger",
  isLoading = false,
}: ConfirmDialogProps) {
  const dialogRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (!isOpen) return;
    const handleEscape = (e: KeyboardEvent) => { if (e.key === "Escape") onClose(); };
    const handleClickOutside = (e: MouseEvent) => {
      if (dialogRef.current && !dialogRef.current.contains(e.target as Node) && !isLoading) {
        onClose();
      }
    };
    document.addEventListener("keydown", handleEscape);
    document.addEventListener("mousedown", handleClickOutside);
    document.body.style.overflow = "hidden";
    return () => {
      document.removeEventListener("keydown", handleEscape);
      document.removeEventListener("mousedown", handleClickOutside);
      document.body.style.overflow = "";
    };
  }, [isOpen, onClose, isLoading]);

  if (!isOpen) return null;

  // Style config (giữ nguyên để đẹp)
  const variantStyles = {
    danger: {
      icon: Trash2,
      iconBg: "bg-red-100",
      iconColor: "text-red-600",
      buttonClass: "bg-red-600 hover:bg-red-700 text-white shadow-md shadow-red-200",
    },
    warning: {
      icon: AlertTriangle,
      iconBg: "bg-orange-100",
      iconColor: "text-orange-600",
      buttonClass: "bg-orange-600 hover:bg-orange-700 text-white shadow-md shadow-orange-200",
    },
    info: {
      icon: Info,
      iconBg: "bg-blue-100",
      iconColor: "text-blue-600",
      buttonClass: "bg-blue-600 hover:bg-blue-700 text-white shadow-md shadow-blue-200",
    },
  };

  const style = variantStyles[variant];
  const Icon = style.icon;

  // ✅ DÙNG CREATE PORTAL ĐỂ ĐƯA MODAL RA NGOÀI CÙNG (Fix triệt để lỗi bị đè)
  return createPortal(
    <div className="fixed inset-0 z-[9999] flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm animate-in fade-in duration-200">
      <div
        ref={dialogRef}
        className="relative w-full max-w-[400px] bg-white rounded-2xl shadow-2xl animate-in zoom-in-95 duration-200 overflow-hidden"
      >
        {!isLoading && (
          <button
            onClick={onClose}
            className="absolute top-4 right-4 p-2 rounded-full text-gray-400 hover:text-gray-600 hover:bg-gray-100 transition-colors z-10"
          >
            <X size={20} />
          </button>
        )}

        <div className="p-0 flex flex-col items-center">
          <div className="w-full flex flex-col items-center pt-8 pb-4 px-6">
             <div className={cn("w-16 h-16 rounded-full flex items-center justify-center mb-5", style.iconBg)}>
                <Icon className={cn("w-8 h-8", style.iconColor)} strokeWidth={2} />
             </div>
             <h3 className="text-xl font-bold text-gray-900 text-center leading-tight">{title}</h3>
             <p className="text-gray-500 text-center mt-2 text-sm leading-relaxed">{description}</p>
          </div>

          <div className="w-full p-6 pt-2 bg-white flex gap-3">
            <Button
              onClick={onClose}
              disabled={isLoading}
              variant="outline"
              className="flex-1 h-11 rounded-xl border-gray-200 font-medium hover:bg-gray-50 hover:text-gray-900"
            >
              {cancelText}
            </Button>
            <Button
              onClick={onConfirm}
              disabled={isLoading}
              className={cn("flex-1 h-11 rounded-xl font-semibold transition-all", style.buttonClass)}
            >
              {isLoading ? (
                <><Loader2 className="w-4 h-4 mr-2 animate-spin" />Đang xử lý...</>
              ) : (
                confirmText
              )}
            </Button>
          </div>
        </div>
      </div>
    </div>,
    document.body // Target container
  );
}