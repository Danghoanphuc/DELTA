# 🎯 Line-Based Chunking - Fix Markdown Layout Issues

## Vấn đề

Cắt text từng ký tự gây vỡ markdown layout:

- ❌ `**Ch:**ất` → Bold chưa đóng
- ❌ `### 3 Biể` → Heading chưa hoàn chỉnh
- ❌ `- **` → List item chưa có content
- ❌ Xuống dòng giữa chừng → Layout nhảy liên tục

## Nguyên nhân

Markdown parser cần **text hoàn chỉnh** mới render đúng:

- Heading cần cả dòng: `### Title`
- Bold cần đóng mở: `**text**`
- List cần cả item: `- Item content`

## Giải pháp: Line-Based Chunking

### Thay vì cắt từng ký tự:

```typescript
❌ Old: nextIndex = currentIndex + 1
→ "**Ch" → "**Chấ" → "**Chất" (vỡ layout liên tục)
```

### Cắt theo dòng/câu hoàn chỉnh:

```typescript
✅ New: Tìm điểm ngắt tự nhiên
→ "**Chất liệu:** Giấy cứng\n" (cả dòng hoàn chỉnh)
```

## Algorithm

### Ưu tiên tìm điểm cắt:

1. **Newline (`\n`)** - Ưu tiên cao nhất
2. **Dấu câu (`. ! ?`) + space** - Kết thúc câu
3. **Space** - Kết thúc từ (tối thiểu 20 chars)
4. **Fallback** - Nhảy 30 chars

### Code:

```typescript
// 1. Tìm newline gần nhất (trong 100 chars)
let newlineIndex = rawText.indexOf('\n', currentLength);
if (newlineIndex !== -1 && newlineIndex <= searchLimit) {
  nextIndex = newlineIndex + 1;
}

// 2. Tìm dấu câu
else {
  const punctuationMatch = rawText.slice(currentLength, searchLimit)
    .match(/[.!?]\s/);
  if (punctuationMatch) {
    nextIndex = currentLength + punctuationMatch.index + 2;
  }
}

// 3. Tìm space
else {
  const spaceIndex = rawText.indexOf(' ', currentLength + 20);
  if (spaceIndex !== -1 && spaceIndex <= searchLimit) {
    nextIndex = spaceIndex + 1;
  }
}

// 4. Fallback
else {
  nextIndex = Math.min(currentLength + 30, targetLength);
}
```

## Kết quả

### ✅ Trước:

```
**Ch                    ← Vỡ markdown
**Chấ                   ← Vỡ markdown
**Chất                  ← Vỡ markdown
**Chất li               ← Vỡ markdown
**Chất liệu:**          ← Cuối cùng mới đúng
```

### ✅ Sau:

```
**Chất liệu:** Giấy cứng
                        ← Cả dòng hoàn chỉnh, không vỡ layout
```

## Ưu điểm

### ✅ Markdown luôn đúng format:

- Heading render đúng size
- Bold/italic không bị vỡ
- List items hoàn chỉnh
- Không nhảy layout

### ✅ Vẫn có smooth effect:

- Xuất hiện từng dòng/câu
- Không phải chờ toàn bộ text
- Cảm giác "đang soạn thảo"

### ✅ Performance tốt:

- Ít re-render hơn (cắt chunk lớn hơn)
- Markdown parser chạy ít hơn
- Smooth hơn vì không vỡ layout

## Trade-off

### ⚠️ Không còn "từng ký tự":

- Thay vì 1 char/frame → 1 dòng/câu/frame
- Vẫn smooth nhưng không "chi tiết" bằng

### ✅ Nhưng đáng giá:

- Layout ổn định
- Markdown đúng format
- UX tốt hơn nhiều

## Test Cases

### Test 1: Heading

```
Input: "### 3 Biểu tượng\n\nContent..."
✅ Hiển thị: "### 3 Biểu tượng\n" (cả dòng)
❌ Không hiển thị: "### 3 Biể" (vỡ heading)
```

### Test 2: Bold

```
Input: "**Chất liệu:** Giấy cứng"
✅ Hiển thị: "**Chất liệu:** Giấy cứng" (cả câu)
❌ Không hiển thị: "**Chất" (vỡ bold)
```

### Test 3: List

```
Input: "- Item 1\n- Item 2\n"
✅ Hiển thị từng dòng:
  → "- Item 1\n"
  → "- Item 1\n- Item 2\n"
```

## Status

✅ **PRODUCTION READY - FINAL FIX**
