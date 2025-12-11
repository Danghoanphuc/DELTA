// Delivery check-in email notification service
import { ResendEmailProvider } from "../providers/resend.provider.js";
import { EMAIL_CONFIG } from "../config/email.config.js";
import { createDeliveryCheckinTemplate } from "../templates/delivery-checkin.template.js";
import { Logger } from "../../../shared/utils/index.js";

/**
 * Email notification service for delivery check-ins
 * Implements retry logic with exponential backoff (max 3 retries)
 * Respects customer email opt-out preferences
 */
export class DeliveryCheckinEmailService {
  constructor() {
    this.provider = new ResendEmailProvider();
    this.maxRetries = 3;
    this.baseDelayMs = 1000; // 1 second base delay
  }

  /**
   * Send check-in notification to customer
   * @param {Object} checkin - Check-in data
   * @param {Object} options - Additional options
   * @param {boolean} options.skipOptOutCheck - Skip opt-out check (for testing)
   * @returns {Promise<{success: boolean, data?: any, error?: Error}>}
   */
  async sendCheckinNotification(checkin, options = {}) {
    const { skipOptOutCheck = false } = options;

    Logger.debug(
      `[DeliveryCheckinEmail] Sending notification for check-in ${checkin._id}`
    );

    // Check email opt-out preferences (unless skipped for testing)
    if (!skipOptOutCheck) {
      const shouldSend = await this.checkEmailOptOut(checkin.customerId);
      if (!shouldSend) {
        Logger.info(
          `[DeliveryCheckinEmail] Customer ${checkin.customerId} has opted out of delivery notifications`
        );
        return {
          success: true,
          skipped: true,
          reason: "customer_opted_out",
        };
      }
    }

    // Build email content
    const mapLink = this.buildMapLink(checkin);
    const thumbnailUrl = this.getPrimaryThumbnail(checkin);

    const html = createDeliveryCheckinTemplate({
      shipperName: checkin.shipperName,
      address: checkin.address?.formatted || "Không xác định",
      orderNumber: checkin.orderNumber,
      checkinAt: checkin.checkinAt || checkin.createdAt,
      thumbnailUrl,
      mapLink,
      notes: checkin.notes,
    });

    const emailData = {
      to: checkin.customerEmail,
      subject: `[PrintZ] Đơn hàng #${checkin.orderNumber} đã được giao`,
      html,
    };

    // Send with retry logic
    return await this.sendWithRetry(emailData, checkin._id);
  }

  /**
   * Send email with exponential backoff retry logic
   * @param {Object} emailData - Email data (to, subject, html)
   * @param {string} checkinId - Check-in ID for logging
   * @param {number} attempt - Current attempt number (1-based)
   * @returns {Promise<{success: boolean, data?: any, error?: Error}>}
   */
  async sendWithRetry(emailData, checkinId, attempt = 1) {
    try {
      const result = await this.provider.send(emailData);

      Logger.success(
        `[DeliveryCheckinEmail] Sent notification for check-in ${checkinId} to ${emailData.to}`
      );

      return {
        success: true,
        data: result,
        attempts: attempt,
      };
    } catch (error) {
      Logger.warn(
        `[DeliveryCheckinEmail] Attempt ${attempt}/${this.maxRetries} failed for check-in ${checkinId}: ${error.message}`
      );

      if (attempt >= this.maxRetries) {
        Logger.error(
          `[DeliveryCheckinEmail] All ${this.maxRetries} attempts failed for check-in ${checkinId}`,
          error
        );
        return {
          success: false,
          error,
          attempts: attempt,
        };
      }

      // Calculate delay with exponential backoff: 1s, 2s, 4s
      const delayMs = this.baseDelayMs * Math.pow(2, attempt - 1);

      Logger.debug(
        `[DeliveryCheckinEmail] Retrying in ${delayMs}ms (attempt ${
          attempt + 1
        }/${this.maxRetries})`
      );

      await this.delay(delayMs);

      return this.sendWithRetry(emailData, checkinId, attempt + 1);
    }
  }

  /**
   * Check if customer has opted out of delivery email notifications
   * @param {string} customerId - Customer user ID
   * @returns {Promise<boolean>} - True if email should be sent, false if opted out
   */
  async checkEmailOptOut(customerId) {
    try {
      // Import User model dynamically to avoid circular dependencies
      const { User } = await import("../../../shared/models/user.model.js");

      const user = await User.findById(customerId)
        .select("notificationPreferences")
        .lean();

      if (!user) {
        // User not found, default to sending email
        Logger.warn(
          `[DeliveryCheckinEmail] User ${customerId} not found, defaulting to send email`
        );
        return true;
      }

      // Check notification preferences
      // If notificationPreferences doesn't exist or deliveryNotifications is not explicitly false, send email
      const prefs = user.notificationPreferences;
      if (!prefs) {
        return true; // No preferences set, default to send
      }

      // Check if delivery notifications are explicitly disabled
      if (prefs.deliveryNotifications === false) {
        return false; // Opted out
      }

      // Check if all email notifications are disabled
      if (prefs.email === false) {
        return false; // All email notifications disabled
      }

      return true; // Default to send
    } catch (error) {
      Logger.error(
        `[DeliveryCheckinEmail] Error checking opt-out for user ${customerId}:`,
        error
      );
      // On error, default to sending email
      return true;
    }
  }

  /**
   * Build map link for the check-in
   * @param {Object} checkin - Check-in data
   * @returns {string} - Map URL
   */
  buildMapLink(checkin) {
    const baseUrl = EMAIL_CONFIG.clientUrl || "https://printz.vn";
    return `${baseUrl}/dashboard/deliveries?checkin=${checkin._id}`;
  }

  /**
   * Get primary photo thumbnail URL from check-in
   * @param {Object} checkin - Check-in data
   * @returns {string|null} - Thumbnail URL or null
   */
  getPrimaryThumbnail(checkin) {
    if (!checkin.photos || checkin.photos.length === 0) {
      return null;
    }

    // Return thumbnail URL of first photo
    const primaryPhoto = checkin.photos[0];
    return primaryPhoto.thumbnailUrl || primaryPhoto.url || null;
  }

  /**
   * Format email template with check-in data
   * @param {Object} checkin - Check-in data
   * @returns {string} - HTML email content
   */
  formatEmailTemplate(checkin) {
    const mapLink = this.buildMapLink(checkin);
    const thumbnailUrl = this.getPrimaryThumbnail(checkin);

    return createDeliveryCheckinTemplate({
      shipperName: checkin.shipperName,
      address: checkin.address?.formatted || "Không xác định",
      orderNumber: checkin.orderNumber,
      checkinAt: checkin.checkinAt || checkin.createdAt,
      thumbnailUrl,
      mapLink,
      notes: checkin.notes,
    });
  }

  /**
   * Delay helper for retry logic
   * @param {number} ms - Milliseconds to delay
   * @returns {Promise<void>}
   */
  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

// Export singleton instance
export const deliveryCheckinEmailService = new DeliveryCheckinEmailService();
