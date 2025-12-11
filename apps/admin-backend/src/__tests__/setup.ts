/**
 * Jest Test Setup
 * Phase 13: Testing & Quality Assurance
 */

import { MongoMemoryServer } from "mongodb-memory-server";
import mongoose from "mongoose";

let mongoServer: MongoMemoryServer;

// Setup before all tests
beforeAll(async () => {
  // Create in-memory MongoDB instance
  // Note: Replica set support for transactions is complex in test environment
  // For now, we use standalone mode. Transaction-dependent tests may need
  // to be run in a proper environment with replica set support.
  mongoServer = await MongoMemoryServer.create();
  const mongoUri = mongoServer.getUri();

  // Connect to in-memory database
  await mongoose.connect(mongoUri);

  console.log("✓ Test database connected");
});

// Cleanup after all tests
afterAll(async () => {
  // Disconnect and stop MongoDB
  await mongoose.disconnect();
  await mongoServer.stop();

  console.log("✓ Test database disconnected");
});

// Clear all collections after each test
afterEach(async () => {
  const collections = mongoose.connection.collections;

  for (const key in collections) {
    const collection = collections[key];
    await collection.deleteMany({});
  }
});

// Global test utilities
global.testUtils = {
  // Create test admin user
  createTestAdmin: () => ({
    _id: "test-admin-id",
    email: "admin@test.com",
    role: "admin",
    organizationId: "test-org-id",
  }),

  // Create test customer user
  createTestCustomer: () => ({
    _id: "test-customer-id",
    email: "customer@test.com",
    role: "customer",
    organizationId: "test-org-id",
  }),

  // Create test organization
  createTestOrganization: () => ({
    _id: "test-org-id",
    name: "Test Organization",
    email: "org@test.com",
    status: "active",
  }),

  // Create test product
  createTestProduct: () => ({
    _id: "test-product-id",
    name: "Test Product",
    category: "apparel",
    basePrice: 100000,
    cost: 50000,
    status: "active",
  }),

  // Create test SKU variant
  createTestVariant: () => ({
    _id: "test-variant-id",
    productId: "test-product-id",
    sku: "TEST-SKU-001",
    attributes: {
      size: "M",
      color: "White",
    },
    price: 100000,
    cost: 50000,
    inventory: {
      onHand: 100,
      reserved: 0,
      available: 100,
    },
  }),

  // Create test swag order
  createTestSwagOrder: () => ({
    _id: "test-order-id",
    orderNumber: "SO-TEST-001",
    organization: "test-org-id",
    totalPrice: 1000000,
    status: "pending",
    recipients: [
      {
        name: "Test Recipient",
        email: "recipient@test.com",
        address: "123 Test St",
      },
    ],
    packSnapshot: {
      items: [
        {
          variantId: "test-variant-id",
          name: "Test Product",
          quantity: 10,
          price: 100000,
          cost: 50000,
        },
      ],
    },
  }),

  // Create test production order
  createTestProductionOrder: () => ({
    _id: "test-po-id",
    swagOrderId: "test-order-id",
    swagOrderNumber: "SO-TEST-001",
    supplierId: "test-supplier-id",
    estimatedCost: 150000,
    actualCost: null,
    status: "pending",
    items: [
      {
        skuVariantId: "test-variant-id",
        quantity: 10,
        unitCost: 15000,
      },
    ],
  }),

  // Wait for async operations
  wait: (ms: number) => new Promise((resolve) => setTimeout(resolve, ms)),
};

// Extend Jest matchers
expect.extend({
  toBeWithinRange(received: number, floor: number, ceiling: number) {
    const pass = received >= floor && received <= ceiling;
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be within range ${floor} - ${ceiling}`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be within range ${floor} - ${ceiling}`,
        pass: false,
      };
    }
  },

  toBeCloseTo(received: number, expected: number, precision: number = 2) {
    const pass = Math.abs(received - expected) < Math.pow(10, -precision);
    if (pass) {
      return {
        message: () =>
          `expected ${received} not to be close to ${expected} (precision: ${precision})`,
        pass: true,
      };
    } else {
      return {
        message: () =>
          `expected ${received} to be close to ${expected} (precision: ${precision})`,
        pass: false,
      };
    }
  },
});

// Declare global types
declare global {
  namespace NodeJS {
    interface Global {
      testUtils: {
        createTestAdmin: () => any;
        createTestCustomer: () => any;
        createTestOrganization: () => any;
        createTestProduct: () => any;
        createTestVariant: () => any;
        createTestSwagOrder: () => any;
        createTestProductionOrder: () => any;
        wait: (ms: number) => Promise<void>;
      };
    }
  }

  namespace jest {
    interface Matchers<R> {
      toBeWithinRange(floor: number, ceiling: number): R;
      toBeCloseTo(expected: number, precision?: number): R;
    }
  }
}
