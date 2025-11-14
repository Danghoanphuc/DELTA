#!/usr/bin/env bash
set -e

# Ensure we're in repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_ROOT"

# Setup pnpm
corepack enable pnpm
corepack prepare pnpm@9.0.0 --activate

# Install deps for @printz/types and build
pnpm install --filter @printz/types... --prod=false
pnpm --filter @printz/types build

# Create node_modules structure in customer-frontend
mkdir -p apps/customer-frontend/node_modules/@printz

# Copy @printz/types built files
cp -r packages/types/dist apps/customer-frontend/node_modules/@printz/types
cp packages/types/package.json apps/customer-frontend/node_modules/@printz/types/

# Create @printz/ui package.json (pointing to source)
mkdir -p apps/customer-frontend/node_modules/@printz/ui
cat > apps/customer-frontend/node_modules/@printz/ui/package.json <<'EOF'
{
  "name": "@printz/ui",
  "version": "1.0.0",
  "main": "../../../packages/ui/src/index.ts",
  "types": "../../../packages/ui/src/index.ts"
}
EOF

# Create @printz/utils package.json (pointing to source)
mkdir -p apps/customer-frontend/node_modules/@printz/utils
cat > apps/customer-frontend/node_modules/@printz/utils/package.json <<'EOF'
{
  "name": "@printz/utils",
  "version": "1.0.0",
  "main": "../../../packages/utils/src/index.ts",
  "types": "../../../packages/utils/src/index.ts"
}
EOF

# Install customer-frontend dependencies (standalone, no workspace)
cd apps/customer-frontend
pnpm install --ignore-workspace --frozen-lockfile=false

