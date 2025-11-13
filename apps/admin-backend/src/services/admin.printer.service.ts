// apps/admin-backend/src/services/admin.printer.service.ts
import { Model, Document } from "mongoose";

// 1. Import model từ customer-backend
import { PrinterProfile as PrinterProfileModelJS } from "../../../customer-backend/src/shared/models/printer-profile.model.js";
// --- THÊM IMPORT USER MODEL ---
import { User as CustomerUserModelJS } from "../../../customer-backend/src/shared/models/user.model.js";
// --- THÊM CÁC IMPORT KHÁC ---
import {
  NotFoundException,
  ValidationException,
} from "../shared/exceptions.js";
import { sendPrinterRejectionEmail } from "./email.service.js"; // <-- THÊM
import { type IUser } from "@printz/types";

// 2. Định nghĩa kiểu
interface IPrinterProfile {
  businessName: string;
  contactPhone: string;
  verificationStatus:
    | "not_submitted"
    | "pending_review"
    | "approved"
    | "rejected";
  isVerified: boolean;
  isActive: boolean;
  verificationDocs?: {
    gpkdUrl?: string;
    cccdUrl?: string;
  };
  user: string | IUser; // <-- SỬA: Cho phép populate
}
type IPrinterProfileModel = Model<IPrinterProfile & Document>;

// --- THÊM ĐỊNH NGHĨA KIỂU USER (Tương tự admin.user.service) ---
type ICustomerUserModel = Model<IUser & Document>;
const CustomerModel = CustomerUserModelJS as unknown as ICustomerUserModel;

// 3. Ép kiểu
const PrinterProfileModel =
  PrinterProfileModelJS as unknown as IPrinterProfileModel;

/**
 * Lấy danh sách nhà in đang chờ duyệt
 * (Không thay đổi)
 */
export const getPendingPrinters = async (query: any) => {
  const page = parseInt(query.page || "1", 10);
  const limit = parseInt(query.limit || "10", 10);

  const filter = {
    verificationStatus: "pending_review",
  };

  const printers = await PrinterProfileModel.find(filter)
    .sort({ updatedAt: 1 })
    .skip((page - 1) * limit)
    .limit(limit);

  const total = await PrinterProfileModel.countDocuments(filter);

  return {
    data: printers,
    page,
    limit,
    total,
    totalPages: Math.ceil(total / limit),
  };
};

/**
 * Duyệt (Approve/Reject) một nhà in
 * (NÂNG CẤP LOGIC)
 */
export const verifyPrinter = async (
  printerId: string,
  action: "approve" | "reject",
  reason?: string // <-- Giờ chúng ta sẽ dùng trường này
) => {
  // --- NÂNG CẤP: Populate 'user' để lấy email ---
  const printer = await PrinterProfileModel.findById(printerId).populate(
    "user"
  );
  if (!printer) {
    throw new NotFoundException("Không tìm thấy hồ sơ nhà in", printerId);
  }

  if (action === "approve") {
    printer.verificationStatus = "approved";
    printer.isVerified = true;
    printer.isActive = true;
    // (Sau này có thể thêm logic gửi mail Chúc mừng)
  } else {
    // Logic khi REJECT
    if (!reason || reason.trim().length === 0) {
      throw new ValidationException("Lý do từ chối là bắt buộc");
    }

    printer.verificationStatus = "rejected";
    printer.isVerified = false;
    // (Chúng ta có thể lưu 'reason' vào một trường mới sau, ví dụ: printer.rejectionReason = reason)

    // --- NÂNG CẤP: Gửi Email Từ chối ---
    if (printer.user && (printer.user as IUser).email) {
      const userEmail = (printer.user as IUser).email;
      const businessName = printer.businessName;

      // Không cần await, chạy nền để không block response
      sendPrinterRejectionEmail(userEmail, businessName, reason).catch(
        (err) => {
          console.error("Lỗi gửi email nền:", err);
        }
      );
    } else {
      console.warn(
        `Không tìm thấy email cho nhà in ID: ${printerId}, bỏ qua gửi mail.`
      );
    }
  }

  await printer.save();
  return printer;
};
