// src/shared/hooks/useConfirmDialog.ts
import { useState, useCallback } from "react";

interface ConfirmDialogState {
  isOpen: boolean;
  title: string;
  description: string;
  onConfirm: () => void;
  confirmText?: string;
  cancelText?: string;
  variant?: "danger" | "warning" | "info";
}

export function useConfirmDialog() {
  const [dialogState, setDialogState] = useState<ConfirmDialogState>({
    isOpen: false,
    title: "",
    description: "",
    onConfirm: () => {},
  });

  const openDialog = useCallback(
    (config: Omit<ConfirmDialogState, "isOpen">) => {
      setDialogState({
        ...config,
        isOpen: true,
      });
    },
    []
  );

  const closeDialog = useCallback(() => {
    setDialogState((prev) => ({ ...prev, isOpen: false }));
  }, []);

  return {
    dialogState,
    openDialog,
    closeDialog,
  };
}

