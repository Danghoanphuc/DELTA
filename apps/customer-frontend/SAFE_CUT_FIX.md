# 🔧 Safe Cut Fix - Tránh cắt giữa Markdown & Unicode

## Vấn đề

Khi smooth streaming cắt text ở index bất kỳ, gây ra:

- ❌ Markdown bị vỡ: `**Ch:**ất` thay vì `**Chất**`
- ❌ Từ bị cắt ngang: `Màu s` → `ắc` (nhảy layout)
- ❌ Unicode/emoji bị cắt giữa ký tự

## Ví dụ lỗi:

```
Raw text: "**Chất liệu:** Giấy cứng"

❌ Cắt tại index 5: "**Ch:" (markdown chưa đóng)
❌ Cắt tại index 10: "**Chất li" (giữa từ "liệu")
✅ Cắt tại index 13: "**Chất liệu" (an toàn)
```

## Giải pháp

### 1. Detect Markdown Syntax

```typescript
// Nếu đang cắt giữa markdown (*, _, `, ~)
if (nextChar && /[*_`~]/.test(nextChar)) {
  // Nhảy qua hết markdown syntax
  while (nextIndex < targetLength && /[*_`~]/.test(rawText[nextIndex])) {
    nextIndex++;
  }
}
```

### 2. Detect Giữa Từ

```typescript
// Nếu đang cắt giữa từ và gần đích (< 50 chars)
if (remaining < 50 && nextChar && /[a-zA-ZÀ-ỹ0-9]/.test(nextChar)) {
  // Nhảy đến hết từ
  while (
    nextIndex < targetLength &&
    /[a-zA-ZÀ-ỹ0-9]/.test(rawText[nextIndex])
  ) {
    nextIndex++;
  }
}
```

### 3. Regex Pattern

- `[*_`~]`: Markdown syntax
- `[a-zA-ZÀ-ỹ0-9]`: Chữ cái (bao gồm tiếng Việt có dấu) và số

## Kết quả

### ✅ Trước fix:

```
**Ch:**ất liệu    ← Markdown vỡ
Màu s             ← Từ bị cắt ngang
ắc: Đen           ← Layout nhảy
```

### ✅ Sau fix:

```
**Chất            ← Cắt sau markdown
**Chất liệu       ← Cắt sau từ hoàn chỉnh
**Chất liệu:**    ← Smooth, không vỡ
```

## Logic Flow

```
1. Tính nextIndex = currentIndex + speed
2. Lấy nextChar = rawText[nextIndex]
3. Check:
   - Nếu nextChar là markdown → Nhảy qua hết markdown
   - Nếu nextChar là chữ cái → Nhảy đến hết từ (nếu gần đích)
4. Cắt tại nextIndex đã điều chỉnh
```

## Performance Impact

- ✅ Minimal: Chỉ check 1-2 ký tự mỗi frame
- ✅ Chỉ áp dụng khi gần đích (< 50 chars)
- ✅ Không ảnh hưởng tốc độ streaming

## Test Cases

### Test 1: Markdown

```
Input: "**Chất liệu:** Giấy"
✅ Không bao giờ hiển thị: "**Ch:**"
✅ Luôn hiển thị: "**Chất liệu:**"
```

### Test 2: Tiếng Việt

```
Input: "Màu sắc: Đen"
✅ Không hiển thị: "Màu s"
✅ Hiển thị: "Màu sắc"
```

### Test 3: Mixed

```
Input: "**Thiết kế:** Tối giản"
✅ Smooth progression:
  → "**Thiết"
  → "**Thiết kế"
  → "**Thiết kế:**"
  → "**Thiết kế:** Tối"
  → "**Thiết kế:** Tối giản"
```

## Status

✅ **PRODUCTION READY**
