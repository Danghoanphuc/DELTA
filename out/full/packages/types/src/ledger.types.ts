import { Types } from "./mongoose.types.js";

/**
 * @description Trạng thái của một bút toán trong sổ cái công nợ.
 * UNPAID: Ghi nợ (PrintZ nợ nhà in) - Chưa thanh toán.
 * PAID: Ghi nợ đã được thanh toán (PrintZ đã trả tiền cho nhà in).
 * PENDING: Đang xử lý (ví dụ: đang trong chu kỳ Payout).
 * CANCELLED: Bút toán bị hủy (ví dụ: đơn hàng bị hủy sau khi đã ghi sổ).
 */
export enum BalanceLedgerStatus {
  UNPAID = "UNPAID",
  PAID = "PAID",
  PENDING = "PENDING",
  PROCESSING = "PROCESSING",
  CANCELLED = "CANCELLED",
}

/**
 * @description Loại giao dịch trong sổ cái.
 * SALE: Ghi nợ công nợ từ một đơn hàng bán thành công. (Giá trị dương)
 * PAYOUT: Ghi nhận việc thanh toán (chi trả) cho nhà in. (Giá trị âm)
 * REFUND: Ghi nhận việc hoàn tiền (nếu nhà in phải chịu). (Giá trị âm)
 * ADJUSTMENT: Điều chỉnh thủ công (thưởng/phạt từ GĐ 6.2). (Giá trị có thể âm/dương)
 */
export enum BalanceTransactionType {
  SALE = "SALE",
  PAYOUT = "PAYOUT",
  REFUND = "REFUND",
  ADJUSTMENT = "ADJUSTMENT",
}

/**
 * @description Đại diện cho một bút toán (ledger entry) trong sổ cái công nợ của nhà in.
 * Ghi lại số tiền PrintZ nợ nhà in cho mỗi đơn hàng con (sub-order).
 */
export interface IBalanceLedger {
  _id: Types.ObjectId;

  /**
   * @description Nhà in mà PrintZ nợ tiền.
   */
  printer: Types.ObjectId; // Ref: PrinterProfile

  /**
   * @description Đơn hàng cha (MasterOrder) liên quan.
   */
  masterOrder: Types.ObjectId; // Ref: MasterOrder

  /**
   * @description Đơn hàng con (Order/SubOrder) cụ thể phát sinh công nợ.
   */
  subOrder: Types.ObjectId; // Ref: Order

  /**
   * @description Số tiền của bút toán (tính bằng đơn vị VND).
   * - Dương (SALE): Tăng công nợ (PrintZ nợ thêm).
   * - Âm (PAYOUT, REFUND): Giảm công nợ (PrintZ trả bớt nợ).
   */
  amount: number;

  /**
   * @description Loại giao dịch (SALE, PAYOUT, etc.)
   */
  transactionType: BalanceTransactionType;

  /**
   * @description Trạng thái thanh toán của bút toán này (UNPAID, PAID).
   */
  status: BalanceLedgerStatus;

  /**
   * @description Cổng thanh toán đã xử lý giao dịch gốc (nếu có).
   * Hữu ích cho việc đối soát.
   */
  paymentGateway?: "STRIPE" | "VNPAY" | "MANUAL";

  /**
   * @description Ghi chú nội bộ cho kế toán (ví dụ: lý do điều chỉnh).
   */
  notes?: string;

  /**
   * @description Ngày bút toán này được thanh toán (cho GĐ 6).
   */
  paidAt?: Date;

  createdAt: Date;
  updatedAt: Date;
}
