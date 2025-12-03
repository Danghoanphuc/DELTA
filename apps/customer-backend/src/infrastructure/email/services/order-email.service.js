// Order email service
import { ResendEmailProvider } from "../providers/resend.provider.js";
import { EMAIL_CONFIG } from "../config/email.config.js";
import { createOrderConfirmationTemplate } from "../templates/order-confirmation.template.js";
import { createOrderNotificationTemplate } from "../templates/order-notification.template.js";

export class OrderEmailService {
  constructor() {
    this.provider = new ResendEmailProvider();
  }

  async sendOrderConfirmation(customerEmail, order) {
    const orderLink = `${EMAIL_CONFIG.clientUrl}/orders/${
      order._id || order.masterOrderId
    }`;

    const html = createOrderConfirmationTemplate({
      order,
      orderLink,
    });

    console.log(
      `📧 [ORDER] Sending confirmation to customer: ${customerEmail}`
    );

    return this.provider.send({
      to: customerEmail,
      subject: `[PrintZ] Order Confirmed #${order.orderNumber}`,
      html,
    });
  }

  async sendNewOrderNotification(printerEmail, order) {
    const orderLink = `${EMAIL_CONFIG.clientUrl}/printer/dashboard?tab=orders`;

    const html = createOrderNotificationTemplate({
      order,
      orderLink,
    });

    console.log(
      `📧 [PARTNER] Sending notification to printer: ${printerEmail}`
    );

    return this.provider.send({
      to: printerEmail,
      subject: `[PrintZ Partner] New Assignment #${order.orderNumber}`,
      html,
    });
  }
}
