// apps/admin-frontend/src/hooks/use-toast.ts
// Compatibility wrapper - redirects to sonner
// TODO: Remove this file after migrating all hooks to use sonner directly

import { toast as sonnerToast } from "sonner";

type ToastProps = {
  title?: string;
  description?: string;
  variant?: "default" | "destructive";
};

function toast({ title, description, variant }: ToastProps) {
  const message = description || title || "";

  if (variant === "destructive") {
    sonnerToast.error(message);
  } else {
    sonnerToast.success(message);
  }

  return {
    id: Date.now().toString(),
    dismiss: () => {},
    update: () => {},
  };
}

export function useToast() {
  return {
    toast,
    toasts: [],
    dismiss: () => {},
  };
}

export { toast };
