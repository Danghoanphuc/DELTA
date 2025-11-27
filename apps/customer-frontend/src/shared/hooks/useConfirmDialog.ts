// apps/customer-frontend/src/shared/hooks/useConfirmDialog.ts
// ✅ Hook để dùng ConfirmDialog dễ dàng

import { useState, useCallback } from "react";

interface ConfirmOptions {
  title: string;
  description: string;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
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
  const [onConfirmCallback, setOnConfirmCallback] = useState<(() => void) | null>(null);

  const confirm = useCallback(
    (opts: ConfirmOptions, onConfirm: () => void) => {
      setOptions(opts);
      setOnConfirmCallback(() => onConfirm);
      setIsOpen(true);
    },
    []
  );

  const handleConfirm = useCallback(() => {
    if (onConfirmCallback) {
      onConfirmCallback();
    }
    setIsOpen(false);
    setOnConfirmCallback(null);
  }, [onConfirmCallback]);

  const handleClose = useCallback(() => {
    setIsOpen(false);
    setOnConfirmCallback(null);
  }, []);

  return {
    isOpen,
    options,
    confirm,
    handleConfirm,
    handleClose,
  };
}
