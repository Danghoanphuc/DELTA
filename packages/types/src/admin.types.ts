// packages/types/src/admin.ts
// Đây là "Data Contract" định nghĩa thông tin Admin
// mà admin-backend sẽ trả về cho admin-frontend.

export type AdminRole = "superadmin" | "finance" | "support" | "vetting";

export interface IAdmin {
  _id: string;
  email: string;
  displayName: string;
  role: AdminRole;
  isActive: boolean;
  createdAt: string;
  updatedAt: string;
  lastPasswordChangedAt?: string | null;
}

export type AdminAuditAction =
  | "ADMIN_SIGN_IN"
  | "ADMIN_SIGN_OUT"
  | "ADMIN_PASSWORD_RESET_REQUESTED"
  | "ADMIN_PASSWORD_RESET_COMPLETED"
  | "ADMIN_PASSWORD_UPDATED"
  | "ADMIN_CREATED"
  | "ADMIN_ROLE_UPDATED"
  | "ADMIN_STATUS_CHANGED"
  | "ORDER_STATUS_FORCE_UPDATED"
  | "PAYOUT_APPROVED"
  | "PAYOUT_CONFIRMED"
  | "PAYOUT_REJECTED"
  | "ASSET_FLAGGED";

export interface IAdminAuditLog {
  _id: string;
  action: AdminAuditAction;
  actorId: string | null;
  actorEmail: string | null;
  actorRole: AdminRole | null;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, any> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
  createdAt: string;
}
