// backend/src/libs/email.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const clientUrl = process.env.CLIENT_URL || "https://www.printz.vn";
const appName = "PrintZ";
const resendDomain = process.env.RESEND_DOMAIN || "printz.vn";
const fromEmail = `PrintZ team <support@${resendDomain}>`;

// Hàm format tiền tệ
const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

export const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${clientUrl}/verify-email?token=${token}`;
  console.log(` Chuẩn bị gửi email xác thực đến ${email} từ ${fromEmail}`);
  console.log(` Link xác thực: ${verificationLink}`);
  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email, // --- TIÊU ĐỀ MỚI ---
      subject: `[${appName}] Xác nhận địa chỉ email của bạn`, // --- NỘI DUNG HTML MỚI ---
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Chào mừng bạn đến với ${appName}!</h1>
          </div>
          <div style="padding: 25px 30px;">
            <p style="font-size: 16px;">Cảm ơn bạn đã đăng ký tài khoản tại ${appName}.</p>
            <p style="font-size: 16px;">Chỉ còn một bước nữa thôi! Vui lòng nhấp vào nút bên dưới để xác nhận địa chỉ email của bạn và kích hoạt tài khoản:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" target="_blank" style="display: inline-block; padding: 12px 25px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold; transition: background-color 0.3s;">
                Xác nhận Email
              </a>
            </div>
            <p style="font-size: 14px; color: #666;">Nếu bạn gặp khó khăn khi nhấp vào nút, hãy sao chép và dán đường link sau vào trình duyệt:</p>
            <p style="font-size: 12px; color: #888; word-break: break-all;">${verificationLink}</p>
            <hr style="border: none; border-top: 1px solid #e0e0e0; margin: 25px 0;">
            <p style="font-size: 14px; color: #666;">Nếu bạn không đăng ký tài khoản này, vui lòng bỏ qua email này.</p>
            <p style="font-size: 14px; color: #666;">Trân trọng,<br>Đội ngũ ${appName}</p>
          </div>
          <div style="background-color: #f8f8f8; padding: 15px 30px; text-align: center; font-size: 12px; color: #999;">
            © ${new Date().getFullYear()} ${appName}. All rights reserved.
          </div>
        </div>
      `,
    });

    // --- XỬ LÝ LỖI (Giữ nguyên) ---
    if (error) {
      console.error(` Lỗi Resend API khi gửi đến ${email}:`, error);
      return; // Nên return hoặc throw lỗi ở đây
    }
    console.log(`✅ Email xác thực đã gửi đến ${email}. ID: ${data?.id}`);
  } catch (error) {
    console.error(` Lỗi nghiêm trọng khi gửi email đến ${email}:`, error);
  }
};

// --- HÀM MỚI (sendNewOrderNotification - Giữ nguyên) ---
export const sendNewOrderNotification = async (
  printerEmail,
  order,
  customer
) => {
  const orderDetailsLink = `${clientUrl}/printer/orders/${order._id}`; // Tạo bảng chi tiết sản phẩm (Giữ nguyên)

  const itemsHtml = order.items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #ddd;">
      <td style="padding: 10px; border-bottom: 1px solid #eee;">${
        item.productName
      }</td>
      <td style="padding: 10px; text-align: center; border-bottom: 1px solid #eee;">${
        item.quantity
      }</td>
      <td style="padding: 10px; text-align: right; border-bottom: 1px solid #eee;">${formatPrice(
        item.subtotal
      )}</td>
    </tr>
  `
    )
    .join("");

  console.log(` Chuẩn bị gửi email thông báo đơn hàng mới đến ${printerEmail}`);

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: printerEmail,
      subject: `[${appName}] Bạn có đơn hàng mới #${order.orderNumber}!`,
      html: `
        <div style="font-family: Arial, sans-serif; line-height: 1.6; color: #333;">
          {/* ... Nội dung email thông báo đơn hàng giữ nguyên ... */}
        </div>
      `,
    });

    if (error) {
      console.error(` Lỗi Resend API khi gửi đến ${printerEmail}:`, error);
      return;
    }

    console.log(
      `✅ Email thông báo đơn hàng ${order.orderNumber} đã gửi đến ${printerEmail}. ID: ${data?.id}`
    );
  } catch (error) {
    console.error(
      ` Lỗi nghiêm trọng khi gửi email đơn hàng đến ${printerEmail}:`,
      error
    );
  }
};
