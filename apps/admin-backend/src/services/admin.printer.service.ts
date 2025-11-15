// apps/admin-backend/src/services/admin.printer.service.ts
import { Model, Document } from "mongoose";

// 1. Import model từ customer-backend
// @ts-ignore - Customer backend .js files, no type declarations
import { PrinterProfile as PrinterProfileModelJS } from "../../../customer-backend/src/shared/models/printer-profile.model.js";
// --- THÊM IMPORT USER MODEL ---
// @ts-ignore - Customer backend .js files, no type declarations
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
  shopAddress?: {
    street: string;
    district: string;
    city: string;
  };
  createdAt?: Date;
  updatedAt?: Date;
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
 * ✅ FIX: Hiển thị cả "not_submitted" và "pending_review" để admin thấy tất cả profiles mới
 */
export const getPendingPrinters = async (query: any) => {
  const page = parseInt(query.page || "1", 10);
  const limit = parseInt(query.limit || "10", 10);

  // ✅ FIX: Lấy cả "not_submitted" và "pending_review"
  // "not_submitted": Profile mới tạo, chưa nộp verification docs
  // "pending_review": Profile đã nộp verification docs, đang chờ duyệt
  const filter = {
    verificationStatus: { $in: ["not_submitted", "pending_review"] },
    // ✅ Chỉ lấy các profile chưa được verify
    isVerified: false,
  };

  const printers = await PrinterProfileModel.find(filter)
    .populate("user", "email displayName avatarUrl") // ✅ FIX: Populate user info
    .sort({ createdAt: -1 }) // ✅ FIX: Sắp xếp theo ngày tạo mới nhất trước
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

    // ✅ FIX: Đảm bảo user có printerProfileId được set
    if (printer.user && typeof printer.user !== "string") {
      const userId = (printer.user as IUser)._id || (printer.user as IUser).id;
      if (userId) {
        await CustomerModel.findByIdAndUpdate(userId, {
          printerProfileId: printer._id,
        });
        console.log(`✅ Đã cập nhật printerProfileId cho user ${userId}`);
      }
    }
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
