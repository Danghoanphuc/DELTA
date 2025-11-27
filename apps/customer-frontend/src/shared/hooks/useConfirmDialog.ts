// apps/customer-frontend/src/shared/hooks/useConfirmDialog.ts
// ✅ Hook để dùng ConfirmDialog dễ dàng

import { useState, useCallback } from "react";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
  onConfirm?: () => void | Promise<void>;
}

interface DialogState {
  isOpen: boolean;
  title: string;
  description: string;
  confirmText: string;
  cancelText: string;
  variant: "danger" | "warning" | "info";
  onConfirm: () => void;
}

export function useConfirmDialog() {
  const [isOpen, setIsOpen] = useState(false);
  const [options, setOptions] = useState<ConfirmOptions>({
    title: "",
    description: "",
    confirmText: "Xác nhận",
    cancelText: "Hủy",
    variant: "warning",
  });
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void | Promise<void>) | null>(null);

  // API cũ: confirm(opts, onConfirm) - dùng cho các component cũ
  const confirm = useCallback(
    (opts: ConfirmOptions, onConfirm: () => void | Promise<void>) => {
      setOptions(opts);
      setOnConfirmCallback(() => onConfirm);
      setIsOpen(true);
    },
    []
  );

  // API mới: openDialog({ ...opts, onConfirm }) - dùng cho ChatHistorySidebar
  const openDialog = useCallback((opts: ConfirmOptions) => {
    setOptions(opts);
    setOnConfirmCallback(() => opts.onConfirm || (() => {}));
    setIsOpen(true);
  }, []);

  const handleConfirm = useCallback(async () => {
    if (onConfirmCallback) {
      await onConfirmCallback();
    }
    setIsOpen(false);
    setOnConfirmCallback(null);
  }, [onConfirmCallback]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setOnConfirmCallback(null);
  }, []);

  const closeDialog = useCallback(() => {
    setIsOpen(false);
    setOnConfirmCallback(null);
  }, []);

  // DialogState cho API mới
  const dialogState: DialogState = {
    isOpen,
    title: options.title,
    description: options.description,
    confirmText: options.confirmText || "Xác nhận",
    cancelText: options.cancelText || "Hủy",
    variant: options.variant || "warning",
    onConfirm: handleConfirm,
  };

  return {
    // API cũ (backward compatible)
    isOpen,
    options,
    confirm,
    handleConfirm,
    handleClose,
    // API mới (cho ChatHistorySidebar)
    dialogState,
    openDialog,
    closeDialog,
  };
}
