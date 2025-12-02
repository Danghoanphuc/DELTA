# 🚀 Quick Start - Monitoring Setup

## 1. Install Dependencies

```bash
# Root directory
pnpm install

# This will install all monitoring packages:
# - @sentry/node & @sentry/react
# - @logtail/node & @logtail/winston
# - winston
```

## 2. Setup Environment Variables

### Admin Backend (.env)

```env
SENTRY_DSN=https://your-admin-backend-dsn@sentry.io/project-id
LOGTAIL_TOKEN=your-admin-backend-logtail-token
```

### Customer Backend (.env)

```env
SENTRY_DSN=https://your-customer-backend-dsn@sentry.io/project-id
LOGTAIL_TOKEN=your-customer-backend-logtail-token
```

### Admin Frontend (.env.local)

```env
VITE_SENTRY_DSN=https://your-admin-frontend-dsn@sentry.io/project-id
```

### Customer Frontend (.env.local)

```env
VITE_SENTRY_DSN=https://your-customer-frontend-dsn@sentry.io/project-id
```

## 3. Get Your Tokens

### Sentry DSN

1. Go to https://sentry.io
2. Create 4 projects:
   - `printz-admin-backend` (Node.js)
   - `printz-admin-frontend` (React)
   - `printz-customer-backend` (Node.js)
   - `printz-customer-frontend` (React)
3. Copy DSN from each project settings

### Logtail Token

1. Go to https://betterstack.com/logtail
2. Create 2 sources:
   - `printz-admin-backend`
   - `printz-customer-backend`
3. Copy source tokens

## 4. Test Integration

### Test Admin Backend

```bash
cd apps/admin-backend
pnpm build
pnpm test:sentry
```

### Test Customer Backend

```bash
cd apps/customer-backend
pnpm test:sentry
```

## 5. Start Uptime Kuma

```bash
# Start Uptime Kuma with Docker
docker-compose -f docker-compose.monitoring.yml up -d

# Access at http://localhost:3001
```

## 6. Configure Uptime Kuma

1. Open http://localhost:3001
2. Create admin account
3. Add monitors:
   - Admin Backend: http://localhost:5001/health
   - Customer Backend: http://localhost:5000/health
   - Admin Frontend: http://localhost:5173
   - Customer Frontend: http://localhost:5174

## 7. Verify Everything Works

### Check Sentry

1. Go to Sentry dashboard
2. You should see test events from test scripts
3. Check Issues, Performance, and Releases tabs

### Check Logtail

1. Go to Logtail dashboard
2. You should see logs streaming in real-time
3. Try searching and filtering logs

### Check Uptime Kuma

1. Go to http://localhost:3001
2. All monitors should be green (UP)
3. Check response times and uptime percentage

## 8. Usage Examples

### Backend - Capture Error

```javascript
import * as Sentry from "@sentry/node";

try {
  await riskyOperation();
} catch (error) {
  Sentry.captureException(error, {
    tags: { operation: "risky" },
    user: { id: userId },
  });
  throw error;
}
```

### Backend - Log with Context

```javascript
import logger from "./infrastructure/logger.js";

logger.info("Order created", {
  orderId: order.id,
  userId: user.id,
  amount: order.total,
});
```

### Frontend - Capture Error

```javascript
import * as Sentry from "@sentry/react";

try {
  await fetchData();
} catch (error) {
  Sentry.captureException(error);
  showErrorToast("Failed to fetch data");
}
```

## 9. Production Deployment

### Environment Variables

Set these in your hosting platform (Vercel, Render, etc.):

**Backend:**

- `SENTRY_DSN`
- `LOGTAIL_TOKEN`
- `NODE_ENV=production`

**Frontend:**

- `VITE_SENTRY_DSN`

### Verify Production

1. Deploy your apps
2. Check Sentry for production events
3. Check Logtail for production logs
4. Update Uptime Kuma monitors with production URLs

## 10. Troubleshooting

### Sentry not receiving events

- Check DSN is correct
- Verify `NODE_ENV` is set
- Check network connectivity
- Look for initialization errors in console

### Logtail not receiving logs

- Check token is correct
- Verify logger is imported correctly
- Check network connectivity
- Look for Winston errors in console

### Uptime Kuma showing DOWN

- Check health endpoints are accessible
- Verify services are running
- Check firewall/network settings
- Review monitor configuration

## 📚 Full Documentation

For detailed information, see:

- [MONITORING_SETUP_GUIDE.md](./MONITORING_SETUP_GUIDE.md)
- [SENTRY_IMPLEMENTATION_SUMMARY.md](./SENTRY_IMPLEMENTATION_SUMMARY.md)

## 🆘 Need Help?

- Sentry: https://docs.sentry.io
- Logtail: https://betterstack.com/docs/logtail
- Uptime Kuma: https://github.com/louislam/uptime-kuma/wiki
