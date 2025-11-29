# 🎉 Hệ Thống Theme Tự Động Theo Sự Kiện Việt Nam

## Tổng Quan

Hệ thống tự động thay đổi giao diện theo các sự kiện lớn ở Việt Nam (Tết, Trung Thu, Black Friday...) mà không cần can thiệp thủ công.

## Cách Hoạt Động

1. **Calendar-based**: Dựa trên file `events-calendar.json` chứa lịch sự kiện cả năm
2. **Auto-detect**: Tự động phát hiện sự kiện đang diễn ra dựa trên ngày hiện tại
3. **Real-time**: Check mỗi giờ để cập nhật theme mới
4. **Zero-config**: Không cần setup gì thêm, chạy tự động

## Các Sự Kiện Đã Config

- ✅ Tết Nguyên Đán (25/1 - 5/2/2025)
- ✅ Valentine (10/2 - 14/2/2025)
- ✅ Ngày Quốc Tế Phụ Nữ 8/3 (5/3 - 8/3/2025)
- ✅ Tết Trung Thu (1/9 - 7/9/2025)
- ✅ Quốc Khánh 2/9 (30/8 - 2/9/2025)
- ✅ Ngày Phụ Nữ Việt Nam 20/10 (17/10 - 20/10/2025)
- ✅ Black Friday (25/11 - 30/11/2025)
- ✅ Giáng Sinh (20/12 - 26/12/2025)
- ✅ Tết Dương Lịch (28/12/2025 - 2/1/2026)
- ✅ Mùa Tựu Trường (15/8 - 10/9/2025)

## Cách Sử Dụng

### 1. Banner Tự Động (Đã tích hợp)

Banner hiển thị tự động trên tất cả trang (trừ auth pages):

```tsx
// Đã được thêm vào AppLayout.tsx
<EventBanner />
```

### 2. Badge Sản Phẩm Trending

Thêm badge "Hot Tết", "Hot Trung Thu" vào sản phẩm:

```tsx
import { EventProductBadge } from "@/components/EventProductBadge";

<EventProductBadge
  productName="Bánh Chưng Truyền Thống"
  productTags={["tết", "bánh chưng"]}
/>;
```

### 3. Hook để Custom Logic

```tsx
import { useEventTheme } from "@/hooks/useEventTheme";

function MyComponent() {
  const { activeEvent, hasActiveEvent } = useEventTheme();

  if (hasActiveEvent && activeEvent) {
    console.log("Đang có sự kiện:", activeEvent.name);
    console.log("Theme colors:", activeEvent.theme);
    console.log("Còn lại:", activeEvent.daysRemaining, "ngày");
  }

  return <div>...</div>;
}
```

### 4. Context Provider (Optional)

Nếu muốn share state giữa nhiều components:

```tsx
import { EventThemeProvider } from "@/contexts/EventThemeProvider";

<EventThemeProvider>
  <YourApp />
</EventThemeProvider>;
```

## Thêm Sự Kiện Mới

Chỉnh sửa file `src/data/events-calendar.json`:

```json
{
  "id": "tet-2026",
  "name": "Tết Nguyên Đán 2026",
  "startDate": "2026-02-17",
  "endDate": "2026-02-23",
  "theme": {
    "id": "tet",
    "primaryColor": "#DC2626",
    "secondaryColor": "#FCD34D",
    "accentColor": "#EF4444",
    "backgroundColor": "#FEF3C7",
    "textColor": "#991B1B",
    "bannerText": "🧧 Tết Đến - Xuân Về 🎊",
    "keywords": ["bánh chưng", "mứt tết", "hoa mai"]
  }
}
```

## Tùy Chỉnh Theme

### Màu Sắc

Tất cả màu dùng Tailwind colors hoặc hex code:

- `primaryColor`: Màu chính (button, badge)
- `secondaryColor`: Màu phụ (hover, accent)
- `accentColor`: Màu nhấn mạnh
- `backgroundColor`: Màu nền banner
- `textColor`: Màu chữ

### Keywords

Danh sách từ khóa để match sản phẩm:

```json
"keywords": ["bánh chưng", "mứt tết", "hoa mai", "lì xì"]
```

Sản phẩm có tên hoặc tag chứa keyword sẽ hiện badge.

## CSS Animations

Các animation có sẵn trong `event-theme.css`:

- `.event-shimmer`: Hiệu ứng lấp lánh
- `.event-float`: Bay lơ lửng
- `.event-pulse-glow`: Phát sáng nhấp nháy
- `.event-badge`: Badge với hiệu ứng shine

## Performance

- ✅ Lightweight: Chỉ check 1 lần/giờ
- ✅ No API calls: Dùng file JSON tĩnh
- ✅ Lazy load: Chỉ render khi có event
- ✅ Dismissible: User có thể tắt banner

## Roadmap

- [ ] Admin panel để quản lý events
- [ ] A/B testing themes
- [ ] Analytics tracking (CTR, conversion)
- [ ] Dynamic product recommendations
- [ ] Integration với AI để suggest products
- [ ] Push notification khi có event mới

## Test Thử

Để test ngay bây giờ, sửa date trong `events-calendar.json` về hôm nay:

```json
"startDate": "2024-11-29",
"endDate": "2024-12-05"
```

Refresh page và bạn sẽ thấy banner + theme đổi màu!
