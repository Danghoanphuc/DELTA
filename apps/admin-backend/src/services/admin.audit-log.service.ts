import { type FilterQuery } from "mongoose";
import {
  type AdminAuditAction,
  type AdminRole,
  type IAdminAuditLog,
} from "@printz/types";
import {
  AdminAuditLog,
  type IAdminAuditLogDocument,
} from "../models/admin.audit-log.model.js";
import { type IAdmin } from "../models/admin.model.js";

interface RecordAuditLogOptions {
  action: AdminAuditAction;
  actor?: IAdmin | null;
  actorEmailOverride?: string;
  targetType?: string | null;
  targetId?: string | null;
  metadata?: Record<string, unknown> | null;
  ipAddress?: string | null;
  userAgent?: string | null;
}

export const recordAdminAuditLog = async ({
  action,
  actor,
  actorEmailOverride,
  targetType,
  targetId,
  metadata,
  ipAddress,
  userAgent,
}: RecordAuditLogOptions): Promise<IAdminAuditLog> => {
  const payload = {
    action,
    actorId: actor?._id ?? undefined,
    actorEmail: actorEmailOverride ?? actor?.email ?? undefined,
    actorRole: actor?.role ?? undefined,
    targetType: targetType ?? undefined,
    targetId: targetId ?? undefined,
    metadata: metadata ?? undefined,
    ipAddress: ipAddress ?? undefined,
    userAgent: userAgent ?? undefined,
  };

  const doc = await AdminAuditLog.create(payload);
  return doc.toObject() as unknown as IAdminAuditLog;
};

interface ListAuditLogsOptions {
  actions?: AdminAuditAction[];
  actorId?: string;
  role?: AdminRole;
  targetType?: string;
  targetId?: string;
  limit?: number;
  offset?: number;
}

export const listAdminAuditLogs = async ({
  actions,
  actorId,
  role,
  targetType,
  targetId,
  limit = 50,
  offset = 0,
}: ListAuditLogsOptions = {}): Promise<IAdminAuditLog[]> => {
  const query: FilterQuery<IAdminAuditLogDocument> = {};

  if (actions?.length) {
    query.action = { $in: actions };
  }

  if (actorId) {
    query.actorId = actorId;
  }

  if (role) {
    query.actorRole = role;
  }

  if (targetType) {
    query.targetType = targetType;
  }

  if (targetId) {
    query.targetId = targetId;
  }

  const results = (await AdminAuditLog.find(query)
    .sort({ createdAt: -1 })
    .skip(offset)
    .limit(limit)
    .lean<IAdminAuditLog>()
    .exec()) as unknown as IAdminAuditLog[];

  return results;
};

