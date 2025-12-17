# ES Module Import Extensions - Delta Swag Platform

**Purpose**: Quy tắc bắt buộc về ES module imports để tránh lỗi production deployment.

---

## Vấn đề gốc rễ

### **ERR_MODULE_NOT_FOUND trong Production**

Node.js ES modules yêu cầu **explicit file extensions** cho tất cả local imports. TypeScript development có thể chạy được nhưng production sẽ fail.

```javascript
// ❌ WRONG - Sẽ fail trong production
import { Service } from "./service";
import { Helper } from "../utils/helper";
import * as utils from "./utils";

// ✅ CORRECT - Chạy được trong production
import { Service } from "./service.js";
import { Helper } from "../utils/helper.js";
import * as utils from "./utils/index.js";
```

---

## Quy tắc bắt buộc

### **1. Tất cả local imports PHẢI có `.js` extension**

```typescript
// ✅ CORRECT
import { UserService } from "./user.service.js";
import { ApiResponse } from "../shared/utils/api-response.js";
import { Logger } from "../../shared/utils/logger.js";
```

### **2. Directory imports PHẢI có `/index.js`**

```typescript
// ❌ WRONG
import { API_CODES } from "../shared/constants";
import * as utils from "./utils";

// ✅ CORRECT
import { API_CODES } from "../shared/constants/index.js";
import * as utils from "./utils/index.js";
```

### **3. Export statements trong index.ts PHẢI có `.js`**

```typescript
// ❌ WRONG - index.ts
export * from "./service";
export * from "./repository";

// ✅ CORRECT - index.ts
export * from "./service.js";
export * from "./repository.js";
```

---

## Checklist trước khi commit

### **Backend (Node.js ES Modules)**

- [ ] Tất cả imports từ `./` có `.js` extension
- [ ] Tất cả imports từ `../` có `.js` extension
- [ ] Tất cả exports trong `index.ts` có `.js` extension
- [ ] Không có directory imports (phải có `/index.js`)
- [ ] Build thành công: `npm run build`

### **Các pattern thường gặp cần fix:**

```typescript
// Services
import { Service } from "./service" → "./service.js"

// Repositories
import { Repository } from "../repositories/repo" → "../repositories/repo.js"

// Utils
import { Helper } from "../shared/utils/helper" → "../shared/utils/helper.js"

// Constants
import { CODES } from "../constants" → "../constants/index.js"

// Interfaces
import { Interface } from "../interfaces/interface" → "../interfaces/interface.js"

// Carriers/Adapters
import { Adapter } from "./adapter" → "./adapter.js"
```

---

## Tại sao lỗi này xảy ra?

### **Development vs Production**

| Environment            | Behavior                       |
| ---------------------- | ------------------------------ |
| **TypeScript Dev**     | Tự động resolve extensions ✅  |
| **Node.js Production** | Yêu cầu explicit extensions ❌ |

### **ES Modules vs CommonJS**

```javascript
// CommonJS (cũ) - tự động resolve
const service = require("./service"); // OK

// ES Modules (mới) - yêu cầu explicit
import service from "./service"; // ❌ FAIL
import service from "./service.js"; // ✅ OK
```

---

## Cách kiểm tra và fix

### **1. Tìm tất cả imports thiếu extension:**

```bash
# Tìm imports local files thiếu .js
grep -r "from [\"']\.\./.*[^\.js][\"']" apps/admin-backend/src/
grep -r "from [\"']\./.*[^\.js][\"']" apps/admin-backend/src/
```

### **2. Tìm directory imports:**

```bash
# Tìm imports directory không có index.js
grep -r "from [\"'].*[^/index\.js][\"']$" apps/admin-backend/src/
```

### **3. Build test:**

```bash
cd apps/admin-backend
npm run build  # Phải pass
```

---

## Lỗi thường gặp

### **ERR_MODULE_NOT_FOUND**

```
Cannot find module '/app/dist/services/service'
imported from /app/dist/controllers/controller.js
```

**Fix:** Thêm `.js` extension vào import

### **ERR_UNSUPPORTED_DIR_IMPORT**

```
Directory import '/app/dist/shared/constants' is not supported
```

**Fix:** Thêm `/index.js` vào import

---

## Automation

### **ESLint Rule (tương lai):**

```json
{
  "rules": {
    "import/extensions": [
      "error",
      "always",
      {
        "js": "always",
        "ts": "never"
      }
    ]
  }
}
```

### **Pre-commit Hook:**

```bash
#!/bin/bash
# Check for missing .js extensions
if grep -r "from [\"']\.\./.*[^\.js][\"']" apps/admin-backend/src/; then
  echo "❌ Found imports missing .js extensions"
  exit 1
fi
```

---

## Ví dụ thực tế từ codebase

### **Lỗi đã fix:**

```typescript
// ❌ Gây lỗi production
import { DashboardService } from "./swag-ops/dashboard.service";
import { CarrierFactory } from "./carriers/carrier.factory";
import { API_CODES } from "../shared/constants";

// ✅ Đã fix
import { DashboardService } from "./swag-ops/dashboard.service.js";
import { CarrierFactory } from "./carriers/carrier.factory.js";
import { API_CODES } from "../shared/constants/index.js";
```

### **Files đã fix trong lần này:**

- `swag-operations.facade.ts` - 5 imports
- `carrier-integration.service.ts` - 1 import
- `services/carriers/*.adapter.ts` - 5 files
- `services/*/index.ts` - 2 files

---

## Tóm tắt

**Golden Rule:**

> **Mọi local import trong Node.js ES modules PHẢI có explicit `.js` extension**

**Workflow:**

1. ✅ Viết code với `.js` extensions
2. ✅ Test build: `npm run build`
3. ✅ Commit khi build pass
4. ✅ Production sẽ chạy thành công

**Nhớ:** Development có thể chạy được không có extension, nhưng production sẽ fail. Luôn test build trước khi commit!

---

## Tài liệu tham khảo

- [Node.js ES Modules](https://nodejs.org/api/esm.html#mandatory-file-extensions)
- [TypeScript Module Resolution](https://www.typescriptlang.org/docs/handbook/module-resolution.html)
- [ES Modules Best Practices](https://developer.mozilla.org/en-US/docs/Web/JavaScript/Guide/Modules)
