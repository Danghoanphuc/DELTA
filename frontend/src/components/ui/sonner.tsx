// frontend/src/components/ui/sonner.tsx (ĐÃ SỬA)
"use client"; // Giữ lại directive này nếu cần cho các component khác dùng nó

// Bỏ import useTheme từ next-themes
// import { useTheme } from "next-themes"
import { Toaster as Sonner } from "sonner";
import React, { useState, useEffect } from "react"; // Thêm import React và hooks

type ToasterProps = React.ComponentProps<typeof Sonner>;

const Toaster = ({ ...props }: ToasterProps) => {
  // Bỏ useTheme()
  // const { theme = "system" } = useTheme()

  // Sử dụng state để lưu theme, mặc định là 'light'
  const [effectiveTheme, setEffectiveTheme] = useState<"light" | "dark">(
    "light"
  );

  useEffect(() => {
    // Kiểm tra media query khi component mount và khi theme hệ thống thay đổi
    const mediaQuery = window.matchMedia("(prefers-color-scheme: dark)");
    const handleChange = () => {
      setEffectiveTheme(mediaQuery.matches ? "dark" : "light");
    };

    handleChange(); // Kiểm tra lần đầu
    mediaQuery.addEventListener("change", handleChange); // Lắng nghe thay đổi

    // Cleanup listener
    return () => mediaQuery.removeEventListener("change", handleChange);
  }, []); // Chỉ chạy 1 lần khi mount

  return (
    <Sonner
      // Sử dụng state theme đã xác định
      theme={effectiveTheme} // Truyền 'light' hoặc 'dark'
      className="toaster group"
      toastOptions={{
        classNames: {
          toast:
            "group toast group-[.toaster]:bg-background group-[.toaster]:text-foreground group-[.toaster]:border-border group-[.toaster]:shadow-lg",
          description: "group-[.toast]:text-muted-foreground",
          actionButton:
            "group-[.toast]:bg-primary group-[.toast]:text-primary-foreground",
          cancelButton:
            "group-[.toast]:bg-muted group-[.toast]:text-muted-foreground",
        },
      }}
      {...props}
    />
  );
};

export { Toaster };
