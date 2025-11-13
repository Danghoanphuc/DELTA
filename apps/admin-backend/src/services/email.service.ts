// apps/admin-backend/src/services/email.service.ts
import { Resend } from "resend";

// === GIẢI PHÁP SỬA LỖI ===
// 1. Khai báo client là 'null'. Chúng ta sẽ không khởi tạo nó ngay lập tức.
let resend: Resend | null = null;

const FROM_EMAIL = process.env.FROM_EMAIL || "admin@printz.vn";

/**
 * Hàm helper để "khởi tạo lười" (lazy initialize) Resend client.
 * Nó chỉ chạy 1 lần duy nhất khi email được gửi lần đầu.
 */
const getResendClient = (): Resend | null => {
  // 2. Nếu đã khởi tạo, dùng lại (Singleton)
  if (resend) {
    return resend;
  }

  const apiKey = process.env.RESEND_API_KEY;

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