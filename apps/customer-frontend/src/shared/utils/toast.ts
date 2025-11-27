// ✅ Helper utility để migrate từ toast sang DynamicIsland
// Sử dụng để thay thế toast từ sonner

import type React from "react";
import { useStatusStore } from "@/stores/useStatusStore";

// Export function để dùng trực tiếp (không cần hook)
let statusStore: ReturnType<typeof useStatusStore.getState> | null = null;

// Initialize store reference
if (typeof window !== 'undefined') {
  statusStore = useStatusStore.getState();
  useStatusStore.subscribe((state) => {
    statusStore = state;
  });
}

interface ToastOptions {
  duration?: number;
  description?: string;
  id?: string | number;
  icon?: React.ReactNode;
  action?: {
    label: string;
    onClick: () => void;
  };
  position?: string;
  className?: string;
}

export const toast = {
  success: (message: string, options?: ToastOptions) => {
    if (statusStore) {
      const fullMessage = options?.description ? `${message}\n${options.description}` : message;
      statusStore.showStatus('success', fullMessage, undefined, options?.duration);
    }
    return options?.id;
  },
  error: (message: string, options?: ToastOptions) => {
    if (statusStore) {
      const fullMessage = options?.description ? `${message}\n${options.description}` : message;
      statusStore.showStatus('error', fullMessage, undefined, options?.duration);
    }
    return options?.id;
  },
  info: (message: string, options?: ToastOptions) => {
    if (statusStore) {
      const fullMessage = options?.description ? `${message}\n${options.description}` : message;
      statusStore.showStatus('info', fullMessage, undefined, options?.duration);
    }
    return options?.id;
  },
  warning: (message: string, options?: ToastOptions) => {
    if (statusStore) {
      const fullMessage = options?.description ? `${message}\n${options.description}` : message;
      statusStore.showStatus('error', fullMessage, undefined, options?.duration);
    }
    return options?.id;
  },
  // Loading state - returns id for dismiss
  loading: (message: string, options?: ToastOptions): string | number | undefined => {
    if (statusStore) {
      statusStore.showStatus('loading', message);
    }
    return options?.id;
  },
  // Dismiss loading
  dismiss: (id?: string | number) => {
    if (statusStore) {
      statusStore.hideStatus();
    }
  },
  // Custom toast (for compatibility)
  custom: (render: (t: any) => React.ReactNode, options?: ToastOptions) => {
    // Simplified implementation - just show as info
    if (statusStore) {
      statusStore.showStatus('info', 'Custom notification', undefined, options?.duration);
    }
    return undefined;
  },
};

