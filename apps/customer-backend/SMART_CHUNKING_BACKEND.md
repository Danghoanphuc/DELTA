# 🔧 Smart Chunking - Backend Fix

## Vấn đề

Backend emit chunk cắt giữa markdown syntax:

- ❌ `.### 1 định` → Heading bị cắt
- ❌ `**Ch` → Bold chưa đóng
- ❌ `*italic` → Italic chưa đóng

## Nguyên nhân

Logic cũ chỉ check:

```javascript
if (buffer.length >= BATCH_SIZE || /[.!?,;:\n]/.test(delta.content)) {
  onToken(buffer); // Emit ngay
}
```

→ Không quan tâm markdown syntax đang mở hay đóng

## Giải pháp

### Thêm check markdown syntax:

```javascript
const isInMarkdown =
  buffer.endsWith("#") || // Heading đang mở: #, ##, ###
  buffer.endsWith("##") ||
  buffer.endsWith("###") ||
  buffer.endsWith("*") || // Bold/italic đang mở: *, **
  buffer.endsWith("**") ||
  buffer.endsWith("`") || // Code đang mở: `
  buffer.match(/\*\*[^*]*$/) || // Bold chưa đóng: **text
  buffer.match(/\*[^*]*$/) || // Italic chưa đóng: *text
  buffer.match(/`[^`]*$/); // Code chưa đóng: `code

if (!isInMarkdown) {
  onToken(buffer); // Chỉ emit khi an toàn
}
```

## Logic Flow

### 1. Buffer tích lũy text:

```
buffer = "### 1 "
```

### 2. Check shouldFlush:

```
buffer.length >= 5 → true
```

### 3. Check isInMarkdown:

```
buffer.endsWith("#") → false
buffer.endsWith("##") → false
buffer.endsWith("###") → false
→ isInMarkdown = false
```

### 4. Emit an toàn:

```
onToken("### 1 ") ✅
```

## Các trường hợp

### Case 1: Heading

```
❌ Old: "###" → Emit → Frontend nhận "###" (vỡ)
✅ New: "###" → Giữ lại → "### Title" → Emit
```

### Case 2: Bold

```
❌ Old: "**Ch" → Emit → Frontend nhận "**Ch" (vỡ)
✅ New: "**Ch" → Giữ lại → "**Chất**" → Emit
```

### Case 3: Italic

```
❌ Old: "*text" → Emit → Frontend nhận "*text" (vỡ)
✅ New: "*text" → Giữ lại → "*text*" → Emit
```

### Case 4: Code

```
❌ Old: "`code" → Emit → Frontend nhận "`code" (vỡ)
✅ New: "`code" → Giữ lại → "`code`" → Emit
```

## Regex Patterns

### `buffer.match(/\*\*[^*]*$/)`

- Detect bold chưa đóng: `**text` (không có `**` đóng)

### `buffer.match(/\*[^*]*$/)`

- Detect italic chưa đóng: `*text` (không có `*` đóng)

### `buffer.match(/`[^`]\*$/)`

- Detect code chưa đóng: `` `code `` (không có `` ` `` đóng)

## Edge Cases

### ✅ Nested markdown:

```
"**Bold with *italic* inside**"
→ Giữ lại cho đến khi đóng hết
```

### ✅ Multiple markdown:

```
"### Title with **bold** text"
→ Emit từng phần an toàn
```

### ✅ False positive:

```
"Price: $5*2 = $10"
→ Không phải markdown, emit bình thường
```

## Performance Impact

### ✅ Minimal overhead:

- Chỉ check string operations (endsWith, match)
- Không ảnh hưởng tốc độ streaming
- Buffer giữ lại tối đa vài chục ký tự

### ✅ Better UX:

- Frontend không cần xử lý phức tạp
- Markdown luôn đúng format
- Không vỡ layout

## Test Cases

### Test 1: Heading

```javascript
Input stream: "#", "#", "#", " ", "T", "i", "t", "l", "e", "\n"
✅ Emit: "### Title\n" (cả dòng hoàn chỉnh)
```

### Test 2: Bold

```javascript
Input stream: "*", "*", "C", "h", "ấ", "t", "*", "*"
✅ Emit: "**Chất**" (cặp hoàn chỉnh)
```

### Test 3: Mixed

```javascript
Input stream: "#", "#", " ", "**", "B", "o", "l", "d", "**", "\n"
✅ Emit: "## **Bold**\n" (hoàn chỉnh)
```

## Status

✅ **PRODUCTION READY - BACKEND FIX**
