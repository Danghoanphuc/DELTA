# 🧪 Test Event Theme System

## Cách Test Nhanh

### 1. Test với sự kiện hiện tại

Mở file `src/data/events-calendar.json` và sửa một event để match với ngày hôm nay:

```json
{
  "id": "test-event",
  "name": "Test Event",
  "startDate": "2024-11-29",
  "endDate": "2024-12-05",
  "theme": {
    "id": "test",
    "primaryColor": "#DC2626",
    "secondaryColor": "#FCD34D",
    "accentColor": "#EF4444",
    "backgroundColor": "#FEF3C7",
    "textColor": "#991B1B",
    "bannerText": "🎉 Đây là Test Event 🎊",
    "keywords": ["test", "demo"]
  }
}
```

### 2. Thêm Demo Component (Optional)

Trong `App.tsx` hoặc `AppLayout.tsx`, thêm:

```tsx
import { EventThemeDemo } from "@/components/EventThemeDemo";

// Thêm vào cuối component
{
  import.meta.env.DEV && <EventThemeDemo />;
}
```

Component này sẽ hiện ở góc dưới bên phải, chỉ trong dev mode.

### 3. Test EventProductBadge

Trong bất kỳ product card nào, thêm:

```tsx
import { EventProductBadge } from "@/components/EventProductBadge";

<EventProductBadge productName="Test Product" productTags={["test", "demo"]} />;
```

Nếu product name hoặc tags match với keywords trong event, badge sẽ hiện.

### 4. Test Hook

Tạo component test:

```tsx
import { useEventTheme } from "@/hooks/useEventTheme";

function TestComponent() {
  const { activeEvent, hasActiveEvent } = useEventTheme();

  return (
    <div>
      {hasActiveEvent ? (
        <div>
          <h2>Active Event: {activeEvent?.name}</h2>
          <p>Days remaining: {activeEvent?.daysRemaining}</p>
          <div
            style={{
              backgroundColor: activeEvent?.theme.primaryColor,
              color: "#fff",
              padding: "1rem",
            }}
          >
            {activeEvent?.theme.bannerText}
          </div>
        </div>
      ) : (
        <p>No active event</p>
      )}
    </div>
  );
}
```

## Checklist Test

- [ ] Banner hiển thị đúng khi có event
- [ ] Banner có thể dismiss (click X)
- [ ] Màu sắc theme đúng với config
- [ ] Countdown "Còn X ngày" hiển thị chính xác
- [ ] EventProductBadge chỉ hiện với sản phẩm relevant
- [ ] Badge có animation (shimmer, float)
- [ ] Responsive trên mobile
- [ ] Không hiện banner trên auth pages
- [ ] Performance OK (không lag)

## Debug

### Banner không hiện?

1. Check console có lỗi không
2. Verify date trong `events-calendar.json` đúng format: `YYYY-MM-DD`
3. Check `isAuthPage` logic trong `AppLayout.tsx`

### Badge không hiện trên sản phẩm?

1. Check keywords trong event config
2. Verify productName hoặc productTags có chứa keyword
3. Check case-sensitive (đã lowercase hết)

### Màu sắc không đúng?

1. Verify hex colors trong theme config
2. Check inline styles được apply đúng
3. Inspect element xem CSS có bị override

## Performance Check

```bash
# Build production
npm run build

# Check bundle size
npm run build -- --analyze
```

Event theme system chỉ thêm ~5KB vào bundle (minified + gzipped).

## Cleanup sau khi test

Nếu không muốn dùng nữa:

1. Xóa `<EventBanner />` trong `AppLayout.tsx`
2. Xóa import `event-theme.css` trong `main.tsx`
3. Giữ lại files để sau này có thể bật lại

## Next Steps

Sau khi test OK:

1. Update dates trong `events-calendar.json` cho năm 2025
2. Thêm EventProductBadge vào product cards
3. (Optional) Tích hợp với analytics để track CTR
4. (Optional) Thêm A/B testing cho themes
