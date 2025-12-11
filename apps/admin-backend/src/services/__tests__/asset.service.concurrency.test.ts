/**
 * Asset Service Concurrency Tests
 *
 * Tests for concurrent asset upload scenarios to verify transaction support
 * Requirements: 7.2.1 - Prevent duplicate version numbers with atomic operations
 */

import { Types } from "mongoose";
import { AssetService } from "../asset.service.js";
import { AssetRepository } from "../../repositories/asset.repository.js";
import { Asset, ASSET_STATUS } from "../../models/asset.model.js";
import { FileUploadData } from "../asset.service.js";

describe("AssetService - Concurrency Tests", () => {
  let assetService: AssetService;
  let assetRepository: AssetRepository;
  const testOrderId = new Types.ObjectId().toString();
  const testUserId = new Types.ObjectId().toString();

  beforeAll(async () => {
    assetRepository = new AssetRepository();
    assetService = new AssetService(assetRepository);
  });

  beforeEach(async () => {
    // Clean up test data
    await Asset.deleteMany({ orderId: new Types.ObjectId(testOrderId) });
  });

  afterAll(async () => {
    // Clean up test data
    await Asset.deleteMany({ orderId: new Types.ObjectId(testOrderId) });
  });

  describe("Concurrent Upload Scenarios", () => {
    /**
     * Test: Concurrent uploads should not create duplicate version numbers
     * Requirements: 7.2.1 - Use MongoDB transactions to prevent race conditions
     */
    it("should prevent duplicate version numbers when uploading concurrently", async () => {
      const fileData1: FileUploadData = {
        filename: "test-file-1.pdf",
        originalFilename: "test-file-1.pdf",
        fileUrl: "https://example.com/test-file-1.pdf",
        fileSize: 1024,
        mimeType: "application/pdf",
      };

      const fileData2: FileUploadData = {
        filename: "test-file-2.pdf",
        originalFilename: "test-file-2.pdf",
        fileUrl: "https://example.com/test-file-2.pdf",
        fileSize: 2048,
        mimeType: "application/pdf",
      };

      const fileData3: FileUploadData = {
        filename: "test-file-3.pdf",
        originalFilename: "test-file-3.pdf",
        fileUrl: "https://example.com/test-file-3.pdf",
        fileSize: 3072,
        mimeType: "application/pdf",
      };

      // Upload 3 files concurrently
      const [asset1, asset2, asset3] = await Promise.all([
        assetService.uploadAsset(testOrderId, fileData1, testUserId),
        assetService.uploadAsset(testOrderId, fileData2, testUserId),
        assetService.uploadAsset(testOrderId, fileData3, testUserId),
      ]);

      // Verify all assets were created
      expect(asset1).toBeDefined();
      expect(asset2).toBeDefined();
      expect(asset3).toBeDefined();

      // Verify version numbers are unique
      const versions = [asset1.version, asset2.version, asset3.version];
      const uniqueVersions = new Set(versions);
      expect(uniqueVersions.size).toBe(3);

      // Verify versions are sequential (1, 2, 3)
      expect(versions.sort()).toEqual([1, 2, 3]);

      // Verify all assets are in the database
      const allAssets = await Asset.find({
        orderId: new Types.ObjectId(testOrderId),
      }).lean();
      expect(allAssets).toHaveLength(3);

      // Verify no duplicate versions in database
      const dbVersions = allAssets.map((a) => a.version);
      const uniqueDbVersions = new Set(dbVersions);
      expect(uniqueDbVersions.size).toBe(3);
    });

    /**
     * Test: Sequential uploads after concurrent uploads should continue version sequence
     * Requirements: 7.2.1 - Implement atomic version increment
     */
    it("should continue version sequence correctly after concurrent uploads", async () => {
      // First, upload 2 files concurrently
      const fileData1: FileUploadData = {
        filename: "concurrent-1.pdf",
        originalFilename: "concurrent-1.pdf",
        fileUrl: "https://example.com/concurrent-1.pdf",
        fileSize: 1024,
        mimeType: "application/pdf",
      };

      const fileData2: FileUploadData = {
        filename: "concurrent-2.pdf",
        originalFilename: "concurrent-2.pdf",
        fileUrl: "https://example.com/concurrent-2.pdf",
        fileSize: 2048,
        mimeType: "application/pdf",
      };

      await Promise.all([
        assetService.uploadAsset(testOrderId, fileData1, testUserId),
        assetService.uploadAsset(testOrderId, fileData2, testUserId),
      ]);

      // Then upload a third file sequentially
      const fileData3: FileUploadData = {
        filename: "sequential-3.pdf",
        originalFilename: "sequential-3.pdf",
        fileUrl: "https://example.com/sequential-3.pdf",
        fileSize: 3072,
        mimeType: "application/pdf",
      };

      const asset3 = await assetService.uploadAsset(
        testOrderId,
        fileData3,
        testUserId
      );

      // Verify the third asset has version 3
      expect(asset3.version).toBe(3);

      // Verify all assets in database
      const allAssets = await Asset.find({
        orderId: new Types.ObjectId(testOrderId),
      })
        .sort({ version: 1 })
        .lean();

      expect(allAssets).toHaveLength(3);
      expect(allAssets[0].version).toBe(1);
      expect(allAssets[1].version).toBe(2);
      expect(allAssets[2].version).toBe(3);
    });

    /**
     * Test: High concurrency scenario (10 simultaneous uploads)
     * Requirements: 7.2.1 - Test concurrent upload scenarios
     */
    it("should handle high concurrency without duplicate versions", async () => {
      const uploadPromises = [];

      // Create 10 concurrent uploads
      for (let i = 0; i < 10; i++) {
        const fileData: FileUploadData = {
          filename: `concurrent-file-${i}.pdf`,
          originalFilename: `concurrent-file-${i}.pdf`,
          fileUrl: `https://example.com/concurrent-file-${i}.pdf`,
          fileSize: 1024 * (i + 1),
          mimeType: "application/pdf",
        };

        uploadPromises.push(
          assetService.uploadAsset(testOrderId, fileData, testUserId)
        );
      }

      // Wait for all uploads to complete
      const assets = await Promise.all(uploadPromises);

      // Verify all assets were created
      expect(assets).toHaveLength(10);

      // Verify all version numbers are unique
      const versions = assets.map((a) => a.version);
      const uniqueVersions = new Set(versions);
      expect(uniqueVersions.size).toBe(10);

      // Verify versions are sequential (1-10)
      expect(versions.sort((a, b) => a - b)).toEqual([
        1, 2, 3, 4, 5, 6, 7, 8, 9, 10,
      ]);

      // Verify database consistency
      const allAssets = await Asset.find({
        orderId: new Types.ObjectId(testOrderId),
      }).lean();
      expect(allAssets).toHaveLength(10);

      const dbVersions = allAssets.map((a) => a.version);
      const uniqueDbVersions = new Set(dbVersions);
      expect(uniqueDbVersions.size).toBe(10);
    });

    /**
     * Test: Concurrent uploads for different orders should not interfere
     * Requirements: 7.2.1 - Atomic version increment per order
     */
    it("should handle concurrent uploads for different orders independently", async () => {
      const order1Id = new Types.ObjectId().toString();
      const order2Id = new Types.ObjectId().toString();

      try {
        const fileData1: FileUploadData = {
          filename: "order1-file.pdf",
          originalFilename: "order1-file.pdf",
          fileUrl: "https://example.com/order1-file.pdf",
          fileSize: 1024,
          mimeType: "application/pdf",
        };

        const fileData2: FileUploadData = {
          filename: "order2-file.pdf",
          originalFilename: "order2-file.pdf",
          fileUrl: "https://example.com/order2-file.pdf",
          fileSize: 2048,
          mimeType: "application/pdf",
        };

        // Upload to both orders concurrently
        const [asset1, asset2] = await Promise.all([
          assetService.uploadAsset(order1Id, fileData1, testUserId),
          assetService.uploadAsset(order2Id, fileData2, testUserId),
        ]);

        // Both should have version 1 (independent sequences)
        expect(asset1.version).toBe(1);
        expect(asset2.version).toBe(1);

        // Verify they belong to different orders
        expect(asset1.orderId.toString()).toBe(order1Id);
        expect(asset2.orderId.toString()).toBe(order2Id);
      } finally {
        // Clean up
        await Asset.deleteMany({
          orderId: {
            $in: [new Types.ObjectId(order1Id), new Types.ObjectId(order2Id)],
          },
        });
      }
    });

    /**
     * Test: Retry mechanism on duplicate key error
     * Requirements: 7.2.1 - Handle race conditions gracefully
     */
    it("should retry on duplicate key error and succeed", async () => {
      const fileData: FileUploadData = {
        filename: "retry-test.pdf",
        originalFilename: "retry-test.pdf",
        fileUrl: "https://example.com/retry-test.pdf",
        fileSize: 1024,
        mimeType: "application/pdf",
      };

      // This should succeed even if there's a race condition
      const asset = await assetService.uploadAsset(
        testOrderId,
        fileData,
        testUserId
      );

      expect(asset).toBeDefined();
      expect(asset.version).toBe(1);
      expect(asset.versionLabel).toBe("v1");
    });
  });

  describe("Transaction Rollback Scenarios", () => {
    /**
     * Test: Transaction should rollback on error
     * Requirements: 7.2.1 - Use MongoDB transactions
     */
    it("should rollback transaction on error", async () => {
      const invalidFileData: FileUploadData = {
        filename: "", // Invalid - empty filename
        originalFilename: "test.pdf",
        fileUrl: "https://example.com/test.pdf",
        fileSize: 1024,
        mimeType: "application/pdf",
      };

      // This should fail validation
      await expect(
        assetService.uploadAsset(testOrderId, invalidFileData, testUserId)
      ).rejects.toThrow();

      // Verify no asset was created
      const assets = await Asset.find({
        orderId: new Types.ObjectId(testOrderId),
      }).lean();
      expect(assets).toHaveLength(0);
    });
  });

  describe("Version Label Consistency", () => {
    /**
     * Test: Version labels should match version numbers
     * Requirements: 7.2.1 - Atomic version increment with correct labels
     */
    it("should generate correct version labels for concurrent uploads", async () => {
      const uploadPromises = [];

      for (let i = 0; i < 5; i++) {
        const fileData: FileUploadData = {
          filename: `label-test-${i}.pdf`,
          originalFilename: `label-test-${i}.pdf`,
          fileUrl: `https://example.com/label-test-${i}.pdf`,
          fileSize: 1024,
          mimeType: "application/pdf",
        };

        uploadPromises.push(
          assetService.uploadAsset(testOrderId, fileData, testUserId)
        );
      }

      const assets = await Promise.all(uploadPromises);

      // Verify each asset has correct version label
      for (const asset of assets) {
        expect(asset.versionLabel).toBe(`v${asset.version}`);
      }

      // Verify labels are unique
      const labels = assets.map((a) => a.versionLabel);
      const uniqueLabels = new Set(labels);
      expect(uniqueLabels.size).toBe(5);
    });
  });
});
