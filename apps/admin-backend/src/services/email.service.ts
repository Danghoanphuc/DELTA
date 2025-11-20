// apps/admin-backend/src/services/email.service.ts
import { Resend } from "resend";
import { config } from "../config/env.config.js";

// === GIẢI PHÁP SỬA LỖI ===
// 1. Khai báo client là 'null'. Chúng ta sẽ không khởi tạo nó ngay lập tức.
let resend: Resend | null = null;

const FROM_EMAIL = config.email.fromEmail;

/**
 * Hàm helper để "khởi tạo lười" (lazy initialize) Resend client.
 * Nó chỉ chạy 1 lần duy nhất khi email được gửi lần đầu.
 */
const getResendClient = (): Resend | null => {
  // 2. Nếu đã khởi tạo, dùng lại (Singleton)
  if (resend) {
    return resend;
  }

  const apiKey = config.email.resendApiKey;

  // 3. Nếu có API key, khởi tạo và lưu lại
  if (apiKey) {
    console.log("[Email Service] Khởi tạo Resend client...");
    resend = new Resend(apiKey);
    return resend;
  }

  // 4. Nếu không có API key, trả về null
  return null;
};

/**
 * Gửi email thông báo từ chối hồ sơ nhà in
 * (Logic hàm này không đổi, chỉ đổi cách gọi client)
 */
export const sendPrinterRejectionEmail = async (
  toEmail: string,
  businessName: string,
  reason: string
) => {
  // 5. Lấy client bằng hàm helper
  const client = getResendClient();

  // 6. Kiểm tra client *trước khi* sử dụng
  if (!client) {
    console.warn("!!! CẢNH BÁO: Thiếu RESEND_API_KEY. Bỏ qua việc gửi email.");
    return;
  }

  try {
    await client.emails.send({
      // <-- Dùng client đã được khởi tạo
      from: `PrintZ Admin <${FROM_EMAIL}>`,
      to: [toEmail],
      subject: `[PrintZ] Thông báo về hồ sơ nhà in: ${businessName}`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Chào ${businessName},</h2>
          <p>Chúng tôi rất tiếc phải thông báo rằng hồ sơ đăng ký nhà in của bạn trên PrintZ đã không được chấp thuận.</p>
          <p><strong>Lý do từ chối:</strong></p>
          <p style="padding: 10px; border-left: 4px solid #f00; background-color: #f9f9f9;">
            <em>${reason || "Không có lý do cụ thể được cung cấp."}</em>
          </p>
          <p>Bạn có thể cập nhật lại hồ sơ và nộp lại để chúng tôi xem xét.</p>
          <p>Trân trọng,<br>Đội ngũ PrintZ Admin</p>
        </div>
      `,
    });

    console.log(`[Email Service] Đã gửi email từ chối đến ${toEmail}`);
  } catch (error) {
    console.error(`[Email Service] Lỗi khi gửi email đến ${toEmail}:`, error);
  }
};

export const sendAdminPasswordResetEmail = async (
  toEmail: string,
  resetUrl: string,
  expiresAt: Date
) => {
  const client = getResendClient();

  if (!client) {
    console.warn(
      "!!! CẢNH BÁO: Thiếu RESEND_API_KEY. Không thể gửi email đặt lại mật khẩu."
    );
    return;
  }

  try {
    await client.emails.send({
      from: `PrintZ Admin <${FROM_EMAIL}>`,
      to: [toEmail],
      subject: "[PrintZ Admin] Đặt lại mật khẩu đăng nhập",
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Xin chào,</h2>
          <p>Chúng tôi nhận được yêu cầu đặt lại mật khẩu cho tài khoản quản trị PrintZ.</p>
          <p>Vui lòng nhấn vào đường dẫn dưới đây để thiết lập mật khẩu mới:</p>
          <p>
            <a href="${resetUrl}" style="color: #2563eb;" target="_blank" rel="noopener">Đặt lại mật khẩu</a>
          </p>
          <p>Liên kết này sẽ hết hạn lúc <strong>${expiresAt.toLocaleString()}</strong>.</p>
          <p>Nếu bạn không yêu cầu, vui lòng bỏ qua email này hoặc liên hệ đội ngũ an ninh.</p>
          <p>Trân trọng,<br />Đội ngũ PrintZ Admin</p>
        </div>
      `,
    });
  } catch (error) {
    console.error(
      `[Email Service] Lỗi khi gửi email đặt lại mật khẩu đến ${toEmail}:`,
      error
    );
  }
};

export const sendAssetFlagNotification = async (
  toEmail: string,
  assetName: string,
  assetType: "product" | "template",
  reason: string
) => {
  const client = getResendClient();

  if (!client) {
    console.warn(
      "!!! CẢNH BÁO: Thiếu RESEND_API_KEY. Không thể gửi email cảnh báo nội dung."
    );
    return;
  }

  const subjectAsset =
    assetType === "product" ? "sản phẩm" : "mẫu thiết kế (template)";

  try {
    await client.emails.send({
      from: `PrintZ Content Review <${FROM_EMAIL}>`,
      to: [toEmail],
      subject: `[PrintZ] ${subjectAsset} "${assetName}" đã bị gắn cờ`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6;">
          <h2>Xin chào,</h2>
          <p>Sau khi rà soát, chúng tôi đã gắn cờ ${subjectAsset} <strong>${assetName}</strong>.</p>
          <p><strong>Lý do:</strong></p>
          <p style="padding: 10px; border-left: 4px solid #f87171; background-color: #fef2f2;">
            ${reason}
          </p>
          <p>Vui lòng cập nhật lại nội dung theo chính sách của PrintZ trước khi gửi lại để xét duyệt.</p>
          <p>Nếu bạn cần hỗ trợ, hãy phản hồi lại email này.</p>
          <p>Trân trọng,<br/>Đội ngũ Moderation - PrintZ</p>
        </div>
      `,
    });
  } catch (error) {
    console.error(
      `[Email Service] Lỗi khi gửi email cảnh báo nội dung đến ${toEmail}:`,
      error
    );
  }
};