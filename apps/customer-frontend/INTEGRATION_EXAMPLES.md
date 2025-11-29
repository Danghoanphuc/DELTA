# 🔌 Integration Examples

## 1. Thêm Badge vào Product Card

```tsx
// ProductCard.tsx
import { EventProductBadge } from "@/components/EventProductBadge";

interface ProductCardProps {
  product: {
    id: string;
    name: string;
    tags: string[];
    price: number;
    image: string;
  };
}

export const ProductCard = ({ product }: ProductCardProps) => {
  return (
    <div className="product-card">
      <div className="relative">
        <img src={product.image} alt={product.name} />

        {/* Thêm badge ở góc trên */}
        <div className="absolute top-2 left-2">
          <EventProductBadge
            productName={product.name}
            productTags={product.tags}
          />
        </div>
      </div>

      <h3>{product.name}</h3>
      <p>{product.price.toLocaleString("vi-VN")}đ</p>
    </div>
  );
};
```

## 2. Highlight Trending Products

```tsx
// ProductList.tsx
import { useEventTheme } from "@/hooks/useEventTheme";
import { calculateEventRelevance } from "@/shared/utils/eventTheme.utils";

export const ProductList = ({ products }) => {
  const { activeEvent } = useEventTheme();

  // Sort products theo relevance với event
  const sortedProducts = activeEvent
    ? [...products].sort((a, b) => {
        const scoreA = calculateEventRelevance(
          a.name,
          a.tags,
          activeEvent.theme.keywords
        );
        const scoreB = calculateEventRelevance(
          b.name,
          b.tags,
          activeEvent.theme.keywords
        );
        return scoreB - scoreA;
      })
    : products;

  return (
    <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
      {sortedProducts.map((product) => (
        <ProductCard key={product.id} product={product} />
      ))}
    </div>
  );
};
```

## 3. Event-themed Section

```tsx
// EventSection.tsx
import { useEventTheme } from "@/hooks/useEventTheme";
import { getEventGradient } from "@/shared/utils/eventTheme.utils";

export const EventSection = ({ products }) => {
  const { activeEvent, hasActiveEvent } = useEventTheme();

  if (!hasActiveEvent || !activeEvent) return null;

  const { theme } = activeEvent;

  return (
    <section
      className="py-8 px-4 rounded-lg"
      style={{
        background: getEventGradient(theme),
        color: "#FFFFFF",
      }}
    >
      <h2 className="text-2xl font-bold mb-4">{theme.bannerText}</h2>

      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        {products.map((product) => (
          <ProductCard key={product.id} product={product} />
        ))}
      </div>
    </section>
  );
};
```

## 4. Dynamic Button Colors

```tsx
// CheckoutButton.tsx
import { useEventTheme } from "@/hooks/useEventTheme";

export const CheckoutButton = () => {
  const { activeEvent } = useEventTheme();

  const buttonStyle = activeEvent
    ? {
        backgroundColor: activeEvent.theme.primaryColor,
        color: "#FFFFFF",
      }
    : {};

  return (
    <button
      className="px-6 py-3 rounded-lg font-semibold transition-all hover:opacity-90"
      style={buttonStyle}
    >
      Thanh Toán Ngay
    </button>
  );
};
```

## 5. Event-aware Search

```tsx
// SearchBar.tsx
import { useEventTheme } from "@/hooks/useEventTheme";

export const SearchBar = () => {
  const { activeEvent } = useEventTheme();

  const placeholder = activeEvent
    ? `Tìm ${activeEvent.theme.keywords[0]}...`
    : "Tìm kiếm sản phẩm...";

  return (
    <input type="search" placeholder={placeholder} className="search-input" />
  );
};
```

## 6. Homepage Hero Banner

```tsx
// HeroBanner.tsx
import { useEventTheme } from "@/hooks/useEventTheme";

export const HeroBanner = () => {
  const { activeEvent, hasActiveEvent } = useEventTheme();

  if (!hasActiveEvent || !activeEvent) {
    return <DefaultHeroBanner />;
  }

  const { theme } = activeEvent;

  return (
    <div
      className="hero-banner h-96 flex items-center justify-center"
      style={{
        background: `linear-gradient(135deg, ${theme.primaryColor}, ${theme.secondaryColor})`,
        color: "#FFFFFF",
      }}
    >
      <div className="text-center">
        <h1 className="text-5xl font-bold mb-4 event-float">
          {theme.bannerText}
        </h1>
        <p className="text-xl mb-6">
          Khuyến mãi đặc biệt - Còn {activeEvent.daysRemaining} ngày
        </p>
        <button
          className="px-8 py-4 bg-white rounded-lg font-bold event-pulse-glow"
          style={{ color: theme.primaryColor }}
        >
          Mua Ngay
        </button>
      </div>
    </div>
  );
};
```

