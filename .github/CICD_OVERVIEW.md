# CI/CD Pipeline Overview

## Workflow Structure

All GitHub Actions workflows are located in `.github/workflows/` at the repository root.

### Active Workflows

| Workflow              | File                           | Branches                     | Triggers On                                | Deploys To      |
| --------------------- | ------------------------------ | ---------------------------- | ------------------------------------------ | --------------- |
| **Admin Backend**     | `deploy-admin.yml`             | `main`, `develop`, `staging` | `apps/admin-backend/**`, `packages/**`     | Render (Docker) |
| **Admin Frontend**    | `deploy-admin-frontend.yml`    | `main`, `develop`, `staging` | `apps/admin-frontend/**`, `packages/**`    | Vercel          |
| **Customer Backend**  | `deploy-customer.yml`          | `main`, `develop`, `staging` | `apps/customer-backend/**`, `packages/**`  | Render (Docker) |
| **Customer Frontend** | `deploy-customer-frontend.yml` | `main`, `develop`, `staging` | `apps/customer-frontend/**`, `packages/**` | Vercel          |

## Branch Strategy

- **`main`** → Production environment
- **`develop`** → Staging environment
- **`staging`** → Staging environment

## Path Filters

Each workflow only triggers when relevant files change:

- App-specific changes: `apps/{app-name}/**`
- Shared packages: `packages/**`
- Dependencies: `pnpm-lock.yaml`
- Build config: `turbo.json`, `Dockerfile`

This prevents unnecessary builds when unrelated apps are modified.

## Backend Deployment (Render)

1. Build Docker image with Buildx
2. Push to Docker Hub with appropriate tag (`latest` for prod, `staging` for staging)
3. Trigger Render deploy hook via webhook
4. Render pulls new image and redeploys

**Docker Images:**

- `{username}/printz-admin-backend:latest` (production)
- `{username}/printz-admin-backend:staging` (staging)
- `{username}/printz-customer-backend:latest` (production)
- `{username}/printz-customer-backend:staging` (staging)

## Frontend Deployment (Vercel)

1. Install dependencies (monorepo-aware)
2. Build shared packages (`@printz/types`)
3. Pull Vercel config for target environment
4. Build app with Vercel CLI
5. Deploy prebuilt artifacts

**Environments:**

- `main` → Production deployment
- `develop`/`staging` → Preview deployment

## Required Secrets

### Docker Hub

- `DOCKER_USERNAME`
- `DOCKER_PASSWORD`

### Render Deploy Hooks

- `RENDER_DEPLOY_HOOK_ADMIN_PROD`
- `RENDER_DEPLOY_HOOK_ADMIN_STAGING`
- `RENDER_DEPLOY_HOOK_CUSTOMER_PROD`
- `RENDER_DEPLOY_HOOK_CUSTOMER_STAGING`

### Vercel

- `VERCEL_TOKEN`
- `VERCEL_ORG_ID`
- `VERCEL_PROJECT_ID` (customer frontend)
- `VERCEL_PROJECT_ID_ADMIN` (admin frontend)

## Optimization Features

- **Path filtering**: Only builds affected apps
- **Docker layer caching**: GitHub Actions cache for faster builds
- **Monorepo awareness**: Builds shared packages before apps
- **Parallel builds**: Independent workflows run concurrently
- **Prebuilt deployments**: Vercel deploys pre-built artifacts (faster)

## Troubleshooting

### Workflow not triggering

- Check if changes match path filters
- Verify branch name matches trigger branches
- Ensure workflow file is in `.github/workflows/` (not `apps/*/.github/workflows/`)

### Build failures

- Check GitHub Actions logs
- Verify all secrets are configured
- Test Docker build locally: `docker build -f apps/{app}/Dockerfile .`
- Test Vercel build locally: `cd apps/{app} && vercel build`

### Deployment failures

- Verify Render deploy hooks are correct
- Check Render service logs
- Verify Docker image was pushed successfully
- For Vercel, check deployment logs in Vercel dashboard
