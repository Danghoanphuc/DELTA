# 🎨 Cách Bật Event Theme System

## Hiện Tại: TẮT

Event theme đã được tắt để không ảnh hưởng giao diện hiện tại.

## Cách Bật Lại

### Bước 1: Mở file AppLayout.tsx

```bash
apps/customer-frontend/src/components/AppLayout.tsx
```

### Bước 2: Uncomment 2 dòng này

Tìm dòng:

```tsx
{
  /* Event Theme: TẮT - Uncomment để bật lại */
}
{
  /* {!isAuthPage && <EventBanner />} */
}
{
  /* {!isAuthPage && <EventParticles />} */
}
```

Sửa thành:

```tsx
{
  /* Event Theme: BẬT */
}
{
  !isAuthPage && <EventBanner />;
}
{
  !isAuthPage && <EventParticles />;
}
```

### Bước 3: Uncomment imports

Tìm dòng:

```tsx
// import { EventBanner } from "./EventBanner";
// import { EventParticles } from "./EventParticles";
```

Sửa thành:

```tsx
import { EventBanner } from "./EventBanner";
import { EventParticles } from "./EventParticles";
```

### Bước 4: Restart dev server

```bash
npm run dev
```

## Tùy Chỉnh Events

Chỉnh sửa file:

```bash
apps/customer-frontend/src/data/events-calendar.json
```

Thay đổi dates để test:

```json
{
  "startDate": "2024-11-29",
  "endDate": "2024-12-10"
}
```

## Tắt Lại

Comment lại 2 dòng trong AppLayout.tsx:

```tsx
{
  /* {!isAuthPage && <EventBanner />} */
}
{
  /* {!isAuthPage && <EventParticles />} */
}
```

Xong! Đơn giản vậy thôi.

## Tính Năng Khi Bật

- ✅ CSS Variables tự động inject màu theme
- ✅ Particles nhẹ nhàng (8 emoji rơi)
- ✅ EventProductBadge tự động hiện trên sản phẩm liên quan
- ✅ Không thay đổi layout
- ✅ Chỉ thay đổi màu sắc và mood

## Docs

- `EVENT_THEME_V2.md` - Hướng dẫn chi tiết
- `INTEGRATION_EXAMPLES.md` - Ví dụ tích hợp
- `EVENT_THEME_GUIDE.md` - Guide đầy đủ
