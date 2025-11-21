import {
  type Document,
  type FilterQuery,
  type Model,
  isValidObjectId,
} from "mongoose";
import { MASTER_ORDER_STATUS } from "@printz/types";
import {
  NotFoundException,
  ValidationException,
} from "../shared/exceptions.js";
import {
  type AdminOrderStatus,
  type IMasterOrder,
  type IOrderListQuery,
  type PaginatedOrdersResult,
  type RequestContextMeta,
  type MasterOrderStatusValue,
} from "../interfaces/order.interface.js";
import { type IAdmin } from "../models/admin.model.js";
import { recordAdminAuditLog } from "./admin.audit-log.service.js";
import {
  MasterOrder as MasterOrderModel,
  type MasterOrderDocument,
} from "../models/master-order.model.js";

const DEFAULT_PAGE_SIZE = 20;
const MAX_PAGE_SIZE = 100;

const ADMIN_STATUS_FILTER_MAP: Record<
  AdminOrderStatus,
  MasterOrderStatusValue[]
> = {
  Pending: [
    MASTER_ORDER_STATUS.PENDING,
    MASTER_ORDER_STATUS.PENDING_PAYMENT,
    MASTER_ORDER_STATUS.PAID_WAITING_FOR_PRINTER,
  ],
  Processing: [
    MASTER_ORDER_STATUS.PROCESSING,
    MASTER_ORDER_STATUS.SHIPPING,
  ],
  Completed: [MASTER_ORDER_STATUS.COMPLETED],
  Cancelled: [MASTER_ORDER_STATUS.CANCELLED],
};

const ADMIN_STATUS_UPDATE_MAP: Record<
  AdminOrderStatus,
  MasterOrderStatusValue
> = {
  Pending: MASTER_ORDER_STATUS.PENDING,
  Processing: MASTER_ORDER_STATUS.PROCESSING,
  Completed: MASTER_ORDER_STATUS.COMPLETED,
  Cancelled: MASTER_ORDER_STATUS.CANCELLED,
};

const POPULATE_PRINTER_PROFILE = {
  path: "printerOrders.printerProfileId",
  select:
    "businessName contactEmail contactPhone tier logoUrl shopAddress isActive stripeAccountId",
};

const escapeRegex = (value: string) =>
  value.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");

const normalizeAdminStatus = (value?: string): AdminOrderStatus | null => {
  if (!value) return null;
  switch (value.trim().toLowerCase()) {
    case "pending":
      return "Pending";
    case "processing":
      return "Processing";
    case "completed":
      return "Completed";
    case "cancelled":
      return "Cancelled";
    default:
      return null;
  }
};

const parsePaginationParam = (
  value: number | string | undefined,
  fallback: number,
  max: number = MAX_PAGE_SIZE
) => {
  const numeric = Number(value);
  if (Number.isNaN(numeric) || numeric <= 0) {
    return fallback;
  }
  return Math.min(Math.floor(numeric), max);
};

const ensureValidObjectId = (id: string, fieldLabel = "id") => {
  if (!id || !isValidObjectId(id)) {
    throw new ValidationException(`Giá trị '${fieldLabel}' không hợp lệ.`);
  }
};

export const getAllOrders = async (
  query: IOrderListQuery
): Promise<PaginatedOrdersResult> => {
  const page = Math.max(parsePaginationParam(query.page, 1), 1);
  const limit = parsePaginationParam(
    query.limit,
    DEFAULT_PAGE_SIZE,
    MAX_PAGE_SIZE
  );
  const search = query.search?.toString().trim() ?? "";
  const normalizedStatus = normalizeAdminStatus(
    typeof query.status === "string" ? query.status : undefined
  );

  const filter: FilterQuery<MasterOrderDocument> = {};

  if (normalizedStatus) {
    filter.masterStatus = { $in: ADMIN_STATUS_FILTER_MAP[normalizedStatus] };
  }

  if (search) {
    const regex = new RegExp(escapeRegex(search), "i");
    filter.$or = [{ orderNumber: regex }, { customerEmail: regex }];
  }

  const [orders, total] = await Promise.all([
    MasterOrderModel.find(filter)
      .populate(POPULATE_PRINTER_PROFILE)
      .sort({ createdAt: -1 })
      .skip((page - 1) * limit)
      .limit(limit)
      .lean()
      .exec(),
    MasterOrderModel.countDocuments(filter),
  ]);

  return {
    data: orders as unknown as IMasterOrder[],
    page,
    limit,
    total,
    totalPages: Math.max(1, Math.ceil(total / limit)),
  };
};

export const getOrderDetails = async (
  orderId: string
): Promise<IMasterOrder> => {
  ensureValidObjectId(orderId, "orderId");
  const order = await MasterOrderModel.findById(orderId)
    .populate(POPULATE_PRINTER_PROFILE)
    .lean()
    .exec();

  if (!order) {
    throw new NotFoundException("Đơn hàng", orderId);
  }

  return order as unknown as IMasterOrder;
};

export const forceUpdateStatus = async (
  orderId: string,
  statusInput: string,
  admin: IAdmin,
  adminNote?: string,
  context: RequestContextMeta = {}
): Promise<IMasterOrder> => {
  ensureValidObjectId(orderId, "orderId");

  if (!admin) {
    throw new ValidationException("Thiếu thông tin Admin thực hiện hành động.");
  }

  const normalizedStatus = normalizeAdminStatus(statusInput);
  if (!normalizedStatus) {
    throw new ValidationException("Trạng thái cập nhật không hợp lệ.");
  }

  if (adminNote && adminNote.length > 1000) {
    throw new ValidationException("Ghi chú tối đa 1000 ký tự.");
  }

  const order = await MasterOrderModel.findById(orderId);
  if (!order) {
    throw new NotFoundException("Đơn hàng", orderId);
  }

  const previousStatus = order.masterStatus;
  const nextStatus = ADMIN_STATUS_UPDATE_MAP[normalizedStatus];

  if (previousStatus === nextStatus) {
    throw new ValidationException("Đơn hàng đã ở trạng thái này.");
  }

  order.masterStatus = nextStatus;
  await order.save();

  const orderIdStr = String(order._id);
  
  void recordAdminAuditLog({
    action: "ORDER_STATUS_FORCE_UPDATED",
    actor: admin,
    targetType: "MasterOrder",
    targetId: orderIdStr,
    metadata: {
      orderNumber: order.orderNumber,
      previousStatus,
      nextStatus,
      adminNote: adminNote ?? null,
    },
    ipAddress: context.ipAddress ?? undefined,
    userAgent: context.userAgent ?? undefined,
  });

  return await getOrderDetails(orderIdStr);
};

