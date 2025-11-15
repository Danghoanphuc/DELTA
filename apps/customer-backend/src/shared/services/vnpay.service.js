// apps/customer-backend/src/shared/services/vnpay.service.js
import crypto from "crypto";
import qs from "qs";
import { config } from "../../config/env.config.js";
import { Logger } from "../utils/logger.util.js";
import { format } from "date-fns";

/**
 * @description Sắp xếp các key của object theo thứ tự ABC
 * Bắt buộc bởi VNPay để tạo checksum
 * ✅ SỬA: Chỉ sắp xếp key, không encode giá trị (qs.stringify sẽ xử lý)
 */
function sortObject(obj) {
  const sorted = {};
  const keys = Object.keys(obj).sort();
  for (const key of keys) {
    sorted[key] = obj[key]; // Giữ nguyên giá trị, không encode
  }
  return sorted;
}

export class VnPayService {
  constructor() {
    this.tmnCode = config.vnp.tmnCode;
    // ✅ SỬA: Trim hashSecret để loại bỏ khoảng trắng thừa từ .env
    this.hashSecret = (config.vnp.hashSecret || "").trim();
    this.vnpUrl = config.vnp.url;
    this.returnUrlBase = config.vnp.returnUrl;
    this.ipnUrl = config.vnp.ipnUrl;

    if (!this.tmnCode || !this.hashSecret) {
      Logger.warn(
        "[VnPayService] VNP_TMN_CODE hoặc VNP_HASH_SECRET chưa được cấu hình!"
      );
    } else {
      Logger.debug(`[VnPayService] HashSecret length: ${this.hashSecret.length}`);
    }
  }

