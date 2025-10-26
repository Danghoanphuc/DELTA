// backend/src/libs/email.js (ĐÃ THÊM HÀM MỚI)
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
      to: email,
      subject: `Chào mừng bạn đến với ${appName}! Xác thực email của bạn`,
      html: `... (Nội dung email xác thực giữ nguyên) ...`,
    });
    // ... (Phần xử lý lỗi giữ nguyên) ...
  } catch (error) {
    console.error(` Lỗi nghiêm trọng khi gửi email đến ${email}:`, error);
  }
};

// --- HÀM MỚI ---
export const sendNewOrderNotification = async (
  printerEmail,
  order,
  customer
) => {
  const orderDetailsLink = `${clientUrl}/printer/orders/${order._id}`; // Cần tạo route này ở frontend sau

  // Tạo bảng chi tiết sản phẩm
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr>
      <td style="padding: 8px; border: 1px solid #ddd;">${item.productName}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: center;">${
        item.quantity
      }</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatPrice(
        item.pricePerUnit
      )}</td>
      <td style="padding: 8px; border: 1px solid #ddd; text-align: right;">${formatPrice(
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
          <h1 style="color: #F97316;">🔔 Bạn có đơn hàng mới!</h1>
          <p>Xin chào, bạn vừa nhận được một đơn hàng mới trên ${appName}:</p>
          <p><strong>Mã đơn hàng:</strong> ${order.orderNumber}</p>
          <p><strong>Khách hàng:</strong> ${customer.name} (${
        customer.email
      })</p>
          <p><strong>Tổng tiền:</strong> <strong style="color: #DC2626;">${formatPrice(
            order.total
          )}</strong></p>

          <h2 style="margin-top: 25px; color: #F97316;">Chi tiết đơn hàng:</h2>
          <table style="width: 100%; border-collapse: collapse; margin-bottom: 20px;">
            <thead>
              <tr>
                <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2; text-align: left;">Sản phẩm</th>
                <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2; text-align: center;">SL</th>
                <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2; text-align: right;">Đơn giá</th>
                <th style="padding: 8px; border: 1px solid #ddd; background-color: #f2f2f2; text-align: right;">Thành tiền</th>
              </tr>
            </thead>
            <tbody>
              ${itemsHtml}
            </tbody>
          </table>

          <p><strong>Địa chỉ giao hàng:</strong></p>
          <p>
            ${order.shippingAddress.recipientName}<br>
            ${order.shippingAddress.phone}<br>
            ${order.shippingAddress.street}, ${
        order.shippingAddress.ward ? order.shippingAddress.ward + ", " : ""
      }${order.shippingAddress.district}, ${order.shippingAddress.city}
          </p>
          ${
            order.customerNotes
              ? `<p><strong>Ghi chú của khách:</strong> ${order.customerNotes}</p>`
              : ""
          }

          <p style="margin-top: 30px;">Vui lòng truy cập trang quản lý đơn hàng để xác nhận và xử lý:</p>
          <a
            href="${orderDetailsLink}"
            target="_blank"
            style="display: inline-block; padding: 12px 24px; margin: 10px 0; background-color: #F97316; color: white; text-decoration: none; border-radius: 5px; font-weight: bold;"
          >
            Xem chi tiết đơn hàng
          </a>
          <p style="margin-top: 30px; font-size: 0.9em; color: #666;">Trân trọng,<br>Đội ngũ ${appName}</p>
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
