import { type FilterQuery } from "mongoose";
import { Admin, type AdminRole, type IAdmin } from "../models/admin.model.js";
import {
  NotFoundException,
  ValidationException,
} from "../shared/exceptions.js";
import { recordAdminAuditLog } from "./admin.audit-log.service.js";

const sanitizeAdmin = (admin: IAdmin) => {
  const adminObj = admin.toObject();
  delete (adminObj as any).password;
  delete (adminObj as any).passwordResetToken;
  delete (adminObj as any).passwordResetExpires;
  return adminObj;
};

interface ListAdminsParams {
  page?: number;
  limit?: number;
  search?: string;
  role?: AdminRole;
  status?: "active" | "inactive" | "all";
}

export const listAdmins = async ({
  page = 1,
  limit = 20,
  search,
  role,
  status = "all",
}: ListAdminsParams = {}) => {
  const query: FilterQuery<IAdmin> = {};

  if (role) {
    query.role = role;
  }

  if (status === "active") {
    query.isActive = true;
  } else if (status === "inactive") {
    query.isActive = false;
  }

  if (search) {
    query.$or = [
      { email: { $regex: search, $options: "i" } },
      { displayName: { $regex: search, $options: "i" } },
    ];
  }

  const [items, total] = await Promise.all([
    Admin.find(query)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec(),
    Admin.countDocuments(query),
  ]);

  return {
    items,
    total,
    page,
    limit,
  };
};

interface CreateAdminPayload {
  email: string;
  displayName: string;
  role: AdminRole;
  password: string;
  isActive?: boolean;
}

interface RequestContextMeta {
  ipAddress?: string | null;
  userAgent?: string | null;
}

export const createAdminAccount = async (
  payload: CreateAdminPayload,
  actor: IAdmin,
  context: RequestContextMeta = {}
) => {
  const { email, displayName, role, password, isActive = true } = payload;

  if (!email || !displayName || !password) {
    throw new ValidationException("Thiếu thông tin bắt buộc");
  }

  const existing = await Admin.findOne({ email });
  if (existing) {
    throw new ValidationException("Email đã tồn tại trong hệ thống");
  }

  const admin = new Admin({
    email,
    displayName,
    role,
    password,
    isActive,
  });

  await admin.save();

  void recordAdminAuditLog({
    action: "ADMIN_CREATED",
    actor,
    targetType: "Admin",
    targetId: admin._id.toString(),
    metadata: {
      email,
      role,
      isActive,
    },
    ipAddress: context.ipAddress ?? undefined,
    userAgent: context.userAgent ?? undefined,
  });

  return sanitizeAdmin(admin);
};

interface UpdateAdminPayload {
  displayName?: string;
  role?: AdminRole;
  isActive?: boolean;
}

export const updateAdminAccount = async (
  adminId: string,
  updates: UpdateAdminPayload,
  actor: IAdmin,
  context: RequestContextMeta = {}
) => {
  if (!adminId) {
    throw new ValidationException("Thiếu adminId");
  }

  const admin = await Admin.findById(adminId);
  if (!admin) {
    throw new NotFoundException("Admin", adminId);
  }

  if (updates.displayName) {
    admin.displayName = updates.displayName;
  }

  if (typeof updates.isActive === "boolean") {
    admin.isActive = updates.isActive;
  }

  if (updates.role) {
    admin.role = updates.role;
  }

  await admin.save();

  if (updates.role) {
    void recordAdminAuditLog({
      action: "ADMIN_ROLE_UPDATED",
      actor,
      targetType: "Admin",
      targetId: admin._id.toString(),
      metadata: { role: updates.role },
      ipAddress: context.ipAddress ?? undefined,
      userAgent: context.userAgent ?? undefined,
    });
  }

  if (typeof updates.isActive === "boolean") {
    void recordAdminAuditLog({
      action: "ADMIN_STATUS_CHANGED",
      actor,
      targetType: "Admin",
      targetId: admin._id.toString(),
      metadata: { isActive: updates.isActive },
      ipAddress: context.ipAddress ?? undefined,
      userAgent: context.userAgent ?? undefined,
    });
  }

  return sanitizeAdmin(admin);
};