  /**
   * Tạo URL thanh toán VNPay
   * @param {string} masterOrderId - ID của MasterOrder (dùng làm vnp_TxnRef)
   * @param {number} amount - Tổng số tiền (VND)
   * @param {string} ipAddr - Địa chỉ IP của khách hàng
   * @param {string} orderInfo - Thông tin đơn hàng (ví dụ: "Thanh toan don hang P-251112-0001")
   * @returns {string} - URL thanh toán VNPay
   */
  createPaymentUrl(masterOrderId, amount, ipAddr, orderInfo) {
    Logger.debug(`[VnPayService] Tạo URL cho MasterOrder: ${masterOrderId}`);

    const createDate = new Date();
    const vnp_CreateDate = format(createDate, "yyyyMMddHHmmss");

    // VNPay yêu cầu amount * 100 (đưa về xu)
    const vnp_Amount = amount * 100;

    // IP có thể là ::1 (localhost IPv6), VNPay không thích điều này
    if (ipAddr === "::1" || ipAddr.includes("127.0.0.1")) {
      ipAddr = "192.168.0.1"; // IP local giả lập
    }

    const vnp_ReturnUrl = `${this.returnUrlBase}/${masterOrderId}`;

    let vnpParams = {};
    vnpParams["vnp_Version"] = "2.1.0";
    vnpParams["vnp_Command"] = "pay";
    vnpParams["vnp_TmnCode"] = this.tmnCode;
    vnpParams["vnp_Locale"] = "vn";
    vnpParams["vnp_CurrCode"] = "VND";
    vnpParams["vnp_TxnRef"] = masterOrderId; // Mã tham chiếu (là MasterOrder ID)
    vnpParams["vnp_OrderInfo"] = orderInfo;
    vnpParams["vnp_OrderType"] = "other"; // (Loại hàng hóa)
    vnpParams["vnp_Amount"] = vnp_Amount;
    vnpParams["vnp_ReturnUrl"] = vnp_ReturnUrl; // URL trả về Frontend
    vnpParams["vnp_IpAddr"] = ipAddr;
    vnpParams["vnp_CreateDate"] = vnp_CreateDate;
    vnpParams["vnp_IpnUrl"] = this.ipnUrl; // URL IPN (Backend)

    // Sắp xếp params theo ABC
    vnpParams = sortObject(vnpParams);

    // ✅ SỬA: Tạo chuỗi query string để ký (KHÔNG encode - theo tài liệu VNPay)
    // Format: key1=value1&key2=value2 (giữ nguyên giá trị, không encode)
    const signData = Object.keys(vnpParams)
      .map((key) => `${key}=${vnpParams[key]}`)
      .join("&");

    // ✅ Log chi tiết (chỉ trong development để bảo mật)
    if (config.env === "development") {
      Logger.debug(`[VnPayService] SignData (full): ${signData}`);
      Logger.debug(`[VnPayService] SignData length: ${signData.length}`);
      Logger.debug(`[VnPayService] HashSecret: ${this.hashSecret.substring(0, 10)}...${this.hashSecret.substring(this.hashSecret.length - 10)}`);
      Logger.debug(`[VnPayService] HashSecret length: ${this.hashSecret.length}`);
    }

    // Tạo chữ ký (SecureHash) bằng SHA512
    const hmac = crypto.createHmac("sha512", this.hashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");
    
    if (config.env === "development") {
      Logger.debug(`[VnPayService] SecureHash (full): ${signed}`);
    } else {
      Logger.debug(`[VnPayService] SecureHash created (length: ${signed.length})`);
    }

    vnpParams["vnp_SecureHash"] = signed;

    // ✅ SỬA: Sắp xếp lại params sau khi thêm SecureHash (theo ABC)
    // VNPay yêu cầu tất cả params trong URL phải được sắp xếp theo ABC
    vnpParams = sortObject(vnpParams);

    // ✅ Build URL đầy đủ với URL encoding đúng cách
    // VNPay yêu cầu encode các giá trị khi build URL (nhưng không encode khi tạo chữ ký)
    const queryString = Object.keys(vnpParams)
      .map((key) => {
        const value = String(vnpParams[key]);
        // URL encode giá trị khi build URL
        return `${key}=${encodeURIComponent(value)}`;
      })
      .join("&");

    const paymentUrl = `${this.vnpUrl}?${queryString}`;

    Logger.debug(`[VnPayService] Final URL (first 200 chars): ${paymentUrl.substring(0, 200)}...`);
    return paymentUrl;
  }

  /**
   * Xác thực chữ ký từ VNPay (dùng cho cả Return URL và IPN)
   * @param {object} vnpayQuery - Object query (req.query) từ VNPay
   * @returns {boolean} - True nếu hợp lệ, False nếu không
   */
  verifyReturn(vnpayQuery) {
    Logger.debug("[VnPayService] Đang xác thực (verify) chữ ký VNPay...");
    const secureHash = vnpayQuery["vnp_SecureHash"];

    // Xóa hash và hashType khỏi object để kiểm tra
    let vnpParams = { ...vnpayQuery };
    delete vnpParams["vnp_SecureHash"];
    delete vnpParams["vnp_SecureHashType"];

    // Sắp xếp
    vnpParams = sortObject(vnpParams);

    // ✅ SỬA: Tạo chuỗi query string để verify (KHÔNG encode - theo tài liệu VNPay)
    // Format: key1=value1&key2=value2 (giữ nguyên giá trị, không encode)
    const signData = Object.keys(vnpParams)
      .map((key) => `${key}=${vnpParams[key]}`)
      .join("&");

    // Tạo chữ ký (SecureHash) bằng SHA512
    const hmac = crypto.createHmac("sha512", this.hashSecret);
    const signed = hmac.update(Buffer.from(signData, "utf-8")).digest("hex");

    if (secureHash === signed) {
      Logger.info("[VnPayService] Chữ ký VNPay HỢP LỆ.");
      return true;
    } else {
      Logger.warn("[VnPayService] CẢNH BÁO: Chữ ký VNPay KHÔNG HỢP LỆ!");
      return false;
    }
  }
}
