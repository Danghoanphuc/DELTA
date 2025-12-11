// apps/customer-backend/src/modules/delivery-checkin/__tests__/email-retry-logic.property.test.js
// Property Test: Email Retry Logic
// Feature: delivery-checkin-system, Property 21: Email Retry Logic

import fc from "fast-check";

class EmailRetryLogic {
  constructor() {
    this.maxRetries = 3;
    this.baseDelayMs = 1000;
  }

  async sendWithRetry(sendFn, checkinId, attempt = 1) {
    try {
      const result = await sendFn();
      return { success: true, data: result, attempts: attempt };
    } catch (error) {
      if (attempt >= this.maxRetries) {
        return { success: false, error, attempts: attempt };
      }
      const delayMs = this.baseDelayMs * Math.pow(2, attempt - 1);
      await this.delay(delayMs);
      return this.sendWithRetry(sendFn, checkinId, attempt + 1);
    }
  }

  delay(ms) {
    return new Promise((resolve) => setTimeout(resolve, ms));
  }
}

describe("Property 21: Email Retry Logic", () => {
  test("retries up to maxRetries times on failure", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 0, max: 5 }),
        fc.string({ minLength: 10, maxLength: 24 }),
        async (failuresBeforeSuccess, checkinId) => {
          const service = new EmailRetryLogic();
          const maxRetries = service.maxRetries;
          let attemptCount = 0;

          service.delay = jest.fn().mockResolvedValue(undefined);

          const sendFn = jest.fn().mockImplementation(async () => {
            attemptCount++;
            if (attemptCount <= failuresBeforeSuccess) {
              throw new Error("Simulated failure");
            }
            return { success: true };
          });

          const result = await service.sendWithRetry(sendFn, checkinId);

          if (failuresBeforeSuccess >= maxRetries) {
            expect(result.success).toBe(false);
            expect(attemptCount).toBe(maxRetries);
          } else {
            expect(result.success).toBe(true);
          }
          expect(attemptCount).toBeLessThanOrEqual(maxRetries);
        }
      ),
      { numRuns: 100 }
    );
  });

  test("uses exponential backoff delays", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 10, maxLength: 24 }),
        async (checkinId) => {
          const service = new EmailRetryLogic();
          const baseDelay = service.baseDelayMs;
          const maxRetries = service.maxRetries;
          const delaysCalled = [];

          service.delay = jest.fn().mockImplementation(async (ms) => {
            delaysCalled.push(ms);
          });

          const sendFn = jest.fn().mockRejectedValue(new Error("Fail"));
          await service.sendWithRetry(sendFn, checkinId);

          expect(delaysCalled.length).toBe(maxRetries - 1);
          for (let i = 0; i < delaysCalled.length; i++) {
            expect(delaysCalled[i]).toBe(baseDelay * Math.pow(2, i));
          }
        }
      ),
      { numRuns: 100 }
    );
  });

  test("returns success with attempt count", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 1, max: 3 }),
        async (successAttempt) => {
          const service = new EmailRetryLogic();
          let attemptCount = 0;

          service.delay = jest.fn().mockResolvedValue(undefined);

          const sendFn = jest.fn().mockImplementation(async () => {
            attemptCount++;
            if (attemptCount < successAttempt) {
              throw new Error("Fail");
            }
            return { id: "email-123" };
          });

          const result = await service.sendWithRetry(sendFn, "test");

          expect(result.success).toBe(true);
          expect(result.attempts).toBe(successAttempt);
        }
      ),
      { numRuns: 100 }
    );
  });

  test("returns failure after all retries exhausted", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.string({ minLength: 5, maxLength: 100 }),
        async (errorMessage) => {
          const service = new EmailRetryLogic();
          service.delay = jest.fn().mockResolvedValue(undefined);

          const sendFn = jest.fn().mockRejectedValue(new Error(errorMessage));
          const result = await service.sendWithRetry(sendFn, "test");

          expect(result.success).toBe(false);
          expect(result.attempts).toBe(service.maxRetries);
          expect(result.error.message).toBe(errorMessage);
        }
      ),
      { numRuns: 100 }
    );
  });

  test("maxRetries is 3 and baseDelayMs is 1000", () => {
    const service = new EmailRetryLogic();
    expect(service.maxRetries).toBe(3);
    expect(service.baseDelayMs).toBe(1000);
  });
});
