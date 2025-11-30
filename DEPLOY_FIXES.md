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

## Deploy Ready

✅ All builds successful  
✅ No TypeScript errors  
✅ Docker configs fixed  
✅ Ready to push
