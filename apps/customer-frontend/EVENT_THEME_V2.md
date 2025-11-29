# 🎨 Event Theme System V2 - Subtle & Professional

## Nguyên Tắc Thiết Kế

### ✅ ĐÚNG: Chỉ thay đổi Mood (Cảm xúc)

- Màu sắc buttons, badges, highlights
- Hiệu ứng particles nhẹ nhàng (lá rơi, tuyết rơi...)
- Micro-interactions (hover effects)

### ❌ SAI: Không thay đổi Layout

- Vị trí nút "Mua ngay", giỏ hàng, search bar
- Cấu trúc trang, navigation
- Typography chính, logo, footer

## Cách Hoạt Động

### 1. CSS Variables (Lớp Theme)

System inject 3 màu chính vào `:root`:

```css
--color-theme-primary: 220 38 38; /* Màu chính (buttons, badges) */
--color-theme-secondary: 245 158 11; /* Màu phụ (backgrounds) */
--color-theme-accent: 251 146 60; /* Màu nhấn (highlights) */
```

### 2. Tailwind Classes

Dùng trong code:

```tsx
<button className="bg-theme-primary text-white">
  Mua Ngay
</button>

<div className="border-theme-primary/20">
  Product Card
</div>
```

### 3. Particles Effect

Hiệu ứng nhẹ nhàng, không che nội dung:

- Tết: 🧧 🎊 🏮 🌸
- Valentine: 💝 💕 🌹
- Trung Thu: 🏮 🥮 🌕
- Christmas: 🎄 🎅 ⛄

Chỉ 8 particles, opacity 60%, không làm rối mắt.

## Components

### EventBanner (Invisible)

Không render gì cả, chỉ inject CSS variables vào `:root`.

### EventParticles

Hiệu ứng particles nhẹ, `pointer-events: none`, không ảnh hưởng UX.

### EventProductBadge

Badge nhỏ "Hot" cho sản phẩm liên quan event.

### EventThemeDemo (Dev Only)

Box nhỏ góc dưới phải, chỉ hiện trong dev mode.

## Tích Hợp Vào Code

### Button với Theme Color

```tsx
// Thay vì hardcode màu
<button className="bg-blue-500">Mua Ngay</button>

// Dùng theme color
<button className="bg-theme-primary hover:bg-theme-primary/90">
  Mua Ngay
</button>
```

### Product Card với Theme Border

```tsx
<div className="border-2 border-gray-200 hover:border-theme-primary/30 transition-colors">
  <img src={product.image} />
  <EventProductBadge productName={product.name} productTags={product.tags} />
</div>
```

### Badge với Theme Color

```tsx
<span className="bg-theme-primary text-white px-2 py-1 rounded-full text-xs">
  Sale 50%
</span>
```

## Accessibility

### Contrast Ratio

Tất cả màu đã test với WCAG AA:

- Text trên nền theme: ≥ 4.5:1
- Large text: ≥ 3:1

### Toggle Off

User có thể tắt theme trong Settings (TODO):

```tsx
<label>
  <input type="checkbox" />
  Tắt giao diện lễ hội
</label>
```

## Performance

- ✅ Zero layout shift
- ✅ CSS variables: instant switch
- ✅ Particles: CSS animation (GPU accelerated)
- ✅ No JavaScript heavy lifting

## Test

1. Restart dev server
2. Mở browser
3. Thấy:
   - Particles nhẹ nhàng rơi xuống
   - Demo box góc dưới phải (dev only)
   - Layout KHÔNG thay đổi
   - Chỉ màu sắc khác đi

## Roadmap

- [ ] Admin panel để quản lý themes
- [ ] Toggle tắt theme trong Settings
- [ ] A/B testing themes
- [ ] Analytics: track conversion rate theo theme
- [ ] Custom cursor cho mỗi event
- [ ] Sound effects (optional, có toggle)

## So Sánh V1 vs V2

| Feature          | V1 (Xấu)           | V2 (Đẹp)    |
| ---------------- | ------------------ | ----------- |
| Banner           | ✅ Có (phá layout) | ❌ Không có |
| Particles        | ❌ Không           | ✅ Có (nhẹ) |
| Layout thay đổi  | ❌ Có              | ✅ Không    |
| CSS Variables    | ❌ Không           | ✅ Có       |
| Tailwind support | ❌ Không           | ✅ Có       |
| Professional     | ❌ Không           | ✅ Có       |

V2 là phiên bản production-ready, V1 chỉ là demo.
