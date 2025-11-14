#!/bin/bash
set -e

# Script runs from repo root (before rootDirectory is applied)
# Setup pnpm
corepack enable pnpm
corepack prepare pnpm@9.0.0 --activate

# Build @printz/types
pnpm --filter @printz/types build

# Create node_modules structure in customer-frontend
mkdir -p apps/customer-frontend/node_modules/@printz

# Copy @printz/types built files
cp -r packages/types/dist apps/customer-frontend/node_modules/@printz/types
cp packages/types/package.json apps/customer-frontend/node_modules/@printz/types/

# Create @printz/ui package.json (pointing to source)
mkdir -p apps/customer-frontend/node_modules/@printz/ui
cat > apps/customer-frontend/node_modules/@printz/ui/package.json <<EOF
{
  "name": "@printz/ui",
  "version": "1.0.0",
  "main": "../../../packages/ui/src/index.ts",
  "types": "../../../packages/ui/src/index.ts"
}
EOF

# Create @printz/utils package.json (pointing to source)
mkdir -p apps/customer-frontend/node_modules/@printz/utils
cat > apps/customer-frontend/node_modules/@printz/utils/package.json <<EOF
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

