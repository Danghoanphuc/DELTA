# Customer Backend Startup Fixes

## Issue 1: Duplicate Variable Declaration

The customer-backend application was failing to start with the error:

```
Error [TransformError]: Transform failed with 3 errors:
The symbol "threadRoutes" has already been declared
The symbol "messageRoutes" has already been declared
The symbol "templateRoutes" has already been declared
```

### Root Cause

In `server.ts`, three variables were declared twice:

1. First declared with `let` at line 224
2. Then redeclared with `var` when importing the routes

### Solution

Changed the redeclarations from `var` to simple assignments.

---

## Issue 2: Incorrect Module Import Path

After fixing the duplicate declarations, the application encountered:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module 'api-response.js'
```

### Root Cause

Multiple controller files were importing `ApiResponse` from `api-response.js`, but the actual file is named `api-response.util.js`.

### Files Fixed

1. `src/controllers/thread.controller.js`
2. `src/controllers/message.controller.js`
3. `src/controllers/template.controller.js`
4. `src/controllers/quick-action.controller.js`
5. `src/controllers/participant.controller.js`
6. `src/modules/artworks/artwork.controller.js`

### Solution

Updated all imports from:

```javascript
import { ApiResponse } from "../shared/utils/api-response.js";
```

To:

```javascript
import { ApiResponse } from "../shared/utils/api-response.util.js";
```

---

## Verification

- ✅ No duplicate variable declarations
- ✅ All imports use correct file paths
- ✅ Application should now start successfully

## Testing

```bash
cd apps/customer-backend
pnpm dev
```
