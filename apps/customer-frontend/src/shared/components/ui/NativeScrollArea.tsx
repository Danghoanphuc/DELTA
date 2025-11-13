"use client";

import * as React from "react";
import { cn } from "@/shared/lib/utils";

/**
 * ✅ NATIVE SCROLL AREA - Thay thế hoàn toàn Radix UI
 * Không có ref composition, không có infinite loops!
 *
 * Sử dụng pure CSS scrolling với custom scrollbar styling
 */

interface NativeScrollAreaProps extends React.HTMLAttributes<HTMLDivElement> {
  children: React.ReactNode;
  className?: string;
}

const NativeScrollArea = React.forwardRef<
  HTMLDivElement,
  NativeScrollAreaProps
>(({ className, children, ...props }, ref) => {
  return (
    <div
      ref={ref}
      className={cn(
        "relative overflow-auto",
        // Custom scrollbar styling (works in most browsers)
        "[&::-webkit-scrollbar]:w-2.5",
        "[&::-webkit-scrollbar]:h-2.5",
        "[&::-webkit-scrollbar-track]:bg-transparent",
        "[&::-webkit-scrollbar-thumb]:rounded-full",
        "[&::-webkit-scrollbar-thumb]:bg-border",
        "[&::-webkit-scrollbar-thumb]:hover:bg-border/80",
        // Firefox
        "scrollbar-thin",
        "scrollbar-track-transparent",
        "scrollbar-thumb-border",
        "scrollbar-thumb-rounded",
        className
      )}
      style={{
        // Fallback for browsers that don't support Tailwind scrollbar classes
        scrollbarWidth: "thin",
        scrollbarColor: "hsl(var(--border)) transparent",
      }}
      {...props}
    >
      {children}
    </div>
  );
});
NativeScrollArea.displayName = "NativeScrollArea";

export { NativeScrollArea };
