# 🚀 Quick Deploy Guide - Customer Backend

## ✅ Fixes Applied

### 1. Model Overwrite Error - FIXED ✅

- All 5 Mongoose models now use caching pattern
- Prevents `OverwriteModelError` when routes import models multiple times

### 2. Redis Quota - KNOWN ISSUE ⚠️

- Upstash free tier quota exceeded (500k requests/month)
- Server will run but with limited functionality:
  - ❌ No caching
  - ❌ No rate limiting
  - ❌ No background queues
  - ✅ Core API still works

## 📋 Pre-Deploy Checklist

1. **Verify builds are clean**:

   ```bash
   pnpm build
   ```

2. **Check environment variables on Render**:

   - ✅ MONGODB_URI (or MONGODB_CONNECTIONSTRING)
   - ⚠️ REDIS_URL (currently over quota)
   - ✅ All other API keys (Stripe, Cloudinary, etc.)

3. **Commit and push**:
   ```bash
   git add .
   git commit -m "fix: resolve Mongoose model overwrite error in production"
   git push origin main
   ```

## 🐳 Docker Deploy (Render)

Render will automatically:

1. Pull latest code
2. Build Docker image using `apps/customer-backend/Dockerfile`
3. Run the container

**Expected behavior**:

- ✅ Server starts successfully
- ⚠️ Redis warnings (quota exceeded) - this is expected
- ✅ MongoDB connects
- ✅ Routes load without model errors

## 🔍 Monitoring After Deploy

### Check logs for these success indicators:

```
✅ [Server] Database connected
⚠️ [Server] Redis unavailable - continuing without Redis
✅ [Server] Đã import tất cả routes thành công!
🚀 Server đang chạy tại http://localhost:8000
```

### Expected warnings (safe to ignore):

```
⚠️ [WARN] Gọi getRedisClient() khi client chưa 'ready'
⚠️ [BullMQ] Redis quota exceeded
⚠️ [Hàng đợi thông báo] Kết nối Redis bị từ chối
```

### Critical errors to watch for:

```
❌ OverwriteModelError: Cannot overwrite 'User' model  <- Should NOT appear anymore
❌ Lỗi khởi động server nghiêm trọng
```

## 🛠️ Redis Solutions

### Option 1: Wait for quota reset (Free)

- Upstash quota resets at start of each month
- Check dashboard: https://console.upstash.com/

### Option 2: Upgrade Upstash (Recommended)

- Pay-as-you-go: $0.20 per 100k requests
- Pro plan: $10/month for 1M requests

### Option 3: Switch Redis provider

- Redis Labs (free 30MB)
- AWS ElastiCache
- Self-hosted Redis on VPS

### Option 4: Disable Redis temporarily

- Server already handles Redis unavailability gracefully
- Core functionality works without Redis

## 📞 Support

If deployment fails:

1. Check Render logs for specific error
2. Verify all environment variables are set
3. Ensure Docker build completes successfully
4. Check MongoDB connection string is valid

## 🎯 Success Criteria

✅ Server starts without crashing  
✅ No OverwriteModelError in logs  
✅ API endpoints respond (test with /api/health)  
✅ MongoDB queries work  
⚠️ Redis warnings are expected and safe to ignore
