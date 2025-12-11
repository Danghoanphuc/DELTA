// apps/customer-backend/src/modules/delivery-checkin/email-notification.service.js
// Email notification service for delivery check-ins
// Implements Requirements 6.1, 6.2, 6.3, 6.4, 6.5

import { deliveryCheckinEmailService } from "../../infrastructure/email/index.js";
import { Logger } from "../../shared/utils/index.js";
import { DeliveryCheckinRepository } from "./delivery-checkin.repository.js";

/**
 * Email notification service for delivery check-in module
 * Handles sending notifications and updating check-in records
 */
export class EmailNotificationService {
  constructor() {
    this.emailService = deliveryCheckinEmailService;
    this.repository = new DeliveryCheckinRepository();
  }

  /**
   * Send check-in notification to customer
   * Updates check-in record with email status
   * Implements retry logic with exponential backoff (max 3 retries)
   * Respects customer email opt-out preferences
   *
   * @param {Object} checkin - Check-in data
   * @param {Object} options - Additional options
   * @returns {Promise<{success: boolean, skipped?: boolean, error?: Error}>}
   *
   * Requirements:
   * - 6.1: Send email notification to customer's registered email address
   * - 6.2: Include timestamp, address, shipper name, and link to view on map
   * - 6.3: Include thumbnail of first delivery photo
   * - 6.4: Retry sending up to 3 times with exponential backoff
   * - 6.5: Respect opt-out settings for delivery notifications
   */
  async sendCheckinNotification(checkin, options = {}) {
    Logger.debug(
      `[EmailNotificationSvc] Processing notification for check-in ${checkin._id}`
    );

    try {
      // Send notification via email service
      const result = await this.emailService.sendCheckinNotification(
        checkin,
        options
      );

      // Update check-in record with email status
      if (result.success && !result.skipped) {
        await this.updateEmailStatus(checkin._id, true);
        Logger.success(
          `[EmailNotificationSvc] Email sent for check-in ${checkin._id}`
        );
      } else if (result.skipped) {
        Logger.info(
          `[EmailNotificationSvc] Email skipped for check-in ${checkin._id}: ${result.reason}`
        );
      }

      return result;
    } catch (error) {
      Logger.error(
        `[EmailNotificationSvc] Failed to send notification for check-in ${checkin._id}:`,
        error
      );

      // Don't throw - email failure shouldn't fail the check-in
      return {
        success: false,
        error,
      };
    }
  }

  /**
   * Update check-in record with email sent status
   * @param {string} checkinId - Check-in ID
   * @param {boolean} sent - Whether email was sent successfully
   * @returns {Promise<void>}
   */
  async updateEmailStatus(checkinId, sent) {
    try {
      if (sent) {
        await this.repository.markEmailSent(checkinId);
      }
    } catch (error) {
      Logger.error(
        `[EmailNotificationSvc] Failed to update email status for check-in ${checkinId}:`,
        error
      );
      // Don't throw - status update failure shouldn't affect the flow
    }
  }

  /**
   * Check if customer has opted out of delivery email notifications
   * @param {string} customerId - Customer user ID
   * @returns {Promise<boolean>} - True if email should be sent, false if opted out
   */
  async checkEmailOptOut(customerId) {
    return this.emailService.checkEmailOptOut(customerId);
  }

  /**
   * Format email template for check-in notification
   * @param {Object} checkin - Check-in data
   * @returns {string} - HTML email content
   */
  formatEmailTemplate(checkin) {
    return this.emailService.formatEmailTemplate(checkin);
  }

  /**
   * Retry sending email notification for a check-in
   * Used for manual retry or background job retry
   * @param {string} checkinId - Check-in ID
   * @returns {Promise<{success: boolean, error?: Error}>}
   */
  async retryNotification(checkinId) {
    Logger.debug(
      `[EmailNotificationSvc] Retrying notification for check-in ${checkinId}`
    );

    try {
      const checkin = await this.repository.findById(checkinId);

      if (!checkin) {
        Logger.warn(
          `[EmailNotificationSvc] Check-in ${checkinId} not found for retry`
        );
        return {
          success: false,
          error: new Error("Check-in not found"),
        };
      }

      if (checkin.emailSent) {
        Logger.info(
          `[EmailNotificationSvc] Email already sent for check-in ${checkinId}`
        );
        return {
          success: true,
          skipped: true,
          reason: "already_sent",
        };
      }

      return await this.sendCheckinNotification(checkin);
    } catch (error) {
      Logger.error(
        `[EmailNotificationSvc] Retry failed for check-in ${checkinId}:`,
        error
      );
      return {
        success: false,
        error,
      };
    }
  }
}

// Export singleton instance
export const emailNotificationService = new EmailNotificationService();
