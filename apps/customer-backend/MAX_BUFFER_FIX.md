# 🚨 Max Buffer Fix - Tránh Lag 4 Giây

## Vấn đề

Smart chunking quá strict → Buffer tích lũy quá lâu → Lag 4s → Ném cả chunk lớn → Giật

### Ví dụ:

```
Buffer giữ lại: "### 1: Tên quán:\n\n**Hiện đại:**..."
→ Chờ markdown đóng hoàn chỉnh
→ 4 giây không emit gì
→ Cuối cùng emit 50+ chars cùng lúc
→ Giật lag
```

## Nguyên nhân

Logic cũ:

```javascript
if (isInMarkdown) {
  // Giữ lại buffer vô thời hạn ❌
}
```

→ Nếu markdown phức tạp, buffer có thể tích lũy rất lâu

## Giải pháp

### Thêm MAX_BUFFER_SIZE:

```javascript
const MAX_BUFFER_SIZE = 50; // Force emit nếu buffer > 50 chars

if (buffer.length >= MAX_BUFFER_SIZE) {
  onToken(buffer); // Force emit ngay
  buffer = "";
  continue;
}
```

## Logic Flow

### Case 1: Buffer nhỏ (< 50 chars)

```
buffer = "### Title"
→ isInMarkdown = true
→ Giữ lại chờ hoàn chỉnh
→ buffer = "### Title\n"
→ Emit ✅
```

### Case 2: Buffer lớn (> 50 chars)

```
buffer = "### 1: Tên quán:\n\n**Hiện đại:** Sử dụng..."
→ buffer.length = 55 > MAX_BUFFER_SIZE
→ Force emit ngay (không chờ markdown) ✅
→ Frontend smooth lại
```

## Balance

### ⚖️ Trade-off:

- **Nhỏ hơn 50 chars:** Chờ markdown hoàn chỉnh (tránh vỡ)
- **Lớn hơn 50 chars:** Emit ngay (tránh lag)

### ✅ Kết quả:

- Không lag 4 giây
- Markdown vẫn đúng format (hầu hết trường hợp)
- Nếu vỡ → Frontend smooth lại

## Frontend Smooth

### Re-enable smooth streaming:

```typescript
// useSmoothStream.ts
if (!isStreaming) {
  setDisplayedText(rawText); // Hiện ngay
  return;
}

// Smooth animation cho streaming
const animate = () => {
  // Nhả từng ký tự...
};
```

### Tại sao cần smooth lại?

- Backend có thể emit chunk lớn (50 chars)
- Frontend smooth để tránh giật
- Nhưng không vỡ markdown (vì backend đã xử lý)

## Test Cases

### Test 1: Markdown ngắn

```
Input: "### Title\n"
Buffer: 11 chars < 50
→ Chờ hoàn chỉnh ✅
→ Emit: "### Title\n"
```

### Test 2: Markdown dài

```
Input: "### 1: Tên quán:\n\n**Hiện đại:** Sử dụng kiểu chữ..."
Buffer: 60 chars > 50
→ Force emit ngay ✅
→ Frontend smooth lại
```

### Test 3: Nested markdown

```
Input: "**Bold with *italic* inside**"
Buffer: 30 chars < 50
→ Chờ hoàn chỉnh ✅
→ Emit: "**Bold with *italic* inside**"
```

## Configuration

### Có thể điều chỉnh:

```javascript
const BATCH_SIZE = 5; // Kích thước chunk nhỏ
const MAX_BUFFER_SIZE = 50; // Giới hạn buffer tối đa
```

### Gợi ý:

- `MAX_BUFFER_SIZE = 30`: Nhanh hơn, có thể vỡ markdown nhiều hơn
- `MAX_BUFFER_SIZE = 50`: Balance tốt (recommended)
- `MAX_BUFFER_SIZE = 100`: Chậm hơn, ít vỡ markdown hơn

## Status

✅ **PRODUCTION READY - BALANCED SOLUTION**
