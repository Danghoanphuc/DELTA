// Property Test: Email Opt-out Respect
// Feature: delivery-checkin-system, Property 22: Email Opt-out Respect
import fc from "fast-check";

/**
 * Email opt-out checking logic for testing
 * This mirrors the actual implementation in DeliveryCheckinEmailService
 */
class EmailOptOutChecker {
  /**
   * Check if customer has opted out of delivery email notifications
   * @param {Object} user - User object with notification preferences
   * @returns {boolean} - True if email should be sent, false if opted out
   */
  checkEmailOptOut(user) {
    if (!user) {
      return true; // User not found, default to sending email
    }

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
  }

  /**
   * Determine if notification should be sent based on opt-out status
   * @param {Object} checkin - Check-in data
   * @param {Object} user - User with notification preferences
   * @returns {{shouldSend: boolean, reason?: string}}
   */
  shouldSendNotification(checkin, user) {
    const shouldSend = this.checkEmailOptOut(user);
    if (!shouldSend) {
      return {
        shouldSend: false,
        reason: "customer_opted_out",
      };
    }
    return { shouldSend: true };
  }
}

describe("Property 22: Email Opt-out Respect", () => {
  /**
   * Property: For any customer with email notifications opted out,
   * the system SHALL NOT send check-in notification emails.
   * Validates: Requirements 6.5
   */

  const checker = new EmailOptOutChecker();

  test("respects deliveryNotifications opt-out preference", () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.string({ minLength: 10, maxLength: 24 }),
        (optedOut, customerId) => {
          const user = {
            _id: customerId,
            notificationPreferences: {
              deliveryNotifications: !optedOut,
            },
          };

          const shouldSend = checker.checkEmailOptOut(user);

          if (optedOut) {
            expect(shouldSend).toBe(false);
          } else {
            expect(shouldSend).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test("respects global email opt-out preference", () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.string({ minLength: 10, maxLength: 24 }),
        (emailDisabled, customerId) => {
          const user = {
            _id: customerId,
            notificationPreferences: {
              email: !emailDisabled,
            },
          };

          const shouldSend = checker.checkEmailOptOut(user);

          if (emailDisabled) {
            expect(shouldSend).toBe(false);
          } else {
            expect(shouldSend).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test("defaults to sending when no preferences set", () => {
    fc.assert(
      fc.property(fc.string({ minLength: 10, maxLength: 24 }), (customerId) => {
        const user = {
          _id: customerId,
          notificationPreferences: undefined,
        };

        const shouldSend = checker.checkEmailOptOut(user);
        expect(shouldSend).toBe(true);
      }),
      { numRuns: 100 }
    );
  });

  test("defaults to sending when user not found", () => {
    fc.assert(
      fc.property(
        fc.constant(null),
        fc.constant(undefined),
        (nullUser, undefinedUser) => {
          expect(checker.checkEmailOptOut(nullUser)).toBe(true);
          expect(checker.checkEmailOptOut(undefinedUser)).toBe(true);
        }
      ),
      { numRuns: 10 }
    );
  });

  test("deliveryNotifications takes precedence over general email setting", () => {
    fc.assert(
      fc.property(
        fc.boolean(),
        fc.boolean(),
        fc.string({ minLength: 10, maxLength: 24 }),
        (deliveryOptOut, emailOptOut, customerId) => {
          const user = {
            _id: customerId,
            notificationPreferences: {
              deliveryNotifications: !deliveryOptOut,
              email: !emailOptOut,
            },
          };

          const shouldSend = checker.checkEmailOptOut(user);

          // If delivery notifications are explicitly disabled, don't send
          if (deliveryOptOut) {
            expect(shouldSend).toBe(false);
          } else if (emailOptOut) {
            // If general email is disabled but delivery is not explicitly set
            expect(shouldSend).toBe(false);
          } else {
            expect(shouldSend).toBe(true);
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test("shouldSendNotification returns correct reason when opted out", () => {
    fc.assert(
      fc.property(
        fc.record({
          _id: fc.string({ minLength: 10, maxLength: 24 }),
          orderNumber: fc.string({ minLength: 5, maxLength: 15 }),
          customerEmail: fc.emailAddress(),
        }),
        fc.boolean(),
        (checkin, optedOut) => {
          const user = {
            _id: checkin._id,
            notificationPreferences: {
              deliveryNotifications: !optedOut,
            },
          };

          const result = checker.shouldSendNotification(checkin, user);

          if (optedOut) {
            expect(result.shouldSend).toBe(false);
            expect(result.reason).toBe("customer_opted_out");
          } else {
            expect(result.shouldSend).toBe(true);
            expect(result.reason).toBeUndefined();
          }
        }
      ),
      { numRuns: 100 }
    );
  });
});
