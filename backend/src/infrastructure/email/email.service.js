// backend/src/infrastructure/email/email.service.js
import { Resend } from "resend";

const resend = new Resend(process.env.RESEND_API_KEY);

const clientUrl = process.env.CLIENT_URL || "https://www.printz.vn";
const appName = "PrintZ";
const resendDomain = process.env.RESEND_DOMAIN || "printz.vn";
const fromEmail = `PrintZ team <support@${resendDomain}>`;

// ============================================
// HELPER FUNCTIONS
// ============================================

// Hàm format tiền tệ
const formatPrice = (price) => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(price);
};

// Hàm format ngày giờ
const formatDate = (date) => {
  return new Intl.DateTimeFormat("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
  }).format(new Date(date));
};

// ============================================
// EMAIL: VERIFICATION (✅ GIỮ NGUYÊN)
// ============================================

export const sendVerificationEmail = async (email, token) => {
  const verificationLink = `${clientUrl}/verify-email?token=${token}`;
  console.log(`📧 Chuẩn bị gửi email xác thực đến ${email} từ ${fromEmail}`);
  console.log(`🔗 Link xác thực: ${verificationLink}`);

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: email,
      subject: `[${appName}] Xác nhận địa chỉ email của bạn`,
      html: `
        <div style="font-family: 'Segoe UI', Tahoma, Geneva, Verdana, sans-serif; line-height: 1.6; color: #333; max-width: 600px; margin: 20px auto; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
          <div style="background-color: #4f46e5; color: white; padding: 20px; text-align: center;">
            <h1 style="margin: 0; font-size: 24px;">Chào mừng bạn đến với ${appName}!</h1>
          </div>
          <div style="padding: 25px 30px;">
            <p style="font-size: 16px;">Cảm ơn bạn đã đăng ký tài khoản tại ${appName}.</p>
            <p style="font-size: 16px;">Chỉ còn một bước nữa thôi! Vui lòng nhấp vào nút bên dưới để xác nhận địa chỉ email của bạn và kích hoạt tài khoản:</p>
            <div style="text-align: center; margin: 30px 0;">
              <a href="${verificationLink}" target="_blank" style="display: inline-block; padding: 12px 25px; background-color: #4f46e5; color: white; text-decoration: none; border-radius: 5px; font-size: 16px; font-weight: bold;">
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

    if (error) {
      console.error(`❌ Lỗi Resend API khi gửi đến ${email}:`, error);
      return;
    }
    console.log(`✅ Email xác thực đã gửi đến ${email}. ID: ${data?.id}`);
  } catch (error) {
    console.error(`❌ Lỗi nghiêm trọng khi gửi email đến ${email}:`, error);
  }
};

// ============================================
// EMAIL: NEW ORDER NOTIFICATION (✅ FIXED - BỔ SUNG ĐẦY ĐỦ)
// ============================================

export const sendNewOrderNotification = async (
  printerEmail,
  order,
  customer
) => {
  const orderDetailsLink = `${clientUrl}/printer/orders/${order._id}`;

  console.log(
    `📧 Chuẩn bị gửi email thông báo đơn hàng mới #${order.orderNumber} đến ${printerEmail}`
  );

  // ✅ Tạo bảng chi tiết sản phẩm
  const itemsHtml = order.items
    .map(
      (item) => `
    <tr style="border-bottom: 1px solid #eee;">
      <td style="padding: 12px 10px;">
        <strong>${item.productName}</strong>
        ${
          item.customization?.notes
            ? `<br><span style="font-size: 12px; color: #666;">Ghi chú: ${item.customization.notes}</span>`
            : ""
        }
      </td>
      <td style="padding: 12px 10px; text-align: center;">${item.quantity}</td>
      <td style="padding: 12px 10px; text-align: right;">${formatPrice(
        item.pricePerUnit
      )}</td>
      <td style="padding: 12px 10px; text-align: right;"><strong>${formatPrice(
        item.subtotal
      )}</strong></td>
    </tr>
  `
    )
    .join("");

  // ✅ Địa chỉ giao hàng
  const shippingAddressHtml = `
    ${order.shippingAddress.recipientName}<br>
    ${order.shippingAddress.phone}<br>
    ${order.shippingAddress.street}${
    order.shippingAddress.ward ? ", " + order.shippingAddress.ward : ""
  }<br>
    ${order.shippingAddress.district}, ${order.shippingAddress.city}
    ${
      order.shippingAddress.notes
        ? `<br><em style="font-size: 12px; color: #666;">Ghi chú: ${order.shippingAddress.notes}</em>`
        : ""
    }
  `;

  try {
    const { data, error } = await resend.emails.send({
      from: fromEmail,
      to: printerEmail,
      subject: `[${appName}] 🎉 Bạn có đơn hàng mới #${order.orderNumber}!`,
      html: `
        <!DOCTYPE html>
        <html>
        <head>
          <meta charset="UTF-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
        </head>
        <body style="margin: 0; padding: 0; font-family: Arial, sans-serif; background-color: #f5f5f5;">
          <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f5f5f5; padding: 20px 0;">
            <tr>
              <td align="center">
                <!-- Main Container -->
                <table width="600" cellpadding="0" cellspacing="0" style="background-color: #ffffff; border-radius: 8px; overflow: hidden; box-shadow: 0 2px 4px rgba(0,0,0,0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); padding: 30px; text-align: center;">
                      <h1 style="margin: 0; color: #ffffff; font-size: 28px; font-weight: bold;">
                        🎉 Đơn hàng mới!
                      </h1>
                      <p style="margin: 10px 0 0 0; color: #e0e7ff; font-size: 16px;">
                        #${order.orderNumber}
                      </p>
                    </td>
                  </tr>

                  <!-- Alert Banner -->
                  <tr>
                    <td style="background-color: #fef3c7; padding: 15px 30px; border-bottom: 3px solid #f59e0b;">
                      <p style="margin: 0; color: #92400e; font-size: 14px; text-align: center;">
                        ⚡ <strong>Hành động ngay!</strong> Khách hàng đang chờ đợi xác nhận từ bạn.
                      </p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 30px;">
                      
                      <!-- Greeting -->
                      <p style="margin: 0 0 20px 0; font-size: 16px; color: #333;">
                        Chào bạn,
                      </p>
                      <p style="margin: 0 0 25px 0; font-size: 16px; color: #333;">
                        Bạn vừa nhận được một đơn hàng mới từ khách hàng <strong>${
                          customer.name
                        }</strong>. Vui lòng kiểm tra và xác nhận đơn hàng sớm nhất có thể.
                      </p>

                      <!-- Order Info Card -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="background-color: #f9fafb; border-radius: 8px; margin-bottom: 25px; border: 1px solid #e5e7eb;">
                        <tr>
                          <td style="padding: 20px;">
                            <table width="100%" cellpadding="0" cellspacing="0">
                              <tr>
                                <td style="padding: 5px 0;">
                                  <strong style="color: #6b7280; font-size: 14px;">Mã đơn hàng:</strong>
                                </td>
                                <td align="right" style="padding: 5px 0;">
                                  <span style="color: #111827; font-size: 14px; font-weight: bold;">${
                                    order.orderNumber
                                  }</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 5px 0;">
                                  <strong style="color: #6b7280; font-size: 14px;">Thời gian đặt:</strong>
                                </td>
                                <td align="right" style="padding: 5px 0;">
                                  <span style="color: #111827; font-size: 14px;">${formatDate(
                                    order.createdAt
                                  )}</span>
                                </td>
                              </tr>
                              <tr>
                                <td style="padding: 5px 0;">
                                  <strong style="color: #6b7280; font-size: 14px;">Phương thức thanh toán:</strong>
                                </td>
                                <td align="right" style="padding: 5px 0;">
                                  <span style="color: #111827; font-size: 14px;">${
                                    order.payment.method === "cod"
                                      ? "Thanh toán khi nhận hàng (COD)"
                                      : "Chuyển khoản ngân hàng"
                                  }</span>
                                </td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Products Table -->
                      <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #111827; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">
                        📦 Chi tiết sản phẩm
                      </h2>
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 20px; border: 1px solid #e5e7eb; border-radius: 8px; overflow: hidden;">
                        <thead>
                          <tr style="background-color: #f3f4f6;">
                            <th style="padding: 12px 10px; text-align: left; font-size: 14px; color: #374151; border-bottom: 2px solid #e5e7eb;">Sản phẩm</th>
                            <th style="padding: 12px 10px; text-align: center; font-size: 14px; color: #374151; border-bottom: 2px solid #e5e7eb;">SL</th>
                            <th style="padding: 12px 10px; text-align: right; font-size: 14px; color: #374151; border-bottom: 2px solid #e5e7eb;">Đơn giá</th>
                            <th style="padding: 12px 10px; text-align: right; font-size: 14px; color: #374151; border-bottom: 2px solid #e5e7eb;">Thành tiền</th>
                          </tr>
                        </thead>
                        <tbody>
                          ${itemsHtml}
                        </tbody>
                      </table>

                      <!-- Price Summary -->
                      <table width="100%" cellpadding="0" cellspacing="0" style="margin-bottom: 25px;">
                        <tr>
                          <td align="right" style="padding: 8px 0;">
                            <table cellpadding="0" cellspacing="0" style="width: 300px;">
                              <tr>
                                <td style="padding: 5px 10px; font-size: 14px; color: #6b7280;">Tạm tính:</td>
                                <td align="right" style="padding: 5px 10px; font-size: 14px; color: #111827;">${formatPrice(
                                  order.subtotal
                                )}</td>
                              </tr>
                              <tr>
                                <td style="padding: 5px 10px; font-size: 14px; color: #6b7280;">Phí vận chuyển:</td>
                                <td align="right" style="padding: 5px 10px; font-size: 14px; color: #111827;">${formatPrice(
                                  order.shippingFee
                                )}</td>
                              </tr>
                              ${
                                order.discount > 0
                                  ? `
                              <tr>
                                <td style="padding: 5px 10px; font-size: 14px; color: #059669;">Giảm giá:</td>
                                <td align="right" style="padding: 5px 10px; font-size: 14px; color: #059669;">-${formatPrice(
                                  order.discount
                                )}</td>
                              </tr>
                              `
                                  : ""
                              }
                              <tr style="border-top: 2px solid #4f46e5;">
                                <td style="padding: 10px 10px 5px 10px; font-size: 16px; font-weight: bold; color: #111827;">Tổng cộng:</td>
                                <td align="right" style="padding: 10px 10px 5px 10px; font-size: 18px; font-weight: bold; color: #4f46e5;">${formatPrice(
                                  order.total
                                )}</td>
                              </tr>
                            </table>
                          </td>
                        </tr>
                      </table>

                      <!-- Shipping Address -->
                      <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #111827; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">
                        🚚 Địa chỉ giao hàng
                      </h2>
                      <div style="background-color: #f9fafb; padding: 15px; border-radius: 8px; margin-bottom: 25px; border: 1px solid #e5e7eb;">
                        <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.6;">
                          ${shippingAddressHtml}
                        </p>
                      </div>

                      <!-- Customer Notes -->
                      ${
                        order.customerNotes
                          ? `
                      <h2 style="margin: 0 0 15px 0; font-size: 18px; color: #111827; border-bottom: 2px solid #4f46e5; padding-bottom: 10px;">
                        💬 Ghi chú từ khách hàng
                      </h2>
                      <div style="background-color: #fef3c7; padding: 15px; border-radius: 8px; margin-bottom: 25px; border-left: 4px solid #f59e0b;">
                        <p style="margin: 0; font-size: 14px; color: #92400e; line-height: 1.6;">
                          "${order.customerNotes}"
                        </p>
                      </div>
                      `
                          : ""
                      }

                      <!-- CTA Button -->
                      <div style="text-align: center; margin: 30px 0;">
                        <a href="${orderDetailsLink}" 
                           style="display: inline-block; 
                                  padding: 14px 32px; 
                                  background: linear-gradient(135deg, #4f46e5 0%, #7c3aed 100%); 
                                  color: white; 
                                  text-decoration: none; 
                                  border-radius: 8px; 
                                  font-size: 16px; 
                                  font-weight: bold;
                                  box-shadow: 0 4px 6px rgba(79, 70, 229, 0.3);">
                          📋 Xem chi tiết đơn hàng
                        </a>
                      </div>

                      <!-- Footer Message -->
                      <p style="margin: 25px 0 0 0; font-size: 14px; color: #6b7280; text-align: center; padding-top: 20px; border-top: 1px solid #e5e7eb;">
                        Hãy xác nhận đơn hàng sớm để khách hàng có trải nghiệm tốt nhất! 🚀
                      </p>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 20px; text-align: center; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0 0 10px 0; font-size: 14px; color: #6b7280;">
                        Cần hỗ trợ? Liên hệ với chúng tôi tại <a href="mailto:support@${resendDomain}" style="color: #4f46e5; text-decoration: none;">support@${resendDomain}</a>
                      </p>
                      <p style="margin: 0; font-size: 12px; color: #9ca3af;">
                        © ${new Date().getFullYear()} ${appName}. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
        </html>
      `,
    });

    if (error) {
      console.error(
        `❌ Lỗi Resend API khi gửi thông báo đơn hàng đến ${printerEmail}:`,
        error
      );
      return;
    }

    console.log(
      `✅ Email thông báo đơn hàng #${order.orderNumber} đã gửi đến ${printerEmail}. ID: ${data?.id}`
    );
  } catch (error) {
    console.error(
      `❌ Lỗi nghiêm trọng khi gửi email đơn hàng đến ${printerEmail}:`,
      error
    );
  }
};
