# Import Fixes - Customer Backend

## Tổng quan

Đã sửa tất cả lỗi import khiến server không khởi động được.

## Vấn đề

Server customer-backend không khởi động được do lỗi import logger:

```
Error [ERR_MODULE_NOT_FOUND]: Cannot find module
'D:\LAP-TRINH\DELTA\apps\customer-backend\src\shared\utils\logger.js'
```

## Nguyên nhân

Có 2 logger trong customer-backend:

1. **Logger cũ** (đúng): `src/shared/utils/logger.util.js` - Named export `Logger`
2. **Logger mới** (Winston): `src/infrastructure/logger.js` - Default export `logger`

Nhiều file đang import sai path:

- ❌ `import { Logger } from "../shared/utils/logger.js"` (file không tồn tại)
- ✅ `import { Logger } from "../shared/utils/logger.util.js"` (đúng)

## Giải pháp

Đã sửa import trong các file sau:

### Repositories

- `src/repositories/thread.repository.js`
- `src/repositories/participant.repository.js`
- `src/repositories/message.repository.js`

### Controllers

- `src/controllers/template.controller.js`
- `src/controllers/search.controller.js`

### Services

- `src/services/participant.service.js`

### Scripts

- `src/scripts/seed-thread-templates.js`
- `src/scripts/migrate-conversations-to-threads.js`
- `src/scripts/migrate-messages-for-threading.js`

### Jobs

- `src/jobs/auto-archive-threads.job.js`

## Kết quả

✅ Server khởi động thành công
✅ Tất cả imports hoạt động bình thường
✅ Không còn lỗi ERR_MODULE_NOT_FOUND

## Lưu ý

### Logger cũ (logger.util.js)

```javascript
import { Logger } from "../shared/utils/logger.util.js";

Logger.success("Message");
Logger.error("Error", error);
Logger.debug("Debug info");
Logger.info("Info");
Logger.warn("Warning");
```

### Logger mới (infrastructure/logger.js)

```javascript
import logger from "../infrastructure/logger.js";

logger.info("Message");
logger.error("Error", error);
logger.debug("Debug info");
logger.warn("Warning");
```

## Khuyến nghị

Trong tương lai, nên:

1. Chỉ sử dụng 1 logger duy nhất (Winston logger)
2. Migrate tất cả code sang Winston logger
3. Xóa logger.util.js sau khi migrate xong
4. Tránh import chéo giữa customer-backend và admin-backend

## Lỗi bổ sung đã sửa

### User Model Import

- **File**: `src/services/thread-notification.service.js`
- **Lỗi**: Import từ `../modules/users/user.model.js` (không tồn tại)
- **Sửa**: Import từ `../shared/models/user.model.js` (đúng)

User model nằm trong `shared/models`, không phải `modules/users`.

## Ngày sửa

8/12/2024
