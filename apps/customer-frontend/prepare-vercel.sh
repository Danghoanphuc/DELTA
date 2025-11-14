#!/usr/bin/env bash
set -e

# Ensure we're in repo root
SCRIPT_DIR="$(cd "$(dirname "${BASH_SOURCE[0]}")" && pwd)"
REPO_ROOT="$(cd "$SCRIPT_DIR/../.." && pwd)"
cd "$REPO_ROOT"

# Ensure correct Node version (download local 20.17.0 if needed)
NODE_VERSION="20.17.0"
NODE_DIST="node-v${NODE_VERSION}-linux-x64"
NODE_DIR="/tmp/${NODE_DIST}"

if [[ ! -x "${NODE_DIR}/bin/node" ]]; then
  echo "Downloading Node.js ${NODE_VERSION}..."
  curl -fsSL "https://nodejs.org/dist/v${NODE_VERSION}/${NODE_DIST}.tar.xz" -o /tmp/node.tar.xz
  mkdir -p "${NODE_DIR}"
  tar -xJf /tmp/node.tar.xz -C "${NODE_DIR}" --strip-components=1
fi

export PATH="${NODE_DIR}/bin:${PATH}"
echo "Using Node $(node -v)"

# Setup pnpm (after switching node)
corepack enable pnpm
corepack prepare pnpm@9.0.0 --activate

# Install deps for @printz/types and build
pnpm install --filter @printz/types... --prod=false --prefer-offline
pnpm --filter @printz/types build

# Prepare node_modules structure in customer-frontend
mkdir -p apps/customer-frontend/node_modules/@printz

# Copy @printz/types built files (reset destination each time)
rm -rf apps/customer-frontend/node_modules/@printz/types
mkdir -p apps/customer-frontend/node_modules/@printz/types
cp -r packages/types/dist apps/customer-frontend/node_modules/@printz/types/
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

# Temporarily rewrite workspace deps to local file references
cp package.json package.json.__workspace_backup
node <<'EOF'
const fs = require('fs');
const pkgPath = 'package.json';
const pkg = JSON.parse(fs.readFileSync(pkgPath, 'utf8'));
const overrides = {
  "@printz/types": "file:node_modules/@printz/types",
  "@printz/ui": "file:node_modules/@printz/ui",
  "@printz/utils": "file:node_modules/@printz/utils"
};
if (!pkg.dependencies) pkg.dependencies = {};
for (const [dep, value] of Object.entries(overrides)) {
  if (pkg.dependencies[dep]) {
    pkg.dependencies[dep] = value;
  }
}
fs.writeFileSync(pkgPath, JSON.stringify(pkg, null, 2));
EOF

pnpm install --ignore-workspace --frozen-lockfile=false

# Restore original package.json (workspace specs) for build steps
mv package.json.__workspace_backup package.json

