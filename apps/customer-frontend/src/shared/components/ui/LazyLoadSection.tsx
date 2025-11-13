// src/shared/components/ui/LazyLoadSection.tsx
import React, { Suspense } from "react";
import { useInView } from "react-intersection-observer";

interface LazyLoadSectionProps {
  children: React.ReactNode;
  fallback: React.ReactNode;
  /**
   * Số pixel bên ngoài màn hình trước khi bắt đầu tải.
   * Mặc định là 200px (tải trước khi user thấy 200px).
   */
  rootMargin?: string;
}

/**
 * Component này sẽ "treo" (Suspense) cho đến khi nó
 * lọt vào tầm nhìn của người dùng (với một khoảng đệm).
 */
export const LazyLoadSection = ({
  children,
  fallback,
  rootMargin = "200px",
}: LazyLoadSectionProps) => {
  const { ref, inView } = useInView({
    triggerOnce: true, // Chỉ tải 1 lần duy nhất
    rootMargin: rootMargin, // Bắt đầu tải khi còn cách 200px
  });

  return (
    <div ref={ref}>
      {/* Nếu "inView" là true, render Suspense.
        Nếu "inView" là false, render fallback (hoặc 1 div rỗng)
        để giữ chỗ (layout shifting).
      */}
      {inView ? <Suspense fallback={fallback}>{children}</Suspense> : fallback}
    </div>
  );
};
