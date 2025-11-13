## Admin Backend Foundations

This service powers the secure administration APIs for the PrintZ platform.  
Giai đoạn 1 hoàn tất gồm: phục hồi mật khẩu, quản lý vai trò, ghi log kiểm toán, ổn định hợp đồng dữ liệu, cùng tài liệu cấu hình & seed.

### 1. Environment Configuration

Create `apps/admin-backend/.env` (or supply variables to the process):

| Variable | Required | Description |
| --- | --- | --- |
| `MONGODB_CONNECTIONSTRING` | ✅ | MongoDB connection URI for the admin database. |
| `ADMIN_JWT_SECRET` | ✅ | Secret used to sign admin JWTs (min. 32 random chars). |
| `ADMIN_API_PORT` | ⛔️ (default `5002`) | Port for the Express server. |
| `ADMIN_APP_URL` | ✅ | Base URL of the admin frontend, used to compose password reset links (e.g. `https://admin.printz.vn`). |
| `RESEND_API_KEY` | ⚠️ | Required to send password reset or printer notification emails. If omitted, emails are skipped and a warning is logged. |
| `FROM_EMAIL` | ⚠️ | Custom sender address for transactional emails. Defaults to `admin@printz.vn`. |
| `ADMIN_PASSWORD_RESET_TOKEN_MINUTES` | ⛔️ (default `30`) | Expiration window (minutes) for password reset links. |

### 2. Install & Run

```bash
pnpm install
pnpm --filter admin-backend dev
```

The server listens on `http://localhost:5002` (configurable via `ADMIN_API_PORT`).

### 3. Seeding & Account Bootstrapping

1. Ensure MongoDB URI points to the desired environment.
2. Run the provided bootstrap script to create the first superadmin:

```bash
pnpm --filter admin-backend run script:create-superadmin
```

3. The script prompts for email, display name, and password. It stores the record with role `superadmin` and hashed password.
4. After logging in, superadmins can create additional admins via `POST /api/admin/admins`.

### 4. Password Reset Flow

- `POST /api/admin/auth/forgot-password` & `POST /api/admin/auth/reset-password` complete the reset sequence.
- Links expire based on `ADMIN_PASSWORD_RESET_TOKEN_MINUTES`.
- All events are captured in the `admin_audit_logs` collection.

### 5. Audit & Observability

- Management actions (sign-in/out, role changes, status toggles, password operations) are persisted via the new audit log model.
- Superadmins can review activity through `GET /api/admin/audit-logs`.

### 6. Shared Contracts

The service consumes `@printz/types` to guarantee a single source of truth for admin roles, audit actions, and response shapes. Run `pnpm --filter @printz/types build` after updating shared contracts.

