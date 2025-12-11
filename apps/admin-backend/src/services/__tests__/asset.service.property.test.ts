/**
 * Property-Based Tests for AssetService
 *
 * Tests correctness properties using fast-check library
 * Each test validates specific requirements from the design document
 *
 * Requirements: 3.1, 3.2, 3.3, 3.4, 3.5
 */

import * as fc from "fast-check";
import { Types } from "mongoose";
import { AssetService, FileUploadData } from "../asset.service.js";
import { AssetRepository } from "../../repositories/asset.repository.js";
import { Asset, IAsset, ASSET_STATUS } from "../../models/asset.model.js";

let assetService: AssetService;
let testOrderId: Types.ObjectId;
let testUserId: Types.ObjectId;

// Mock repository to avoid populate issues with Admin model
class TestAssetRepository extends AssetRepository {
  async findById(id: string): Promise<IAsset | null> {
    try {
      // Don't populate to avoid Admin model dependency
      return await Asset.findById(id).lean();
    } catch (error) {
      throw error;
    }
  }

  async update(id: string, data: any): Promise<IAsset | null> {
    try {
      const updated = await Asset.findByIdAndUpdate(id, data, {
        new: true,
        runValidators: true,
      }).lean();
      return updated;
    } catch (error) {
      throw error;
    }
  }
}

// Setup before all tests
beforeAll(async () => {
  const testRepository = new TestAssetRepository();
  assetService = new AssetService(testRepository);
});

// Setup before each test
beforeEach(async () => {
  testOrderId = new Types.ObjectId();
  testUserId = new Types.ObjectId();
});

// Arbitraries for generating test data
const filenameArb = fc
  .tuple(
    fc
      .string({ minLength: 5, maxLength: 20 })
      .filter((s) => /^[a-z]+$/.test(s)),
    fc.constantFrom("pdf", "jpg", "png", "ai", "psd", "svg")
  )
  .map(([name, ext]) => `${name}.${ext}`);

const mimeTypeArb = fc.constantFrom(
  "application/pdf",
  "image/jpeg",
  "image/png",
  "application/illustrator",
  "image/vnd.adobe.photoshop",
  "image/svg+xml"
);

const fileSizeArb = fc.integer({ min: 1024, max: 10485760 }); // 1KB to 10MB

const fileUploadDataArb: fc.Arbitrary<FileUploadData> = fc.record({
  filename: filenameArb,
  originalFilename: filenameArb,
  fileUrl: fc.webUrl(),
  fileSize: fileSizeArb,
  mimeType: mimeTypeArb,
});

