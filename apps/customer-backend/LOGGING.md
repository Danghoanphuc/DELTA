# Logging Configuration Guide

## Vấn đề: Server startup quá ồn ào

Khi khởi động server, bạn có thể thấy rất nhiều log messages:

```
ℹ️ [INFO] 📦 [Server] Importing auth routes...
ℹ️ [INFO] 📦 [Server] Importing user routes...
ℹ️ [INFO] 📦 [Server] Importing product routes...
... (hàng chục dòng tương tự)
```

## Giải pháp: Điều chỉnh LOG_LEVEL

### Cách 1: Giảm log level trong `.env`

Thêm hoặc sửa dòng này trong file `.env`:

```bash
# Chỉ hiển thị warnings và errors (khuyến nghị cho development)
LOG_LEVEL=WARN

# Hoặc chỉ hiển thị errors (production)
LOG_LEVEL=ERROR

# Hoặc hiển thị tất cả (bao gồm debug logs)
LOG_LEVEL=DEBUG
```

### Cách 2: Set environment variable khi chạy

```bash
# Windows (CMD)
set LOG_LEVEL=WARN && pnpm dev

# Windows (PowerShell)
$env:LOG_LEVEL="WARN"; pnpm dev

# Linux/Mac
LOG_LEVEL=WARN pnpm dev
```

## Log Levels

| Level | Value | Hiển thị gì         | Khi nào dùng                       |
| ----- | ----- | ------------------- | ---------------------------------- |
| ERROR | 0     | Chỉ errors          | Production, khi cần tối thiểu logs |
| WARN  | 1     | Warnings + Errors   | Development, giảm noise            |
| INFO  | 2     | Info + Warn + Error | Default development                |
| DEBUG | 3     | Tất cả logs         | Debugging, troubleshooting         |

## Mặc định

- **Development** (`NODE_ENV=development`): `LOG_LEVEL=INFO`
- **Production** (`NODE_ENV=production`): `LOG_LEVEL=WARN`

## Ví dụ output với các levels

### LOG_LEVEL=ERROR

```
❌ [ERROR] Failed to connect to database
```

### LOG_LEVEL=WARN

```
⚠️ [WARN] Redis connection slow
❌ [ERROR] Failed to connect to database
```

### LOG_LEVEL=INFO (default)

```
ℹ️ [INFO] ✅ Routes imported successfully
✅ [SUCCESS] ✅ Database connected
⚠️ [WARN] Redis connection slow
❌ [ERROR] Failed to connect to database
```

### LOG_LEVEL=DEBUG

```
🐞 [DEBUG] 📦 [Server] Importing routes...
ℹ️ [INFO] ✅ Routes imported successfully
✅ [SUCCESS] ✅ Database connected
⚠️ [WARN] Redis connection slow
❌ [ERROR] Failed to connect to database
```

## Mongoose Warnings

Nếu bạn thấy warnings về duplicate indexes:

```
(node:19176) [MONGOOSE] Warning: Duplicate schema index on {"inviteToken":1}
```

Đây là vấn đề ở schema level, không liên quan đến LOG_LEVEL. Để tắt:

```javascript
// Trong file schema
mongoose.set("strictQuery", false);
```

Hoặc chạy với flag:

```bash
node --no-warnings src/server.ts
```

## Khuyến nghị

**Cho development thông thường:**

```bash
LOG_LEVEL=WARN
```

**Khi debug issues:**

```bash
LOG_LEVEL=DEBUG
```

**Cho production:**

```bash
LOG_LEVEL=ERROR
```
