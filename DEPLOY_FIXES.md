# 🔧 Docker Build Fixes - Production Deploy

## Vấn Đề Đã Fix

### 1. Cross-Project Imports (Admin Backend)

**Lỗi**: `ERR_MODULE_NOT_FOUND` - Admin import từ customer-backend  
**Fix**: Di chuyển 5 shared models sang `@printz/types`

### 2. ESM Double Extension (.js.js)

**Lỗi**: Import path bị compile thành `.js.js`  
**Fix**: Dùng explicit exports thay vì wildcard trong package.json

### 3. bcrypt Native Binding

**Lỗi**: `Cannot find module 'bcrypt_lib.node'`  
**Fix**: Thêm build tools (python3, make, g++) vào Dockerfile

## Files Changed

### packages/types

- Added 5 shared models (user, printer-profile, product, design-template, customer-profile)
- Updated package.json with explicit exports
- Added dependencies: mongoose, bcrypt

### apps/admin-backend

- Updated 4 service files to import from @printz/types
- Fixed Dockerfile: added build tools, removed --ignore-scripts
- Re-export printer-profile.model from @printz/types

### apps/customer-backend

- Fixed Dockerfile: added build tools, removed --ignore-scripts

### 4. Mongoose Model Overwrite Error (Customer Backend)

**Lỗi**: `OverwriteModelError: Cannot overwrite 'User' model once compiled`  
**Nguyên nhân**: Models trong `@printz/types` được import nhiều lần khi load routes, Mongoose không cho phép compile lại model đã tồn tại  
**Fix**: Thêm model caching cho tất cả 5 models:

```typescript
// ❌ Before
export const User = mongoose.model("User", UserSchema);

// ✅ After
export const User = mongoose.models.User || mongoose.model("User", UserSchema);
```

**Models đã fix**:

- user.model.ts
- printer-profile.model.ts
- product.model.ts
- design-template.model.ts
- customer-profile.model.ts

### 5. Redis Quota Exceeded (Upstash)

**Lỗi**: `ERR max requests limit exceeded. Limit: 500000, Usage: 500000`  
**Nguyên nhân**: Upstash Redis free tier đã hết quota 500,000 requests/tháng  
**Giải pháp**:

**Tạm thời (Đã áp dụng trong code)**:

- ✅ URL Preview Worker đã bị tắt (comment trong server.ts)
- ✅ Notification Worker có circuit breaker để tự động retry
- ⚠️ Server vẫn chạy được nhưng không có caching, rate limiting, và queues

**Lâu dài (Cần thực hiện)**:

1. **Chờ đầu tháng sau** - Quota sẽ reset về 0
2. **Upgrade Upstash plan** - Tăng quota lên 1M+ requests/tháng
3. **Chuyển sang Redis khác** - Redis Labs, AWS ElastiCache, hoặc self-hosted
4. **Tối ưu Redis usage**:
   - Giảm TTL của cache
   - Giảm số lượng workers
   - Implement request batching

**Kiểm tra quota hiện tại**:

- Vào Upstash Dashboard: https://console.upstash.com/
- Xem Usage tab để biết khi nào quota reset

## Deploy Ready

✅ All builds successful  
✅ No TypeScript errors  
✅ Docker configs fixed  
✅ Model caching implemented  
⚠️ Redis quota exceeded - server chạy với chức năng hạn chế  
✅ Ready to push (với lưu ý về Redis)