## 7. Filter by Event

```tsx
// ProductFilter.tsx
import { useEventTheme } from "@/hooks/useEventTheme";

export const ProductFilter = ({ onFilterChange }) => {
  const { activeEvent, hasActiveEvent } = useEventTheme();

  if (!hasActiveEvent) return <DefaultFilter />;

  return (
    <div className="filters">
      <button
        onClick={() => onFilterChange("event")}
        className="filter-btn"
        style={{
          backgroundColor: activeEvent?.theme.primaryColor,
          color: "#FFFFFF",
        }}
      >
        🔥 Hot {activeEvent?.name}
      </button>

      {/* Other filters */}
    </div>
  );
};
```

## 8. Notification với Event Theme

```tsx
// EventNotification.tsx
import { useEventTheme } from "@/hooks/useEventTheme";
import { useEffect, useState } from "react";

export const EventNotification = () => {
  const { activeEvent, hasActiveEvent } = useEventTheme();
  const [show, setShow] = useState(false);

  useEffect(() => {
    if (hasActiveEvent) {
      // Show notification khi có event mới
      const hasSeenEvent = localStorage.getItem(`seen-${activeEvent?.id}`);
      if (!hasSeenEvent) {
        setShow(true);
        setTimeout(() => {
          localStorage.setItem(`seen-${activeEvent?.id}`, "true");
        }, 3000);
      }
    }
  }, [hasActiveEvent, activeEvent]);

  if (!show || !activeEvent) return null;

  return (
    <div
      className="fixed bottom-4 right-4 p-4 rounded-lg shadow-xl animate-in slide-in-from-bottom"
      style={{
        backgroundColor: activeEvent.theme.backgroundColor,
        color: activeEvent.theme.textColor,
        borderLeft: `4px solid ${activeEvent.theme.primaryColor}`,
      }}
    >
      <p className="font-semibold">{activeEvent.theme.bannerText}</p>
      <p className="text-sm">Khám phá ưu đãi đặc biệt!</p>
      <button onClick={() => setShow(false)} className="text-xs underline mt-2">
        Đóng
      </button>
    </div>
  );
};
```

## 9. Analytics Tracking

```tsx
// useEventAnalytics.ts
import { useEventTheme } from "@/hooks/useEventTheme";
import { useEffect } from "react";

export const useEventAnalytics = () => {
  const { activeEvent, hasActiveEvent } = useEventTheme();

  useEffect(() => {
    if (hasActiveEvent && activeEvent) {
      // Track event impression
      window.gtag?.("event", "event_theme_view", {
        event_id: activeEvent.id,
        event_name: activeEvent.name,
        days_remaining: activeEvent.daysRemaining,
      });
    }
  }, [hasActiveEvent, activeEvent]);

  const trackEventClick = (productId: string) => {
    if (activeEvent) {
      window.gtag?.("event", "event_product_click", {
        event_id: activeEvent.id,
        product_id: productId,
      });
    }
  };

  return { trackEventClick };
};
```

## 10. Mobile App Integration

```tsx
// MobileEventBanner.tsx
import { useEventTheme } from "@/hooks/useEventTheme";

export const MobileEventBanner = () => {
  const { activeEvent, hasActiveEvent } = useEventTheme();

  if (!hasActiveEvent || !activeEvent) return null;

  return (
    <div
      className="sticky top-0 z-50 py-2 px-4 text-center text-sm font-semibold"
      style={{
        backgroundColor: activeEvent.theme.primaryColor,
        color: "#FFFFFF",
      }}
    >
      {activeEvent.theme.bannerText} - Còn {activeEvent.daysRemaining} ngày
    </div>
  );
};
```

---

Tất cả examples trên đều plug-and-play, copy paste là chạy được ngay!
