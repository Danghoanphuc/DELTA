# 🔍 Monitoring & Logging - Printz Platform

> **Status:** ✅ Production Ready| **Date:** December 2, 2025

## 🎯 Tổng quan

Hệ thống monitoring toàn diện với 3 công cụ enterprise-grade:

| Tool            | Purpose                      | Status      |
| --------------- | ---------------------------- | ----------- |
| **Sentry**      | Error tracking & Performance | ✅ Complete |
| **Logtail**     | Centralized logging          | ✅ Complete |
| **Uptime Kuma** | Uptime monitoring            | ✅ Complete |

## 🚀 Quick Start (5 phút)

```bash
# 1. Install dependencies
pnpm install

# 2. Start monitoring stack
pnpm monitoring:start

# 3. Test integration
pnpm test:sentry:all

# 4. Access Uptime Kuma
# Open http://localhost:3001
```

## 📦 What's Included

### ✅ Sentry Integration (4 apps)

- Admin Backend - Error tracking, Performance, Profiling
- Customer Backend - Error tracking, Performance, AI tracing
- Admin Frontend - Error tracking, Session replay
- Customer Frontend - Error tracking, Session replay

### ✅ Logtail Integration (2 backends)

- Admin Backend - Winston + Logtail
- Customer Backend - Winston + Logtail

### ✅ Uptime Kuma (Infrastructure)

- Docker Compose setup
- Health check endpoints
- Startup scripts

## 📚 Documentation

| Document                                                                             | Description             |
| ------------------------------------------------------------------------------------ | ----------------------- |
| **[MONITORING_SUMMARY.md](./MONITORING_SUMMARY.md)**                                 | 📋 Tóm tắt ngắn gọn     |
| **[QUICK_START_MONITORING.md](./QUICK_START_MONITORING.md)**                         | 🚀 Bắt đầu nhanh        |
| **[MONITORING_SETUP_GUIDE.md](./MONITORING_SETUP_GUIDE.md)**                         | 📖 Hướng dẫn chi tiết   |
| **[INTEGRATION_GUIDE.md](./INTEGRATION_GUIDE.md)**                                   | 🔌 Tích hợp vào code    |
| **[MONITORING_CHECKLIST.md](./MONITORING_CHECKLIST.md)**                             | ✅ Checklist triển khai |
| **[MONITORING_IMPLEMENTATION_COMPLETE.md](./MONITORING_IMPLEMENTATION_COMPLETE.md)** | 📊 Báo cáo hoàn thành   |

## 🎯 Next Steps

### 1. Get Tokens (5 phút)

**Sentry (4 projects):**

- Go to https://sentry.io
- Create projects: admin-backend, admin-frontend, customer-backend, customer-frontend
- Copy DSN from each project

**Logtail (2 sources):**

- Go to https://betterstack.com/logtail
- Create sources: admin-backend, customer-backend
- Copy tokens

### 2. Configure Environment (5 phút)

```bash
# Copy example files
cp apps/admin-backend/.env.example apps/admin-backend/.env
cp apps/customer-backend/.env.example apps/customer-backend/.env
cp apps/admin-frontend/.env.example apps/admin-frontend/.env.local
cp apps/customer-frontend/.env.example apps/customer-frontend/.env.local

# Fill in tokens in each .env file
```

### 3. Test & Deploy (15 phút)

```bash
# Test locally
pnpm test:sentry:all
pnpm monitoring:start

# Deploy to production
# Set environment variables in hosting platform
# Deploy applications
# Configure Uptime Kuma monitors
```

## 💻 Commands

```bash
# Monitoring
pnpm monitoring:start      # Start Uptime Kuma
pnpm monitoring:stop       # Stop Uptime Kuma
pnpm monitoring:logs       # View logs

# Testing
pnpm test:sentry:all       # Test all
pnpm test:sentry:admin     # Test admin backend
pnpm test:sentry:customer  # Test customer backend
```

## 📊 Coverage

| Component         | Sentry | Logtail | Health Checks |
| ----------------- | ------ | ------- | ------------- |
| Admin Backend     | ✅     | ✅      | ✅            |
| Customer Backend  | ✅     | ✅      | ✅            |
| Admin Frontend    | ✅     | -       | -             |
| Customer Frontend | ✅     | -       | -             |

**Overall: 100% Complete** 🎉

## 🔗 Dashboards

- **Sentry:** https://sentry.io
- **Logtail:** https://betterstack.com/logtail
- **Uptime Kuma:** http://localhost:3001 (local)

## 💰 Cost

- **Sentry Free Tier:** 5K errors + 10K transactions/month
- **Logtail Free Tier:** 1GB logs/month
- **Uptime Kuma:** Self-hosted (Free)

**Total: $0/month** (Free tier)

## 📞 Support

- **Documentation:** See files above
- **Sentry Docs:** https://docs.sentry.io
- **Logtail Docs:** https://betterstack.com/docs/logtail
- **Uptime Kuma:** https://github.com/louislam/uptime-kuma/wiki

---

**Implemented by:** Kiro AI Assistant  
**Date:** December 2, 2025  
**Time to Deploy:** ~25 minutes  
**Status:** ✅ Production Ready
