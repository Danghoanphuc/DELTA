import { ReactNode } from "react";

interface ProtectedContentProps {
  children: ReactNode;
  className?: string;
}

/**
 * Wrapper component để bảo vệ nội dung
 * Chỉ dùng cho các trang như Design Editor, Printer Studio, Template Preview
 */
export function ProtectedContent({
  children,
  className = "",
}: ProtectedContentProps) {
  return <div className={`content-protected ${className}`}>{children}</div>;
}
