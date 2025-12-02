# ✅ TODO - Monitoring Setup

**Estimated Time:** 15 phút  
**Status:** 1/4 DSN configured

---

## 🔑 Step 1: Get Sentry DSN (5 phút)

Truy cập: https://sentry.io

### ✅ Admin Frontend - DONE

```
DSN: https://9dc828c2808a5a469349b03f2623a39c@o4510433602502656.ingest.us.sentry.io/4510462554734592
File: apps/admin-frontend/.env.local ✅
```

### ⏳ Admin Backend - TODO

```
1. Create project: printz-admin-backend (Node.js)
2. Go to Settings > Client Keys (DSN)
3. Copy DSN
4. Paste vào: apps/admin-backend/.env
```

### ⏳ Customer Backend - TODO

```
1. Create project: printz-customer-backend (Node.js)
2. Go to Settings > Client Keys (DSN)
3. Copy DSN
4. Paste vào: apps/customer-backend/.env
```

### ⏳ Customer Frontend - TODO

```
1. Create project: printz-customer-frontend (React)
2. Go to Settings > Client Keys (DSN)
3. Copy DSN
4. Paste vào: apps/customer-frontend/.env.local
```

---

## 📝 Step 2: Get Logtail Tokens (3 phút)

Truy cập: https://betterstack.com/logtail

### ⏳ Admin Backend - TODO

```
1. Create source: printz-admin-backend
2. Copy token
3. Paste vào: apps/admin-backend/.env
   LOGTAIL_TOKEN=your-token-here
```

### ⏳ Customer Backend - TODO

```
1. Create source: printz-customer-backend
2. Copy token
3. Paste vào: apps/customer-backend/.env
   LOGTAIL_TOKEN=your-token-here
```

---

## ⚙️ Step 3: Configure .env Files (2 phút)

### ⏳ Admin Backend

```bash
cd apps/admin-backend
cp .env.example .env

# Edit .env:
SENTRY_DSN=<paste-dsn-here>
LOGTAIL_TOKEN=<paste-token-here>
NODE_ENV=development
```

### ⏳ Customer Backend

```bash
cd apps/customer-backend
cp .env.example .env

# Edit .env:
SENTRY_DSN=<paste-dsn-here>
LOGTAIL_TOKEN=<paste-token-here>
NODE_ENV=development
```

### ⏳ Customer Frontend

```bash
cd apps/customer-frontend
cp .env.example .env.local

# Edit .env.local:
VITE_SENTRY_DSN=<paste-dsn-here>
```

---

## 🧪 Step 4: Test Everything (5 phút)

### ⏳ Test Sentry Integration

```bash
# Test all
pnpm test:sentry:all

# Or individually
cd apps/admin-backend && node scripts/test-sentry.js
cd apps/customer-backend && node scripts/test-sentry.js
```

### ⏳ Start Applications

```bash
# Terminal 1: Admin
pnpm dev:admin

# Terminal 2: Customer
pnpm dev
```

### ⏳ Test Health Endpoints

```bash
curl http://localhost:5001/health
curl http://localhost:5000/health
```

### ⏳ Trigger Test Errors

**Admin Frontend:**

```javascript
// In browser console
throw new Error("Test error for Admin Frontend");
```

**Customer Frontend:**

```javascript
// In browser console
throw new Error("Test error for Customer Frontend");
```

### ⏳ Check Dashboards

- [ ] Sentry: https://sentry.io - Check all 4 projects
- [ ] Logtail: https://betterstack.com/logtail - Check 2 sources

---

## 🚨 Step 5: Setup Uptime Kuma (5 phút)

### ⏳ Start Uptime Kuma

```bash
# Login to Docker Hub
docker login

# Start container
pnpm monitoring:start

# Access
http://localhost:3001
```

### ⏳ Configure Monitors

1. [ ] Create admin account
2. [ ] Add monitor: Admin Backend (http://localhost:5001/health)
3. [ ] Add monitor: Customer Backend (http://localhost:5000/health)
4. [ ] Add monitor: Admin Frontend (http://localhost:5173)
5. [ ] Add monitor: Customer Frontend (http://localhost:5174)
6. [ ] Configure notifications (Email/Slack)

---

## 📊 Verification Checklist

### Sentry

- [ ] Admin Frontend - Events appearing
- [ ] Admin Backend - Events appearing
- [ ] Customer Backend - Events appearing
- [ ] Customer Frontend - Events appearing

### Logtail

- [ ] Admin Backend - Logs streaming
- [ ] Customer Backend - Logs streaming

### Uptime Kuma

- [ ] All monitors green (UP)
- [ ] Response times < 1000ms
- [ ] Notifications working

### Health Endpoints

- [ ] Admin Backend: http://localhost:5001/health
- [ ] Admin Backend: http://localhost:5001/health/live
- [ ] Admin Backend: http://localhost:5001/health/ready
- [ ] Customer Backend: http://localhost:5000/health
- [ ] Customer Backend: http://localhost:5000/health/live
- [ ] Customer Backend: http://localhost:5000/health/ready

---

## 🎯 Quick Commands

```bash
# Test Sentry
pnpm test:sentry:all

# Start monitoring
pnpm monitoring:start

# Start apps
pnpm dev:admin    # Admin Backend + Frontend
pnpm dev          # Customer Backend + Frontend

# Test health
curl http://localhost:5001/health
curl http://localhost:5000/health
```

---

## 📚 Help & Documentation

**Quick Start:** [QUICK_START_MONITORING.md](./QUICK_START_MONITORING.md)  
**Full Guide:** [FINAL_DEPLOYMENT_GUIDE.md](./FINAL_DEPLOYMENT_GUIDE.md)  
**Vietnamese:** [TOM_TAT_TICH_HOP_MONITORING.md](./TOM_TAT_TICH_HOP_MONITORING.md)

---

## ✅ Progress

**Completed:**

- [x] Code integration (100%)
- [x] Dependencies installed
- [x] Build successful
- [x] Tests passing
- [x] Admin Frontend DSN configured

**Remaining:**

- [ ] 3 Sentry DSNs (5 phút)
- [ ] 2 Logtail tokens (3 phút)
- [ ] Configure .env files (2 phút)
- [ ] Test everything (5 phút)

**Total Time Remaining:** ~15 phút

---

**Status:** 🚀 Ready to Complete  
**Next:** Get Sentry DSNs from https://sentry.io