describe("AssetService Property Tests", () => {
  /**
   * **Feature: printz-platform-features, Property 9: Asset Version Sequencing**
   * **Validates: Requirements 3.1**
   *
   * For any sequence of file uploads to an order, version numbers SHALL be assigned
   * sequentially (v1, v2, v3...).
   */
  describe("Property 9: Asset Version Sequencing", () => {
    it("should assign sequential version numbers for any sequence of uploads", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fileUploadDataArb, { minLength: 1, maxLength: 10 }),
          async (fileDataArray) => {
            // Use a unique order ID for each property test iteration
            const uniqueOrderId = new Types.ObjectId();

            // Upload all files to the same order
            const uploadedAssets: IAsset[] = [];

            for (const fileData of fileDataArray) {
              const asset = await assetService.uploadAsset(
                uniqueOrderId.toString(),
                fileData,
                testUserId.toString()
              );
              uploadedAssets.push(asset);
            }

            // Verify sequential versioning starting from 1 for this order
            for (let i = 0; i < uploadedAssets.length; i++) {
              const asset = uploadedAssets[i];
              const expectedVersion = i + 1;

              // Check version number is sequential
              expect(asset.version).toBe(expectedVersion);

              // Check version label matches
              expect(asset.versionLabel).toBe(`v${expectedVersion}`);
            }

            // Verify versions are strictly increasing
            for (let i = 1; i < uploadedAssets.length; i++) {
              expect(uploadedAssets[i].version).toBe(
                uploadedAssets[i - 1].version + 1
              );
            }

            // Verify all assets belong to the same order
            uploadedAssets.forEach((asset) => {
              expect(asset.orderId.toString()).toBe(uniqueOrderId.toString());
            });
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should maintain sequential versioning across multiple orders", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(
            fc.array(fileUploadDataArb, { minLength: 1, maxLength: 3 }),
            { minLength: 2, maxLength: 3 }
          ),
          async (ordersFileData) => {
            // Upload files to multiple orders, each with a unique ID
            for (const fileDataArray of ordersFileData) {
              // Generate a unique order ID for each order
              const uniqueOrderId = new Types.ObjectId();
              const uploadedAssets: IAsset[] = [];

              for (const fileData of fileDataArray) {
                const asset = await assetService.uploadAsset(
                  uniqueOrderId.toString(),
                  fileData,
                  testUserId.toString()
                );
                uploadedAssets.push(asset);
              }

              // Verify each order has its own sequential versioning starting from 1
              for (let i = 0; i < uploadedAssets.length; i++) {
                expect(uploadedAssets[i].version).toBe(i + 1);
                expect(uploadedAssets[i].versionLabel).toBe(`v${i + 1}`);
                expect(uploadedAssets[i].orderId.toString()).toBe(
                  uniqueOrderId.toString()
                );
              }
            }
          }
        ),
        { numRuns: 20 }
      );
    }, 60000); // Increase timeout to 60 seconds for this test

    it("should continue sequential versioning after marking assets as FINAL", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fileUploadDataArb, { minLength: 3, maxLength: 8 }),
          fc.integer({ min: 0, max: 2 }), // Index of asset to mark as FINAL
          async (fileDataArray, finalIndex) => {
            // Use a unique order ID for each property test iteration
            const uniqueOrderId = new Types.ObjectId();

            // Upload initial files
            const uploadedAssets: IAsset[] = [];

            for (let i = 0; i <= finalIndex; i++) {
              const asset = await assetService.uploadAsset(
                uniqueOrderId.toString(),
                fileDataArray[i],
                testUserId.toString()
              );
              uploadedAssets.push(asset);
            }

            // Mark one asset as FINAL
            await assetService.markAsFinal(
              uploadedAssets[finalIndex]._id.toString(),
              testUserId.toString()
            );

            // Upload remaining files
            for (let i = finalIndex + 1; i < fileDataArray.length; i++) {
              const asset = await assetService.uploadAsset(
                uniqueOrderId.toString(),
                fileDataArray[i],
                testUserId.toString()
              );
              uploadedAssets.push(asset);
            }

            // Verify all versions are sequential regardless of FINAL status
            for (let i = 0; i < uploadedAssets.length; i++) {
              expect(uploadedAssets[i].version).toBe(i + 1);
            }
          }
        ),
        { numRuns: 50 }
      );
    });

    it("should assign correct version after creating revision from FINAL asset", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.array(fileUploadDataArb, { minLength: 2, maxLength: 5 }),
          fileUploadDataArb, // Revision file data
          async (initialFiles, revisionFileData) => {
            // Use a unique order ID for each property test iteration
            const uniqueOrderId = new Types.ObjectId();

            // Upload initial files
            const uploadedAssets: IAsset[] = [];

            for (const fileData of initialFiles) {
              const asset = await assetService.uploadAsset(
                uniqueOrderId.toString(),
                fileData,
                testUserId.toString()
              );
              uploadedAssets.push(asset);
            }

            // Mark last asset as FINAL
            const lastAsset = uploadedAssets[uploadedAssets.length - 1];
            await assetService.markAsFinal(
              lastAsset._id.toString(),
              testUserId.toString()
            );

            // Create revision
            const revisionAsset = await assetService.createRevision(
              lastAsset._id.toString(),
              revisionFileData,
              testUserId.toString()
            );

            // Verify revision has next sequential version
            const expectedVersion = initialFiles.length + 1;
            expect(revisionAsset.version).toBe(expectedVersion);
            expect(revisionAsset.versionLabel).toBe(`v${expectedVersion}`);

            // Refetch the revision asset to get the updated previousVersionId
            const updatedRevisionAsset = await assetService.getAsset(
              revisionAsset._id.toString()
            );

            // Verify revision is linked to previous version
            expect(updatedRevisionAsset.previousVersionId?.toString()).toBe(
              lastAsset._id.toString()
            );

            // Verify original FINAL is now superseded
            const supersededAsset = await assetService.getAsset(
              lastAsset._id.toString()
            );
            expect(supersededAsset.status).toBe(ASSET_STATUS.SUPERSEDED);
          }
        ),
        { numRuns: 50 }
      );
    });
  });
});
