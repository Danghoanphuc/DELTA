// New order notification template (Printer)
import { EMAIL_STYLES } from "../styles/email.styles.js";
import { createBaseTemplate } from "./base.template.js";
import { formatPrice, formatDate } from "../utils/formatters.js";

export const createOrderNotificationTemplate = ({ order, orderLink }) => {
  const printerOrder = order.items ? order : null;
  const masterOrder = order.printerOrders ? order : null;

  const items =
    printerOrder?.items ||
    masterOrder?.printerOrders?.find(
      (po) =>
        po.printerProfileId?.toString() === order.printerProfileId?.toString()
    )?.items ||
    [];

  const totalPrice =
    printerOrder?.printerTotalPrice ||
    order.printerTotalPrice ||
    order.totalAmount ||
    0;
  const commission = printerOrder?.commissionFee || order.commissionFee || 0;
  const finalPayout =
    printerOrder?.printerPayout ||
    order.printerPayout ||
    totalPrice - commission;

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="${EMAIL_STYLES.td}">
        <div style="font-weight: bold;">${item.productName}</div>
        ${
          item.options?.notes
            ? `<div style="font-size: 11px; color: #737373; font-family: monospace;">// ${item.options.notes}</div>`
            : ""
        }
      </td>
      <td style="${
        EMAIL_STYLES.td
      }; text-align: center; font-family: monospace;">${item.quantity}</td>
      <td style="${
        EMAIL_STYLES.td
      }; text-align: right; font-family: monospace;">${formatPrice(
        item.unitPrice || item.pricePerUnit
      )}</td>
    </tr>
  `
    )
    .join("");

  const content = `
    <div style="${EMAIL_STYLES.box}; border-left: 4px solid #171717;">
      <div style="display: flex; justify-content: space-between; align-items: center;">
        <div>
          <div style="${EMAIL_STYLES.label}">STATUS</div>
          <strong style="font-size: 16px;">PENDING CONFIRMATION</strong>
        </div>
        <div style="text-align: right;">
          <div style="${EMAIL_STYLES.label}">ORDER REF</div>
          <span style="${EMAIL_STYLES.highlight}">#${order.orderNumber}</span>
        </div>
      </div>
    </div>

    <p style="${
      EMAIL_STYLES.text
    }">Hệ thống đã phân phối một đơn hàng mới. Yêu cầu xác nhận khả năng thực hiện trong vòng 2 giờ.</p>

    <div style="${
      EMAIL_STYLES.label
    }; margin-top: 24px;">FINANCIAL BREAKDOWN</div>
    <div style="border: 1px solid #e5e5e5; margin-bottom: 24px;">
      <div style="display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid #f5f5f5;">
        <span style="font-size: 13px;">Tổng giá trị đơn (Printer Price)</span>
        <span style="font-family: monospace;">${formatPrice(totalPrice)}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 12px; border-bottom: 1px solid #f5f5f5; color: #737373;">
        <span style="font-size: 13px;">Phí nền tảng (Commission)</span>
        <span style="font-family: monospace;">- ${formatPrice(
          commission
        )}</span>
      </div>
      <div style="display: flex; justify-content: space-between; padding: 12px; background-color: #f5f5f5; font-weight: bold;">
        <span style="font-size: 13px; text-transform: uppercase;">Thực nhận (Net Payout)</span>
        <span style="font-family: monospace; font-size: 16px;">${formatPrice(
          finalPayout
        )}</span>
      </div>
    </div>

    <div style="${EMAIL_STYLES.label}">WORK ORDER / CHI TIẾT SẢN PHẨM</div>
    <table style="${EMAIL_STYLES.table}">
      <thead>
        <tr>
          <th style="${EMAIL_STYLES.th}">ITEM</th>
          <th style="${EMAIL_STYLES.th}; text-align: center;">QTY</th>
          <th style="${EMAIL_STYLES.th}; text-align: right;">UNIT PRICE</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
      </tbody>
    </table>

    ${
      order.customerNotes
        ? `
      <div style="${EMAIL_STYLES.alert}; background-color: #fffbeb; border-color: #fbbf24; color: #92400e;">
         <span style="${EMAIL_STYLES.label}; color: #92400e;">CLIENT NOTE</span>
         <p style="margin: 5px 0 0 0; font-family: monospace;">"${order.customerNotes}"</p>
      </div>
    `
        : ""
    }

    <div style="${EMAIL_STYLES.buttonWrapper}">
      <a href="${orderLink}" style="${
    EMAIL_STYLES.button
  }">ACCESS WORKSPACE & PROCESS →</a>
    </div>
  `;

  const footer = `
    TIMESTAMP: ${formatDate(order.createdAt)}<br>
    PAYMENT STATUS: ${
      order.paymentStatus ? order.paymentStatus.toUpperCase() : "PENDING"
    }<br>
    © ${new Date().getFullYear()} PRINTZ CORPORATE.
  `;

  return createBaseTemplate({
    brand: "PRINTZ // PARTNER",
    content,
    footer,
  });
};
