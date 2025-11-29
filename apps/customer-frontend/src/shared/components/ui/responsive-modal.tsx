import * as React from "react";
import { useMediaQuery } from "@/shared/hooks/useMediaQuery"; // Hoặc dùng hook có sẵn
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogTrigger,
} from "@/shared/components/ui/dialog";
import {
  Drawer,
  DrawerContent,
  DrawerHeader,
  DrawerTitle,
  DrawerDescription,
  DrawerTrigger,
  DrawerFooter,
  DrawerClose,
} from "@/shared/components/ui/drawer";
import { Button } from "@/shared/components/ui/button";
import { cn } from "@/shared/lib/utils";
import { X } from "lucide-react";

interface ResponsiveModalProps {
  children: React.ReactNode;
  isOpen: boolean;
  onOpenChange: (open: boolean) => void;
  title?: string;
  description?: string;
  trigger?: React.ReactNode;
  className?: string; // Class cho Content
  hideCloseButton?: boolean;
}

export function ResponsiveModal({
  children,
  isOpen,
  onOpenChange,
  title,
  description,
  trigger,
  className,
  hideCloseButton = false,
}: ResponsiveModalProps) {
  // Breakpoint 'md' thường là 768px
  const isDesktop = useMediaQuery("(min-width: 768px)");

  if (isDesktop) {
    return (
      <Dialog open={isOpen} onOpenChange={onOpenChange}>
        {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
        <DialogContent className={cn("sm:max-w-[600px]", className)}>
          {(title || description) && (
            <DialogHeader>
              {title && <DialogTitle>{title}</DialogTitle>}
              {description && (
                <DialogDescription>{description}</DialogDescription>
              )}
            </DialogHeader>
          )}
          {children}
        </DialogContent>
      </Dialog>
    );
  }

  return (
    <Drawer open={isOpen} onOpenChange={onOpenChange}>
      {trigger && <DrawerTrigger asChild>{trigger}</DrawerTrigger>}
      <DrawerContent className={cn("max-h-[96vh]", className)}>
        {/* Thanh nắm kéo (Handle) mặc định của Drawer Shadcn đã có */}

        {/* Header Mobile */}
        <DrawerHeader className="text-left relative border-b border-gray-100 pb-4">
          {title && (
            <DrawerTitle className="text-lg font-bold">{title}</DrawerTitle>
          )}
          {description && <DrawerDescription>{description}</DrawerDescription>}

          {!hideCloseButton && (
            <DrawerClose asChild>
              <Button
                variant="ghost"
                size="icon"
                className="absolute right-4 top-4 text-gray-400"
              >
                <X size={20} />
              </Button>
            </DrawerClose>
          )}
        </DrawerHeader>

        {/* Content Mobile - Auto scroll */}
        <div className="px-4 py-4 overflow-y-auto overflow-x-hidden">
          {children}
        </div>

        {/* Footer đệm dưới cùng để tránh bị cấn safe-area của iPhone */}
        <div className="h-6 w-full shrink-0" />
      </DrawerContent>
    </Drawer>
  );
}
