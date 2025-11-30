# ✅ Pre-Deploy Checklist

## Local Verification (Đã hoàn thành)

- [x] Build `packages/types` thành công
- [x] Build `apps/admin-backend` thành công
- [x] Không có TypeScript errors
- [x] Test imports thành công (test-imports.mjs)
- [x] Không có lỗi `.js.js` double extension

## Files Changed Summary

### packages/types

- ✅ `package.json` - Cấu hình exports cho models
- ✅ `src/index.ts` - Export models
- ✅ `src/models/user.model.ts` - NEW
- ✅ `src/models/printer-profile.model.ts` - NEW
- ✅ `src/models/product.model.ts` - NEW
- ✅ `src/models/design-template.model.ts` - NEW
- ✅ `src/models/customer-profile.model.ts` - NEW

### apps/admin-backend

- ✅ `src/services/admin.user.service.ts` - Updated imports
- ✅ `src/services/admin.product.service.ts` - Updated imports
- ✅ `src/services/admin.printer.service.ts` - Updated imports
- ✅ `src/services/admin.content.service.ts` - Updated imports
- ✅ `src/models/printer-profile.model.ts` - Re-export from @printz/types

## Deploy Steps

### 1. Commit Changes

```bash
git add .
git commit -m "fix: Move shared models to @printz/types to fix Docker build

- Moved 5 shared models from customer-backend to packages/types
- Updated admin-backend to import from @printz/types
- Fixed ESM exports configuration
- Resolves ERR_MODULE_NOT_FOUND in production"
```

### 2. Push to Git

```bash
git push origin main
```

### 3. Monitor Render Deploy

- Render sẽ tự động trigger build
- Kiểm tra logs: https://dashboard.render.com

### 4. Verify Production

```bash
# Check health endpoint
curl https://your-admin-backend.onrender.com/health

# Check logs
render logs admin-backend --tail
```

## Expected Build Output

### Turbo Prune (Docker)

```
✅ Keeping: apps/admin-backend
✅ Keeping: packages/types (dependency)
❌ Pruning: apps/customer-backend (not needed)
```

### Build Success Indicators

```
✅ packages/types: Build successful
✅ apps/admin-backend: Build successful
✅ No ERR_MODULE_NOT_FOUND errors
✅ Server starts successfully
```

## Rollback Plan (If needed)

Nếu deploy fail, rollback bằng cách:

1. Revert commit:

```bash
git revert HEAD
git push origin main
```

2. Hoặc deploy commit trước đó:

```bash
git reset --hard <previous-commit-hash>
git push origin main --force
```

## Common Issues & Solutions

### Issue: ERR_MODULE_NOT_FOUND với `.js.js`

**Solution**: Đã fix bằng cách dùng explicit exports thay vì wildcard

### Issue: Mongoose model already defined

**Solution**: Models chỉ được define một lần trong @printz/types

### Issue: bcrypt not found

**Solution**: Đã thêm bcrypt vào dependencies của @printz/types

## Post-Deploy Verification

- [ ] Admin backend starts without errors
- [ ] Health check endpoint responds
- [ ] Can login to admin panel
- [ ] Can view users list
- [ ] Can view printers list
- [ ] Can view products list
- [ ] Worker processes run successfully

## Notes

- Customer backend không bị ảnh hưởng (vẫn dùng models cũ)
- Không có breaking changes cho API endpoints
- Models trong customer-backend/src/shared/models/ vẫn tồn tại
