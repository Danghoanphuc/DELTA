// Order confirmation template (Customer)
import { EMAIL_STYLES } from "../styles/email.styles.js";
import { createBaseTemplate } from "./base.template.js";
import { formatPrice, formatDate } from "../utils/formatters.js";

export const createOrderConfirmationTemplate = ({ order, orderLink }) => {
  const items = (order.printerOrders || []).flatMap((po) => po.items || []);

  const itemsHtml = items
    .map(
      (item) => `
    <tr>
      <td style="${EMAIL_STYLES.td}">
        <div style="font-weight: bold;">${item.productName}</div>
        ${
          item.options?.notes
            ? `<div style="font-size: 11px; color: #737373; margin-top: 4px; font-family: monospace;">// ${item.options.notes}</div>`
            : ""
        }
      </td>
      <td style="${
        EMAIL_STYLES.td
      }; text-align: center; font-family: monospace;">${item.quantity}</td>
      <td style="${
        EMAIL_STYLES.td
      }; text-align: right; font-family: monospace;">${formatPrice(
        item.unitPrice
      )}</td>
      <td style="${
        EMAIL_STYLES.td
      }; text-align: right; font-family: monospace; font-weight: bold;">${formatPrice(
        item.subtotal
      )}</td>
    </tr>
  `
    )
    .join("");

  const content = `
    <div style="display: flex; justify-content: space-between; border-bottom: 2px solid #171717; padding-bottom: 20px; margin-bottom: 30px;">
      <div>
        <div style="${EMAIL_STYLES.label}">CUSTOMER</div>
        <div style="font-weight: bold;">${
          order.customerName || "Valued Client"
        }</div>
      </div>
      <div style="text-align: right;">
        <div style="${EMAIL_STYLES.label}">REFERENCE</div>
        <div style="font-family: monospace; font-size: 16px; font-weight: bold;">#${
          order.orderNumber
        }</div>
      </div>
    </div>

    <h1 style="${EMAIL_STYLES.heading}">ĐÃ TIẾP NHẬN</h1>
    <p style="${
      EMAIL_STYLES.text
    }">Đơn hàng của bạn đã được khởi tạo thành công trên hệ thống.</p>

    <div style="${
      EMAIL_STYLES.label
    }; margin-top: 32px;">MANIFEST (DANH SÁCH HÀNG HÓA)</div>
    <table style="${EMAIL_STYLES.table}">
      <thead>
        <tr>
          <th style="${EMAIL_STYLES.th}">ITEM</th>
          <th style="${EMAIL_STYLES.th}; text-align: center;">QTY</th>
          <th style="${EMAIL_STYLES.th}; text-align: right;">RATE</th>
          <th style="${EMAIL_STYLES.th}; text-align: right;">AMT</th>
        </tr>
      </thead>
      <tbody>
        ${itemsHtml}
        <tr style="background-color: #f5f5f5;">
          <td colspan="3" style="${
            EMAIL_STYLES.td
          }; text-align: right; font-weight: bold;">TOTAL PAYMENT</td>
          <td style="${
            EMAIL_STYLES.td
          }; text-align: right; font-weight: bold; font-size: 16px; font-family: monospace;">
            ${formatPrice(order.totalAmount || order.totalPrice || 0)}
          </td>
        </tr>
      </tbody>
    </table>

    <div style="${EMAIL_STYLES.box}">
       <div style="${EMAIL_STYLES.label}">LOGISTICS / SHIPPING TO</div>
       <div style="font-family: monospace; font-size: 13px;">
          <strong>${order.shippingAddress?.recipientName}</strong><br>
          ${order.shippingAddress?.phone}<br>
          ${order.shippingAddress?.street}, ${order.shippingAddress?.ward}<br>
          ${order.shippingAddress?.district}, ${order.shippingAddress?.city}
          ${
            order.shippingAddress?.notes
              ? `<br><br>// NOTE: ${order.shippingAddress.notes}`
              : ""
          }
       </div>
    </div>

    <div style="${EMAIL_STYLES.buttonWrapper}; text-align: center;">
      <a href="${orderLink}" style="${
    EMAIL_STYLES.button
  }">TRACKING ORDER STATUS</a>
    </div>
  `;

  const footer = `
    CREATED AT: ${formatDate(order.createdAt)}<br>
    STATUS: PROCESSING_INITIATED<br>
    © ${new Date().getFullYear()} PRINTZ CORPORATE.
  `;

  return createBaseTemplate({
    brand: "PRINTZ // ORDER",
    content,
    footer,
  });
};
