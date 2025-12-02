# ES Modules vs CommonJS Fix

## The Problem

Build succeeded but runtime failed with:

```
ReferenceError: exports is not defined in ES module scope
```

## Root Cause

**Mismatch between TypeScript output and Node.js expectations:**

1. `package.json` declares: `"type": "module"` → Node expects ES modules
2. `tsconfig.json` had: `"module": "CommonJS"` → TypeScript outputs CommonJS
3. Result: `.js` files contain `exports` (CommonJS) but Node treats them as ES modules

## The Fix

### Changed in `apps/customer-backend/tsconfig.json`:

```json
// BEFORE (Wrong)
{
  "compilerOptions": {
    "module": "CommonJS",  // ❌ Outputs CommonJS
    "moduleResolution": "node"
  }
}

// AFTER (Correct)
{
  "compilerOptions": {
    "module": "ES2020",    // ✅ Outputs ES modules
    "moduleResolution": "node"
  }
}
```

## Why This Matters

### CommonJS Output (Old):

```javascript
// dist/server.js
Object.defineProperty(exports, "__esModule", { value: true });
exports.default = app;
```

### ES Module Output (New):

```javascript
// dist/server.js
export default app;
```

## Module System Comparison

| Aspect            | CommonJS                                    | ES Modules                                |
| ----------------- | ------------------------------------------- | ----------------------------------------- |
| Syntax            | `require()` / `module.exports`              | `import` / `export`                       |
| Loading           | Synchronous                                 | Asynchronous                              |
| File Extension    | `.cjs` or `.js` (with `"type": "commonjs"`) | `.mjs` or `.js` (with `"type": "module"`) |
| TypeScript Config | `"module": "CommonJS"`                      | `"module": "ES2020"` or `"NodeNext"`      |
| Node.js Support   | All versions                                | Node 12.20+                               |

## Current Configuration

### Customer Backend:

- ✅ `package.json`: `"type": "module"`
- ✅ `tsconfig.json`: `"module": "ES2020"`
- ✅ Source files: Use `import/export`
- ✅ Output: ES modules in `dist/`

### Admin Backend:

- ✅ `package.json`: `"type": "module"`
- ✅ `tsconfig.json`: `"module": "NodeNext"`
- ✅ Source files: Use `import/export`
- ✅ Output: ES modules in `dist/`

## Important Notes

### 1. All imports must include `.js` extension

```typescript
// ❌ Wrong
import { something } from "./utils/helper";

// ✅ Correct
import { something } from "./utils/helper.js";
```

Note: Even though source is `.ts`, import must use `.js` because that's what will exist at runtime.

### 2. **dirname and **filename don't exist in ES modules

```typescript
// ❌ Wrong (CommonJS)
const dir = __dirname;

// ✅ Correct (ES modules)
import { fileURLToPath } from "url";
import { dirname } from "path";
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
```

### 3. JSON imports need assertion

```typescript
// ❌ Wrong
import config from "./config.json";

// ✅ Correct
import config from "./config.json" assert { type: "json" };
```

## Verification

### Build Test:

```bash
cd apps/customer-backend
pnpm build
```

Check `dist/server.js` - should see `export` instead of `exports`:

```bash
head -n 50 dist/server.js
```

### Runtime Test:

```bash
node dist/server.js
```

Should start without "exports is not defined" error.

## Troubleshooting

### If you still see CommonJS output:

1. **Clear dist folder:**

   ```bash
   rm -rf apps/customer-backend/dist
   pnpm --filter customer-backend build
   ```

2. **Check tsconfig is being used:**

   ```bash
   cd apps/customer-backend
   npx tsc --showConfig
   ```

3. **Verify no tsconfig override:**
   - Check for `tsconfig.build.json`
   - Check `package.json` build script

### If imports fail at runtime:

1. **Add .js extensions to all imports**
2. **Check for dynamic requires:**
   ```bash
   grep -r "require(" apps/customer-backend/src/
   ```
3. **Convert to dynamic imports:**
   ```typescript
   // Instead of require()
   const module = await import("./module.js");
   ```

## Related Changes

- ✅ `apps/customer-backend/tsconfig.json` - Changed module to ES2020
- ✅ `apps/customer-backend/scripts/verify-canvas.js` - Converted to ES modules
- ✅ `apps/admin-backend/scripts/verify-canvas.js` - Converted to ES modules
- ✅ Both Dockerfiles - Build order fixed

## Next Steps

1. **Commit and push** these changes
2. **Rebuild Docker images** - CI/CD will trigger automatically
3. **Deploy to Render** - Should start successfully now
4. **Monitor logs** for any remaining import issues

## References

- [Node.js ES Modules](https://nodejs.org/api/esm.html)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [Package.json "type" field](https://nodejs.org/api/packages.html#type)
