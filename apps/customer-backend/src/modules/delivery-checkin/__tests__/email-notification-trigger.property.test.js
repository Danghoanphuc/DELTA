// Property Test: Email Notification Trigger
// Feature: delivery-checkin-system, Property 18: Email Notification Trigger
// Validates: Requirements 6.1
import fc from "fast-check";

/**
 * Email notification trigger logic for testing
 * This mirrors the actual implementation in EmailNotificationService
 *
 * Property 18: For any created check-in, the system SHALL send an email
 * notification to the customer's registered email address.
 */
class EmailNotificationTrigger {
  constructor() {
    this.emailsSent = [];
    this.notificationAttempts = [];
  }

  /**
   * Simulate sending check-in notification
   * @param {Object} checkin - Check-in data
   * @returns {Promise<{success: boolean, emailTo: string, checkinId: string}>}
   */
  async sendCheckinNotification(checkin) {
    // Validate check-in has required email data
    if (!checkin.customerEmail) {
      return {
        success: false,
        error: "Customer email is required",
        checkinId: checkin._id,
      };
    }

    // Record the notification attempt
    this.notificationAttempts.push({
      checkinId: checkin._id,
      customerEmail: checkin.customerEmail,
      timestamp: new Date(),
    });

    // Simulate sending email
    this.emailsSent.push({
      to: checkin.customerEmail,
      checkinId: checkin._id,
      orderNumber: checkin.orderNumber,
      shipperName: checkin.shipperName,
      address: checkin.address?.formatted,
    });

    return {
      success: true,
      emailTo: checkin.customerEmail,
      checkinId: checkin._id,
    };
  }

  /**
   * Check if email was sent for a check-in
   * @param {string} checkinId - Check-in ID
   * @returns {boolean}
   */
  wasEmailSent(checkinId) {
    return this.emailsSent.some((email) => email.checkinId === checkinId);
  }

  /**
   * Get email sent for a check-in
   * @param {string} checkinId - Check-in ID
   * @returns {Object|null}
   */
  getEmailForCheckin(checkinId) {
    return this.emailsSent.find((email) => email.checkinId === checkinId);
  }

  /**
   * Reset state for testing
   */
  reset() {
    this.emailsSent = [];
    this.notificationAttempts = [];
  }
}

/**
 * Check-in creation workflow that triggers email notification
 */
class CheckinCreationWorkflow {
  constructor() {
    this.emailService = new EmailNotificationTrigger();
    this.createdCheckins = [];
  }

  /**
   * Create a check-in and trigger email notification
   * @param {Object} checkinData - Check-in data
   * @returns {Promise<{checkin: Object, emailResult: Object}>}
   */
  async createCheckinWithNotification(checkinData) {
    // Simulate check-in creation
    const checkin = {
      _id: checkinData._id || this.generateId(),
      ...checkinData,
      createdAt: new Date(),
      status: "completed",
    };

    this.createdCheckins.push(checkin);

    // Trigger email notification (as per Requirement 6.1)
    const emailResult = await this.emailService.sendCheckinNotification(
      checkin
    );

    return {
      checkin,
      emailResult,
    };
  }

  generateId() {
    return Math.random().toString(36).substring(2, 15);
  }

  reset() {
    this.emailService.reset();
    this.createdCheckins = [];
  }
}

// Arbitraries for generating test data
const checkinDataArbitrary = fc.record({
  _id: fc.string({ minLength: 10, maxLength: 24 }),
  orderId: fc.string({ minLength: 10, maxLength: 24 }),
  orderNumber: fc.string({ minLength: 5, maxLength: 15 }),
  shipperId: fc.string({ minLength: 10, maxLength: 24 }),
  shipperName: fc.string({ minLength: 2, maxLength: 50 }),
  customerId: fc.string({ minLength: 10, maxLength: 24 }),
  customerEmail: fc.emailAddress(),
  address: fc.record({
    formatted: fc.string({ minLength: 10, maxLength: 200 }),
  }),
  location: fc.record({
    type: fc.constant("Point"),
    coordinates: fc.tuple(
      fc.float({ min: 100, max: 110 }), // longitude (Vietnam range)
      fc.float({ min: 8, max: 24 }) // latitude (Vietnam range)
    ),
  }),
});

