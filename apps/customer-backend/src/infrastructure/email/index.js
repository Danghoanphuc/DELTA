// Email service facade - backward compatibility
import { AuthEmailService } from "./services/auth-email.service.js";
import { OrderEmailService } from "./services/order-email.service.js";
import {
  DeliveryCheckinEmailService,
  deliveryCheckinEmailService,
} from "./services/delivery-checkin-email.service.js";
import {
  ContactEmailService,
  contactEmailService,
} from "./services/contact-email.service.js";

const authEmailService = new AuthEmailService();
const orderEmailService = new OrderEmailService();

// Export individual services for direct use
export {
  AuthEmailService,
  OrderEmailService,
  DeliveryCheckinEmailService,
  deliveryCheckinEmailService,
  ContactEmailService,
  contactEmailService,
};

// Export legacy functions for backward compatibility
export const sendVerificationEmail = (email, token) =>
  authEmailService.sendVerificationEmail(email, token);

export const sendPasswordResetEmail = (email, token) =>
  authEmailService.sendPasswordResetEmail(email, token);

export const sendOrderConfirmationEmail = (customerEmail, order) =>
  orderEmailService.sendOrderConfirmation(customerEmail, order);

export const sendNewOrderNotification = (printerEmail, order, customer) =>
  orderEmailService.sendNewOrderNotification(printerEmail, order);

export const sendContactRequestNotification = (data) =>
  contactEmailService.sendContactRequestNotification(data);
