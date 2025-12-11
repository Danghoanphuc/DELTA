// apps/customer-backend/src/infrastructure/email/services/contact-email.service.js
import { ResendEmailProvider } from "../providers/resend.provider.js";
import { Logger } from "../../../shared/utils/logger.util.js";

export class ContactEmailService {
  constructor() {
    this.emailProvider = new ResendEmailProvider();
  }

  /**
   * Send contact request notification to admin
   */
  async sendContactRequestNotification(data) {
    const { name, phone, email, message, location, createdAt } = data;

    const locationInfo = location
      ? `
        <div style="background-color: #f3f4f6; padding: 16px; border-radius: 8px; margin-top: 16px;">
          <h3 style="margin: 0 0 12px 0; font-size: 14px; font-weight: 600; color: #374151;">
            📍 Thông tin vị trí
          </h3>
          ${
            location.address
              ? `<p style="margin: 4px 0; font-size: 14px; color: #6b7280;"><strong>Địa chỉ:</strong> ${location.address}</p>`
              : ""
          }
          ${
            location.city
              ? `<p style="margin: 4px 0; font-size: 14px; color: #6b7280;"><strong>Thành phố:</strong> ${location.city}</p>`
              : ""
          }
          ${
            location.latitude && location.longitude
              ? `<p style="margin: 4px 0; font-size: 14px; color: #6b7280;"><strong>Tọa độ:</strong> ${location.latitude}, ${location.longitude}</p>`
              : ""
          }
          ${
            location.ip
              ? `<p style="margin: 4px 0; font-size: 14px; color: #6b7280;"><strong>IP:</strong> ${location.ip}</p>`
              : ""
          }
        </div>
      `
      : "";

    const htmlContent = `
      <!DOCTYPE html>
      <html>
        <head>
          <meta charset="utf-8">
          <meta name="viewport" content="width=device-width, initial-scale=1.0">
          <title>Yêu cầu báo giá mới</title>
        </head>
        <body style="margin: 0; padding: 0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, 'Helvetica Neue', Arial, sans-serif; background-color: #f9fafb;">
          <table role="presentation" style="width: 100%; border-collapse: collapse;">
            <tr>
              <td style="padding: 40px 20px;">
                <table role="presentation" style="max-width: 600px; margin: 0 auto; background-color: #ffffff; border-radius: 12px; box-shadow: 0 4px 6px rgba(0, 0, 0, 0.1);">
                  
                  <!-- Header -->
                  <tr>
                    <td style="background: linear-gradient(135deg, #10b981 0%, #059669 100%); padding: 32px; text-align: center; border-radius: 12px 12px 0 0;">
                      <h1 style="margin: 0; font-size: 28px; font-weight: 700; color: #ffffff;">
                        🎯 Yêu cầu báo giá mới
                      </h1>
                      <p style="margin: 8px 0 0 0; font-size: 14px; color: #d1fae5;">
                        Từ form liên hệ website
                      </p>
                    </td>
                  </tr>

                  <!-- Content -->
                  <tr>
                    <td style="padding: 32px;">
                      
                      <!-- Customer Info -->
                      <div style="background-color: #f9fafb; padding: 20px; border-radius: 8px; margin-bottom: 24px;">
                        <h2 style="margin: 0 0 16px 0; font-size: 18px; font-weight: 600; color: #111827;">
                          👤 Thông tin khách hàng
                        </h2>
                        <table style="width: 100%; border-collapse: collapse;">
                          <tr>
                            <td style="padding: 8px 0; font-size: 14px; color: #6b7280; width: 120px;">
                              <strong>Họ tên:</strong>
                            </td>
                            <td style="padding: 8px 0; font-size: 14px; color: #111827;">
                              ${name}
                            </td>
                          </tr>
                          <tr>
                            <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">
                              <strong>Số điện thoại:</strong>
                            </td>
                            <td style="padding: 8px 0; font-size: 14px; color: #111827;">
                              <a href="tel:${phone}" style="color: #10b981; text-decoration: none; font-weight: 600;">
                                ${phone}
                              </a>
                            </td>
                          </tr>
                          ${
                            email
                              ? `
                          <tr>
                            <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">
                              <strong>Email:</strong>
                            </td>
                            <td style="padding: 8px 0; font-size: 14px; color: #111827;">
                              <a href="mailto:${email}" style="color: #10b981; text-decoration: none;">
                                ${email}
                              </a>
                            </td>
                          </tr>
                          `
                              : ""
                          }
                          <tr>
                            <td style="padding: 8px 0; font-size: 14px; color: #6b7280;">
                              <strong>Thời gian:</strong>
                            </td>
                            <td style="padding: 8px 0; font-size: 14px; color: #111827;">
                              ${new Date(createdAt).toLocaleString("vi-VN")}
                            </td>
                          </tr>
                        </table>
                      </div>

                      <!-- Message -->
                      <div style="margin-bottom: 24px;">
                        <h3 style="margin: 0 0 12px 0; font-size: 16px; font-weight: 600; color: #111827;">
                          💬 Nội dung yêu cầu
                        </h3>
                        <div style="background-color: #f9fafb; padding: 16px; border-left: 4px solid #10b981; border-radius: 4px;">
                          <p style="margin: 0; font-size: 14px; color: #374151; line-height: 1.6; white-space: pre-wrap;">
${message}
                          </p>
                        </div>
                      </div>

                      ${locationInfo}

                      <!-- CTA -->
                      <div style="text-align: center; margin-top: 32px; padding-top: 24px; border-top: 1px solid #e5e7eb;">
                        <a href="tel:${phone}" style="display: inline-block; background-color: #10b981; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 0 8px 8px 0;">
                          📞 Gọi ngay
                        </a>
                        ${
                          email
                            ? `
                        <a href="mailto:${email}" style="display: inline-block; background-color: #6366f1; color: #ffffff; text-decoration: none; padding: 14px 32px; border-radius: 8px; font-weight: 600; font-size: 14px; margin: 0 0 8px 0;">
                          ✉️ Gửi email
                        </a>
                        `
                            : ""
                        }
                      </div>

                    </td>
                  </tr>

                  <!-- Footer -->
                  <tr>
                    <td style="background-color: #f9fafb; padding: 24px; text-align: center; border-radius: 0 0 12px 12px; border-top: 1px solid #e5e7eb;">
                      <p style="margin: 0; font-size: 12px; color: #6b7280;">
                        Email tự động từ hệ thống Printz B2B
                      </p>
                      <p style="margin: 8px 0 0 0; font-size: 12px; color: #9ca3af;">
                        © ${new Date().getFullYear()} Printz. All rights reserved.
                      </p>
                    </td>
                  </tr>

                </table>
              </td>
            </tr>
          </table>
        </body>
      </html>
    `;

    try {
      // ✅ In development, only send to verified email (Resend free tier limitation)
      // In production, send to both emails after domain verification
      const isDevelopment = process.env.NODE_ENV !== "production";
      const recipients = isDevelopment
        ? ["phucdh911@gmail.com"] // Only verified email in dev
        : ["b2b@printz.vn", "phucdh911@gmail.com"]; // Both emails in production

      await this.emailProvider.send({
        to: recipients,
        subject: `🎯 Yêu cầu báo giá mới từ ${name}`,
        html: htmlContent,
      });

      Logger.success(
        `[ContactEmailSvc] Sent notification for ${name} (${phone})`
      );
    } catch (error) {
      Logger.error(`[ContactEmailSvc] Failed to send notification:`, error);
      throw error;
    }
  }
}

export const contactEmailService = new ContactEmailService();
