# 🔄 Rollback to Simple Version

## Quyết định

Hoàn tác tất cả các tính năng phức tạp (forceSmooth, timestamp tracking, etc.) về version đơn giản ban đầu.

## Lý do

- Các tính năng phức tạp gây ra nhiều vấn đề hơn là giải quyết
- Version đơn giản hoạt động tốt cho use case chính (streaming chat)
- URL worker không cần smooth effect (có thể chấp nhận hiển thị ngay)

## Version hiện tại (Simple & Stable)

### `useSmoothStream.ts`

```typescript
export function useSmoothStream(rawText: string, isStreaming: boolean): string;
```

**Chỉ có 2 parameters:**

- `rawText`: Text cần hiển thị
- `isStreaming`: Có đang stream không

**Logic đơn giản:**

- Nếu `isStreaming = true` → Smooth effect
- Nếu `isStreaming = false` → Hiển thị ngay lập tức

### `MessageContent.tsx`

```typescript
const isStreaming = metadata.status === "streaming";
const smoothContent = useSmoothStream(
  cleanContent,
  isStreaming && !isUserMessage
);
```

**Chỉ áp dụng smooth cho:**

- Bot messages (`!isUserMessage`)
- Đang streaming (`status === "streaming"`)

## Kết quả

### ✅ Hoạt động tốt:

- Chat streaming thường: Smooth effect mượt mà
- Message cũ: Hiển thị ngay lập tức
- Switch conversation: Không có vấn đề (vì không streaming)

### ⚠️ Không smooth:

- URL worker response (hiển thị ngay cả cục)
- Message completed từ backend

### Kết luận:

**Đơn giản là tốt nhất.** Version này stable và đủ dùng cho 90% use cases.

Nếu cần smooth cho URL worker, nên làm ở backend (emit chunks) thay vì hack ở frontend.
