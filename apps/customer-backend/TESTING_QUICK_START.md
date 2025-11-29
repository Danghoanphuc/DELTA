# 🚀 Testing Quick Start

## Chạy Tests Trước Khi Deploy

### Windows

```bash
npm run predeploy
```

### Linux/Mac

```bash
npm run predeploy:unix
```

## Các Lệnh Thường Dùng

```bash
# Test toàn bộ
npm run test:all

# Test môi trường production
npm run test:prod

# Test workers
npm run test:workers
```

## Khi Nào Cần Chạy Tests?

✅ **BẮT BUỘC:**

- Trước mỗi lần deploy lên production
- Sau khi sửa worker code
- Sau khi thay đổi MongoDB queries
- Sau khi thêm/sửa Redis logic

⚠️ **NÊN CHẠY:**

- Trước mỗi commit quan trọng
- Sau khi merge branch
- Khi thêm dependency mới

## Nếu Tests Fail

1. **Đọc error message** - thường rất rõ ràng
2. **Không skip tests** - fix lỗi trước khi deploy
3. **Kiểm tra file được báo lỗi**
4. **Chạy lại sau khi fix**

## Ví Dụ Output Thành Công

```
✅ TẤT CẢ TESTS ĐỀU PASS! An toàn để deploy.

Passed:   7
Failed:   0
Warnings: 0
```

## Ví Dụ Output Có Lỗi

```
❌ CÓ 2 TESTS FAILED! Không nên deploy.

❌ CÁC LỖI CẦN SỬA:
  1. src/workers/printer.health.worker.ts: Dấu phẩy thừa trong $cond
  2. src/infrastructure/queue/url-preview.worker.js: Thiếu circuit breaker
```

## Tích Hợp Vào Workflow

### Pre-commit Hook (Tự động)

```bash
# Tạo file .git/hooks/pre-commit
#!/bin/bash
npm run test:all
```

### CI/CD (GitHub Actions)

```yaml
- name: Run Tests
  run: npm run test:all
```

## Xem Chi Tiết

Đọc `scripts/README_TESTING.md` để biết thêm chi tiết về:

- Cách hoạt động của từng test
- Cách thêm test mới
- Troubleshooting
- Best practices
