# Docker Build Guide - Customer Backend

## Quick Build Commands

```bash
# Build locally
docker build -t customer-backend -f apps/customer-backend/Dockerfile .

# Build with no cache (if having issues)
docker build --no-cache -t customer-backend -f apps/customer-backend/Dockerfile .

# Test the image
docker run -p 3000:3000 customer-backend
```

## Common Issues & Solutions

### 1. pnpm install fails with exit code 1

**Causes:**

- Lockfile out of sync
- Network issues during install
- Missing workspace configuration

**Solutions:**

- The Dockerfile now uses `--no-frozen-lockfile` for flexibility
- Added retry logic for transient failures
- Copies `pnpm-workspace.yaml` to ensure workspace is recognized

### 2. TypeScript compilation errors

**Causes:**

- Missing tsconfig files
- Type errors in code
- Missing dependencies

**Solutions:**

- Ensure `tsconfig.json` and `tsconfig.app.json` exist
- Set `skipLibCheck: true` in tsconfig
- Run `pnpm install` locally first to verify dependencies

### 3. Canvas/native module issues

**Causes:**

- Missing system dependencies
- Architecture mismatch

**Solutions:**

- Dockerfile includes: `python3 make g++` for building native modules
- Runtime includes: `libc6-compat font-noto fontconfig ttf-dejavu lcms2 libpng libjpeg-turbo`
- Uses `@napi-rs/canvas` which is pre-compiled for Alpine Linux

## Build Stages

1. **Pruner**: Uses Turbo to extract only needed files for customer-backend
2. **Builder**: Installs dependencies and builds the application
3. **Runner**: Minimal production image with only runtime dependencies

## Environment Variables

Required at runtime:

- `NODE_ENV=production` (set automatically)
- Database connection strings
- API keys (Sentry, AWS, etc.)

## Optimization Tips

- The build uses multi-stage to keep final image small
- Node memory increased to 4GB for build stage
- Uses Alpine Linux for smaller image size
- Includes health check for container orchestration