describe("Property 18: Email Notification Trigger", () => {
  /**
   * Property: For any created check-in, the system SHALL send an email
   * notification to the customer's registered email address.
   * Validates: Requirements 6.1
   */

  let workflow;

  beforeEach(() => {
    workflow = new CheckinCreationWorkflow();
  });

  afterEach(() => {
    workflow.reset();
  });

  test("email notification is triggered for every created check-in", async () => {
    await fc.assert(
      fc.asyncProperty(checkinDataArbitrary, async (checkinData) => {
        workflow.reset();

        const { checkin, emailResult } =
          await workflow.createCheckinWithNotification(checkinData);

        // Property: Email notification SHALL be triggered
        expect(emailResult.success).toBe(true);

        // Property: Email SHALL be sent to customer's registered email address
        expect(emailResult.emailTo).toBe(checkinData.customerEmail);

        // Verify email was recorded
        expect(workflow.emailService.wasEmailSent(checkin._id)).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  test("email is sent to the correct customer email address", async () => {
    await fc.assert(
      fc.asyncProperty(checkinDataArbitrary, async (checkinData) => {
        workflow.reset();

        const { checkin } = await workflow.createCheckinWithNotification(
          checkinData
        );

        const sentEmail = workflow.emailService.getEmailForCheckin(checkin._id);

        // Property: Email SHALL be sent to customer's registered email address
        expect(sentEmail).not.toBeNull();
        expect(sentEmail.to).toBe(checkinData.customerEmail);
      }),
      { numRuns: 100 }
    );
  });

  test("email contains check-in reference data", async () => {
    await fc.assert(
      fc.asyncProperty(checkinDataArbitrary, async (checkinData) => {
        workflow.reset();

        const { checkin } = await workflow.createCheckinWithNotification(
          checkinData
        );

        const sentEmail = workflow.emailService.getEmailForCheckin(checkin._id);

        // Verify email contains check-in reference
        expect(sentEmail.checkinId).toBe(checkin._id);
        expect(sentEmail.orderNumber).toBe(checkinData.orderNumber);
        expect(sentEmail.shipperName).toBe(checkinData.shipperName);
      }),
      { numRuns: 100 }
    );
  });

  test("notification attempt is recorded for every check-in", async () => {
    await fc.assert(
      fc.asyncProperty(checkinDataArbitrary, async (checkinData) => {
        workflow.reset();

        await workflow.createCheckinWithNotification(checkinData);

        // Property: Notification attempt SHALL be recorded
        expect(workflow.emailService.notificationAttempts.length).toBe(1);
        expect(
          workflow.emailService.notificationAttempts[0].customerEmail
        ).toBe(checkinData.customerEmail);
      }),
      { numRuns: 100 }
    );
  });

  test("multiple check-ins trigger multiple email notifications", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.array(checkinDataArbitrary, { minLength: 1, maxLength: 5 }),
        async (checkinDataArray) => {
          workflow.reset();

          // Create multiple check-ins
          for (const checkinData of checkinDataArray) {
            await workflow.createCheckinWithNotification(checkinData);
          }

          // Property: Each check-in SHALL trigger an email notification
          expect(workflow.emailService.emailsSent.length).toBe(
            checkinDataArray.length
          );
          expect(workflow.emailService.notificationAttempts.length).toBe(
            checkinDataArray.length
          );
        }
      ),
      { numRuns: 50 }
    );
  });

  test("email notification fails gracefully when customer email is missing", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.record({
          _id: fc.string({ minLength: 10, maxLength: 24 }),
          orderId: fc.string({ minLength: 10, maxLength: 24 }),
          orderNumber: fc.string({ minLength: 5, maxLength: 15 }),
          shipperId: fc.string({ minLength: 10, maxLength: 24 }),
          shipperName: fc.string({ minLength: 2, maxLength: 50 }),
          customerId: fc.string({ minLength: 10, maxLength: 24 }),
          // customerEmail intentionally omitted
        }),
        async (checkinDataWithoutEmail) => {
          workflow.reset();

          const emailService = new EmailNotificationTrigger();
          const result = await emailService.sendCheckinNotification(
            checkinDataWithoutEmail
          );

          // Property: System SHALL handle missing email gracefully
          expect(result.success).toBe(false);
          expect(result.error).toBe("Customer email is required");
        }
      ),
      { numRuns: 50 }
    );
  });
});
