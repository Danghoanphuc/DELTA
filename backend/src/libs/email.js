// backend/src/libs/email.js (Đã sửa - JavaScript thuần)
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const clientUrl = process.env.CLIENT_URL || "https://www.printz.vn";
const appName = "PrintZ";
// Nên thêm RESEND_DOMAIN vào Render Environment Variables
const resendDomain = process.env.RESEND_DOMAIN || "printz.vn";
const fromEmail = `PrintZ team <support@${resendDomain}>`;

// 👇 Xóa ": string" ở đây 👇
export const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${clientUrl}/verify-email?token=${token}`;

  console.log(` Chuẩn bị gửi email xác thực đến ${email} từ ${fromEmail}`);
  console.log(` Link xác thực: ${verificationLink}`);

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email, // Chỉ cần 'email'
      subject: `Chào mừng bạn đến với ${appName}! Xác thực email của bạn`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          <h1 style="color: #4F46E5;">Chào mừng bạn đến với ${appName}!</h1>
          <p>Cảm ơn bạn đã đăng ký. Vui lòng nhấp vào nút bên dưới để kích hoạt tài khoản của bạn:</p>
          <a
            href="${verificationLink}"
            target="_blank"
            style="display: inline-block; padding: 12px 24px; margin: 20px 0; background-color: #4F46E5; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;"
          >
            Kích hoạt tài khoản
          </a>
          <p style="margin-top: 30px; font-size: 0.9em; color: #666;">Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
          <p style="font-size: 0.9em; color: #666;">Trân trọng,<br>Đội ngũ ${appName}</p>
        </div>
      `,
    });

    if (error) {
      console.error(` Lỗi Resend API khi gửi đến ${email}:`, error);
      return; // Dừng lại nếu có lỗi API
    }

    console.log(
      `✅ Email xác thực đã gửi thành công đến ${email}. ID: ${data?.id}`
    );
  } catch (error) {
    console.error(` Lỗi nghiêm trọng khi gửi email đến ${email}:`, error);
    // Có thể ném lỗi ở đây nếu cần hàm gọi biết
    // throw error;
  }
};

// ... (Có thể thêm hàm sendPasswordResetEmail tương tự ở đây) ...
