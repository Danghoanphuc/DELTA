// apps/customer-frontend/src/features/customer/pages/InspirationPage.tsx
// (BẢN VÁ TỪ LẦN TRƯỚC)

import React from "react";
import { InspirationFeed } from "@/features/chat/pages/InspirationFeed";
import { useInspirationFeed } from "@/features/chat/hooks/useInspirationFeed";
// ✅ SỬA LỖI TS2307: Import PageLoader từ đúng đường dẫn
import PageLoader from "@/components/PageLoader";

/**
 * @description
 * Component "Trang" này dùng để bọc (wrap) `InspirationFeed`.
 */
export const InspirationPage = () => {
  const { items, isLoading } = useInspirationFeed();

  if (isLoading) {
    return <PageLoader />;
  }

  // Extract products from items (filter out inspiration pins)
  const products = items.filter(item => !('type' in item) || item.type !== 'inspiration') as any[];

  return (
    <InspirationFeed
      products={products}
      isLoading={isLoading}
      fetchNextPage={() => {}}
      hasNextPage={false}
      isFetchingNextPage={false}
    />
  );
};

export default InspirationPage;
