// Delivery check-in notification email template
import { EMAIL_STYLES } from "../styles/email.styles.js";
import { createBaseTemplate } from "./base.template.js";

/**
 * Create delivery check-in notification email template
 * @param {Object} params - Template parameters
 * @param {string} params.shipperName - Name of the shipper
 * @param {string} params.address - Delivery address
 * @param {string} params.orderNumber - Order number
 * @param {Date} params.checkinAt - Check-in timestamp
 * @param {string} params.thumbnailUrl - Photo thumbnail URL (optional)
 * @param {string} params.mapLink - Link to view on map
 * @param {string} params.notes - Delivery notes (optional)
 * @returns {string} HTML email content
 */
export const createDeliveryCheckinTemplate = ({
  shipperName,
  address,
  orderNumber,
  checkinAt,
  thumbnailUrl,
  mapLink,
  notes,
}) => {
  // Format timestamp for Vietnamese locale
  const formattedTime = new Date(checkinAt).toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    timeZone: "Asia/Ho_Chi_Minh",
  });

  // Build photo section if thumbnail is available
  const photoSection = thumbnailUrl
    ? `
      <div style="margin: 24px 0; text-align: center;">
        <img 
          src="${thumbnailUrl}" 
          alt="Ảnh giao hàng" 
          style="max-width: 300px; max-height: 300px; border: 1px solid #e5e5e5; border-radius: 4px;"
        />
      </div>
    `
    : "";

  // Build notes section if notes are available
  const notesSection = notes
    ? `
      <div style="${EMAIL_STYLES.box}">
        <span style="${EMAIL_STYLES.label}">Ghi chú</span>
        <p style="${EMAIL_STYLES.text}; margin: 0;">${notes}</p>
      </div>
    `
    : "";

  const content = `
    <h1 style="${EMAIL_STYLES.heading}">Đơn hàng đã được giao</h1>
    
    <p style="${EMAIL_STYLES.text}">
      Shipper <strong>${shipperName}</strong> đã check-in xác nhận giao hàng cho đơn hàng của bạn.
    </p>

    <div style="${EMAIL_STYLES.box}">
      <table style="width: 100%; border-collapse: collapse;">
        <tr>
          <td style="padding: 8px 0;">
            <span style="${EMAIL_STYLES.label}">Mã đơn hàng</span>
            <span style="${EMAIL_STYLES.highlight}">${orderNumber}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <span style="${EMAIL_STYLES.label}">Thời gian giao</span>
            <span style="font-family: monospace;">${formattedTime}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <span style="${EMAIL_STYLES.label}">Địa điểm</span>
            <span>${address}</span>
          </td>
        </tr>
        <tr>
          <td style="padding: 8px 0;">
            <span style="${EMAIL_STYLES.label}">Shipper</span>
            <span>${shipperName}</span>
          </td>
        </tr>
      </table>
    </div>

    ${photoSection}
    ${notesSection}

    <div style="${EMAIL_STYLES.buttonWrapper}">
      <a href="${mapLink}" style="${EMAIL_STYLES.button}">
        Xem trên bản đồ
      </a>
    </div>

    <p style="${EMAIL_STYLES.text}; color: #737373; font-size: 12px;">
      Nếu bạn có bất kỳ thắc mắc nào về đơn hàng, vui lòng liên hệ với chúng tôi.
    </p>
  `;

  const footer = `
    © ${new Date().getFullYear()} PrintZ. Tất cả quyền được bảo lưu.<br/>
    Email này được gửi tự động, vui lòng không trả lời trực tiếp.
  `;

  return createBaseTemplate({
    brand: "PRINTZ",
    content,
    footer,
  });
};
