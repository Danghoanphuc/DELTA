// src/modules/artworks/artwork.test.js
// ✅ Comprehensive Test Script for Artwork Management System

import mongoose from "mongoose";
import {
  Artwork,
  ARTWORK_STATUS,
  ARTWORK_FILE_FORMATS,
  COLOR_MODES,
} from "./artwork.model.js";
import { ArtworkService } from "./artwork.service.js";
import { Logger } from "../../shared/utils/logger.util.js";

// Test configuration
const TEST_ORG_ID = new mongoose.Types.ObjectId();
const TEST_USER_ID = new mongoose.Types.ObjectId();
const TEST_ADMIN_ID = new mongoose.Types.ObjectId();

// Test data
const createMockFileData = (overrides = {}) => ({
  fileName: "test-logo-123.png",
  originalFileName: "company-logo.png",
  fileUrl: "https://s3.amazonaws.com/test-bucket/test-logo-123.png",
  thumbnailUrl: "https://s3.amazonaws.com/test-bucket/test-logo-123-thumb.png",
  fileSize: 2 * 1024 * 1024, // 2MB
  fileFormat: ARTWORK_FILE_FORMATS.PNG,
  dimensions: {
    width: 200,
    height: 200,
    unit: "mm",
  },
  resolution: 300,
  colorMode: COLOR_MODES.CMYK,
  colorCount: 4,
  hasTransparency: false,
  tags: ["logo", "brand"],
  description: "Company logo for t-shirt printing",
  ...overrides,
});

// Test suite
class ArtworkTestSuite {
  constructor() {
    this.service = new ArtworkService();
    this.testResults = {
      passed: 0,
      failed: 0,
      errors: [],
    };
  }

  async runAllTests() {
    console.log("\n🧪 ===== ARTWORK MANAGEMENT SYSTEM TEST SUITE =====\n");

    try {
      // Connect to database
      await this.connectDatabase();

      // Clean up before tests
      await this.cleanup();

      // Run test groups
      await this.testModelMethods();
      await this.testServiceUpload();
      await this.testServiceValidation();
      await this.testServiceApprovalWorkflow();
      await this.testServiceVersionControl();
      await this.testServiceMetadata();
      await this.testServiceSearch();
      await this.testServiceStats();
      await this.testErrorHandling();

      // Clean up after tests
      await this.cleanup();

      // Print results
      this.printResults();
    } catch (error) {
      console.error("❌ Test suite failed:", error);
    } finally {
      await mongoose.connection.close();
    }
  }

  async connectDatabase() {
    const mongoUri =
      process.env.MONGODB_URI || "mongodb://localhost:27017/delta-swag-test";
    await mongoose.connect(mongoUri);
    console.log("✅ Connected to test database");
  }

  async cleanup() {
    await Artwork.deleteMany({});
    console.log("🧹 Cleaned up test data");
  }

  // === TEST GROUPS ===

  async testModelMethods() {
    console.log("\n📦 Testing Model Methods...\n");

    // Test 1: Create artwork
    await this.test("Create artwork with valid data", async () => {
      const artwork = new Artwork({
        organization: TEST_ORG_ID,
        uploadedBy: TEST_USER_ID,
        ...createMockFileData(),
      });
      await artwork.save();

      if (!artwork._id) throw new Error("Artwork not created");
      if (artwork.validationStatus !== ARTWORK_STATUS.PENDING) {
        throw new Error("Default status should be PENDING");
      }
      if (artwork.version !== 1) throw new Error("Default version should be 1");
      if (artwork.usageCount !== 0)
        throw new Error("Default usage count should be 0");

      return artwork;
    });

    // Test 2: Approve method
    await this.test("Approve artwork", async () => {
      const artwork = await Artwork.findOne({ organization: TEST_ORG_ID });
      await artwork.approve(TEST_ADMIN_ID);

      if (artwork.validationStatus !== ARTWORK_STATUS.APPROVED) {
        throw new Error("Status should be APPROVED");
      }
      if (!artwork.validatedAt) throw new Error("validatedAt should be set");
      if (!artwork.validatedBy) throw new Error("validatedBy should be set");
      if (artwork.validationErrors.length > 0) {
        throw new Error("validationErrors should be empty");
      }
    });

    // Test 3: Reject method
    await this.test("Reject artwork", async () => {
      const artwork = new Artwork({
        organization: TEST_ORG_ID,
        uploadedBy: TEST_USER_ID,
        ...createMockFileData({ fileName: "test-reject.png" }),
      });
      await artwork.save();

      const errors = ["Resolution too low", "Wrong color mode"];
      await artwork.reject(TEST_ADMIN_ID, errors);

      if (artwork.validationStatus !== ARTWORK_STATUS.REJECTED) {
        throw new Error("Status should be REJECTED");
      }
      if (artwork.validationErrors.length !== 2) {
        throw new Error("Should have 2 validation errors");
      }
    });

    // Test 4: Increment usage
    await this.test("Increment usage count", async () => {
      const artwork = await Artwork.findOne({
        validationStatus: ARTWORK_STATUS.APPROVED,
      });
      const initialCount = artwork.usageCount;

      await artwork.incrementUsage();

      if (artwork.usageCount !== initialCount + 1) {
        throw new Error("Usage count should increment by 1");
      }
      if (!artwork.lastUsedAt) throw new Error("lastUsedAt should be set");
    });

    // Test 5: Virtual properties
    await this.test("Virtual properties work correctly", async () => {
      const artwork = await Artwork.findOne({
        validationStatus: ARTWORK_STATUS.APPROVED,
      });

      const expectedSizeMB = (artwork.fileSize / (1024 * 1024)).toFixed(2);
      if (artwork.fileSizeMB !== expectedSizeMB) {
        throw new Error(`fileSizeMB should be ${expectedSizeMB}`);
      }

      if (!artwork.isValid) {
        throw new Error("isValid should be true for approved artwork");
      }
    });
  }

  async testServiceUpload() {
    console.log("\n📤 Testing Service Upload...\n");

    // Test 1: Upload valid artwork
    await this.test("Upload artwork with valid data", async () => {
      const fileData = createMockFileData({
        fileName: "service-test-1.png",
      });

      const artwork = await this.service.uploadArtwork(
        TEST_ORG_ID,
        TEST_USER_ID,
        fileData
      );

      if (!artwork._id) throw new Error("Artwork not created");
      if (artwork.organization.toString() !== TEST_ORG_ID.toString()) {
        throw new Error("Organization mismatch");
      }
      if (artwork.uploadedBy.toString() !== TEST_USER_ID.toString()) {
        throw new Error("UploadedBy mismatch");
      }
    });

    // Test 2: Upload with missing required fields
    await this.test("Reject upload with missing fileName", async () => {
      const fileData = createMockFileData();
      delete fileData.fileName;

      try {
        await this.service.uploadArtwork(TEST_ORG_ID, TEST_USER_ID, fileData);
        throw new Error("Should have thrown ValidationException");
      } catch (error) {
        if (!error.message.includes("File name is required")) {
          throw new Error("Wrong error message");
        }
      }
    });

    // Test 3: Upload with invalid file format
    await this.test("Reject upload with invalid file format", async () => {
      const fileData = createMockFileData({
        fileFormat: "INVALID",
      });

      try {
        await this.service.uploadArtwork(TEST_ORG_ID, TEST_USER_ID, fileData);
        throw new Error("Should have thrown ValidationException");
      } catch (error) {
        if (!error.message.includes("Invalid file format")) {
          throw new Error("Wrong error message");
        }
      }
    });

    // Test 4: Upload with file size exceeding limit
    await this.test("Reject upload with file size > 50MB", async () => {
      const fileData = createMockFileData({
        fileSize: 60 * 1024 * 1024, // 60MB
      });

      try {
        await this.service.uploadArtwork(TEST_ORG_ID, TEST_USER_ID, fileData);
        throw new Error("Should have thrown ValidationException");
      } catch (error) {
        if (!error.message.includes("exceeds maximum 50MB")) {
          throw new Error("Wrong error message");
        }
      }
    });
  }

  async testServiceValidation() {
    console.log("\n✅ Testing Service Validation...\n");

    // Create test artwork
    const artwork = await this.service.uploadArtwork(
      TEST_ORG_ID,
      TEST_USER_ID,
      createMockFileData({ fileName: "validation-test.png" })
    );

    // Test 1: Validate with passing requirements
    await this.test("Validate artwork - all requirements pass", async () => {
      const requirements = {
        minResolution: 300,
        acceptedFormats: [ARTWORK_FILE_FORMATS.PNG, ARTWORK_FILE_FORMATS.PDF],
        colorMode: COLOR_MODES.CMYK,
        maxFileSize: 10, // MB
        maxWidth: 300,
        maxHeight: 300,
      };

      const result = await this.service.validateArtwork(
        TEST_ORG_ID,
        artwork._id,
        requirements
      );

      if (!result.isValid) throw new Error("Should be valid");
      if (result.errors.length > 0) throw new Error("Should have no errors");
    });

    // Test 2: Validate with failing resolution
    await this.test("Validate artwork - resolution too low", async () => {
      const requirements = {
        minResolution: 600, // Higher than artwork's 300
      };

      const result = await this.service.validateArtwork(
        TEST_ORG_ID,
        artwork._id,
        requirements
      );

      if (result.isValid) throw new Error("Should be invalid");
      if (result.errors.length === 0) throw new Error("Should have errors");
      if (!result.errors[0].includes("Resolution")) {
        throw new Error("Should have resolution error");
      }
    });

    // Test 3: Validate with wrong file format
    await this.test("Validate artwork - wrong file format", async () => {
      const requirements = {
        acceptedFormats: [ARTWORK_FILE_FORMATS.AI, ARTWORK_FILE_FORMATS.EPS],
      };

      const result = await this.service.validateArtwork(
        TEST_ORG_ID,
        artwork._id,
        requirements
      );

      if (result.isValid) throw new Error("Should be invalid");
      if (!result.errors[0].includes("File format")) {
        throw new Error("Should have file format error");
      }
    });

    // Test 4: Validate with wrong color mode
    await this.test("Validate artwork - wrong color mode", async () => {
      const requirements = {
        colorMode: COLOR_MODES.RGB, // Artwork is CMYK
      };

      const result = await this.service.validateArtwork(
        TEST_ORG_ID,
        artwork._id,
        requirements
      );

      if (result.isValid) throw new Error("Should be invalid");
      if (!result.errors[0].includes("Color mode")) {
        throw new Error("Should have color mode error");
      }
    });

    // Test 5: Validate dimensions
    await this.test("Validate artwork - dimensions exceed max", async () => {
      const requirements = {
        maxWidth: 100, // Artwork is 200mm
        maxHeight: 100,
      };

      const result = await this.service.validateArtwork(
        TEST_ORG_ID,
        artwork._id,
        requirements
      );

      if (result.isValid) throw new Error("Should be invalid");
      if (result.errors.length < 2) {
        throw new Error("Should have width and height errors");
      }
    });
  }

  async testServiceApprovalWorkflow() {
    console.log("\n👍 Testing Approval Workflow...\n");

    // Create test artwork
    const artwork = await this.service.uploadArtwork(
      TEST_ORG_ID,
      TEST_USER_ID,
      createMockFileData({ fileName: "approval-test.png" })
    );

    // Test 1: Approve artwork
    await this.test("Approve artwork", async () => {
      const approved = await this.service.approveArtwork(
        TEST_ORG_ID,
        artwork._id,
        TEST_ADMIN_ID
      );

      if (approved.validationStatus !== ARTWORK_STATUS.APPROVED) {
        throw new Error("Status should be APPROVED");
      }
      if (!approved.validatedAt) throw new Error("validatedAt should be set");
      if (approved.validatedBy.toString() !== TEST_ADMIN_ID.toString()) {
        throw new Error("validatedBy mismatch");
      }
    });

    // Test 2: Reject artwork
    await this.test("Reject artwork with errors", async () => {
      const artwork2 = await this.service.uploadArtwork(
        TEST_ORG_ID,
        TEST_USER_ID,
        createMockFileData({ fileName: "reject-test.png" })
      );

      const errors = ["Resolution too low", "Wrong color profile"];
      const rejected = await this.service.rejectArtwork(
        TEST_ORG_ID,
        artwork2._id,
        TEST_ADMIN_ID,
        errors
      );

      if (rejected.validationStatus !== ARTWORK_STATUS.REJECTED) {
        throw new Error("Status should be REJECTED");
      }
      if (rejected.validationErrors.length !== 2) {
        throw new Error("Should have 2 errors");
      }
    });

    // Test 3: Reject without errors
    await this.test("Reject artwork without errors should fail", async () => {
      const artwork3 = await this.service.uploadArtwork(
        TEST_ORG_ID,
        TEST_USER_ID,
        createMockFileData({ fileName: "reject-test-2.png" })
      );

      try {
        await this.service.rejectArtwork(
          TEST_ORG_ID,
          artwork3._id,
          TEST_ADMIN_ID,
          []
        );
        throw new Error("Should have thrown ValidationException");
      } catch (error) {
        if (!error.message.includes("lý do từ chối")) {
          throw new Error("Wrong error message");
        }
      }
    });
  }

  async testServiceVersionControl() {
    console.log("\n🔄 Testing Version Control...\n");

    // Create original artwork
    const original = await this.service.uploadArtwork(
      TEST_ORG_ID,
      TEST_USER_ID,
      createMockFileData({ fileName: "version-test-v1.png" })
    );

    // Test 1: Create new version
    await this.test("Create new version", async () => {
      const newFileData = createMockFileData({
        fileName: "version-test-v2.png",
        resolution: 600, // Higher resolution
      });

      const newVersion = await this.service.createNewVersion(
        TEST_ORG_ID,
        original._id,
        TEST_USER_ID,
        newFileData
      );

      if (newVersion.version !== 2) throw new Error("Version should be 2");
      if (newVersion.previousVersionId.toString() !== original._id.toString()) {
        throw new Error("previousVersionId mismatch");
      }
      if (newVersion.resolution !== 600) {
        throw new Error("Resolution should be updated");
      }
      // Tags and description should be inherited
      if (newVersion.tags.length !== original.tags.length) {
        throw new Error("Tags should be inherited");
      }
    });

    // Test 2: Get version history
    await this.test("Get version history", async () => {
      const history = await this.service.getVersionHistory(
        TEST_ORG_ID,
        original._id
      );

      if (history.length < 2) {
        throw new Error("Should have at least 2 versions");
      }
      // Should be sorted by version descending
      if (history[0].version < history[1].version) {
        throw new Error("Should be sorted by version descending");
      }
    });

    // Test 3: Create version from non-existent artwork
    await this.test("Create version from non-existent artwork", async () => {
      const fakeId = new mongoose.Types.ObjectId();
      const newFileData = createMockFileData();

      try {
        await this.service.createNewVersion(
          TEST_ORG_ID,
          fakeId,
          TEST_USER_ID,
          newFileData
        );
        throw new Error("Should have thrown NotFoundException");
      } catch (error) {
        if (!error.message.includes("not found")) {
          throw new Error("Wrong error message");
        }
      }
    });
  }

  async testServiceMetadata() {
    console.log("\n📝 Testing Metadata Management...\n");

    // Create test artwork
    const artwork = await this.service.uploadArtwork(
      TEST_ORG_ID,
      TEST_USER_ID,
      createMockFileData({ fileName: "metadata-test.png" })
    );

    // Test 1: Update tags
    await this.test("Update artwork tags", async () => {
      const updated = await this.service.updateMetadata(
        TEST_ORG_ID,
        artwork._id,
        {
          tags: ["logo", "brand", "corporate"],
        }
      );

      if (updated.tags.length !== 3) throw new Error("Should have 3 tags");
      if (!updated.tags.includes("corporate")) {
        throw new Error("Should include new tag");
      }
    });

    // Test 2: Update description
    await this.test("Update artwork description", async () => {
      const updated = await this.service.updateMetadata(
        TEST_ORG_ID,
        artwork._id,
        {
          description: "Updated description for testing",
        }
      );

      if (updated.description !== "Updated description for testing") {
        throw new Error("Description not updated");
      }
    });

    // Test 3: Update notes
    await this.test("Update artwork notes", async () => {
      const updated = await this.service.updateMetadata(
        TEST_ORG_ID,
        artwork._id,
        {
          notes: "Internal notes for admin",
        }
      );

      if (updated.notes !== "Internal notes for admin") {
        throw new Error("Notes not updated");
      }
    });
  }

  async testServiceSearch() {
    console.log("\n🔍 Testing Search Functionality...\n");

    // Create test artworks with different tags
    await this.service.uploadArtwork(
      TEST_ORG_ID,
      TEST_USER_ID,
      createMockFileData({
        fileName: "search-1.png",
        tags: ["logo", "brand"],
      })
    );

    await this.service.uploadArtwork(
      TEST_ORG_ID,
      TEST_USER_ID,
      createMockFileData({
        fileName: "search-2.png",
        tags: ["illustration", "design"],
      })
    );

    await this.service.uploadArtwork(
      TEST_ORG_ID,
      TEST_USER_ID,
      createMockFileData({
        fileName: "search-3.png",
        tags: ["logo", "illustration"],
      })
    );

    // Test 1: Search by single tag
    await this.test("Search by single tag", async () => {
      const results = await this.service.searchByTags(TEST_ORG_ID, ["logo"]);

      if (results.length < 2) {
        throw new Error("Should find at least 2 artworks with 'logo' tag");
      }
    });

    // Test 2: Search by multiple tags
    await this.test("Search by multiple tags", async () => {
      const results = await this.service.searchByTags(TEST_ORG_ID, [
        "logo",
        "illustration",
      ]);

      if (results.length < 3) {
        throw new Error("Should find at least 3 artworks");
      }
    });

    // Test 3: Get all tags
    await this.test("Get all unique tags", async () => {
      const tags = await this.service.getAllTags(TEST_ORG_ID);

      if (tags.length < 4) {
        throw new Error("Should have at least 4 unique tags");
      }
      if (!tags.includes("logo")) throw new Error("Should include 'logo'");
      if (!tags.includes("illustration")) {
        throw new Error("Should include 'illustration'");
      }
    });
  }

  async testServiceStats() {
    console.log("\n📊 Testing Statistics...\n");

    // Create artworks with different statuses
    const artwork1 = await this.service.uploadArtwork(
      TEST_ORG_ID,
      TEST_USER_ID,
      createMockFileData({ fileName: "stats-1.png" })
    );
    await this.service.approveArtwork(TEST_ORG_ID, artwork1._id, TEST_ADMIN_ID);

    const artwork2 = await this.service.uploadArtwork(
      TEST_ORG_ID,
      TEST_USER_ID,
      createMockFileData({ fileName: "stats-2.png" })
    );
    await this.service.rejectArtwork(TEST_ORG_ID, artwork2._id, TEST_ADMIN_ID, [
      "Test error",
    ]);

    await this.service.uploadArtwork(
      TEST_ORG_ID,
      TEST_USER_ID,
      createMockFileData({ fileName: "stats-3.png" })
    );

    // Increment usage for artwork1
    await this.service.incrementUsage(artwork1._id);
    await this.service.incrementUsage(artwork1._id);

    // Test 1: Get stats
    await this.test("Get artwork statistics", async () => {
      const stats = await this.service.getStats(TEST_ORG_ID);

      if (!stats.total) throw new Error("Should have total count");
      if (!stats.byStatus) throw new Error("Should have status breakdown");
      if (stats.byStatus.approved < 1) {
        throw new Error("Should have at least 1 approved");
      }
      if (stats.byStatus.rejected < 1) {
        throw new Error("Should have at least 1 rejected");
      }
      if (stats.byStatus.pending < 1) {
        throw new Error("Should have at least 1 pending");
      }
    });

    // Test 2: Get most used artworks
    await this.test("Get most used artworks", async () => {
      const mostUsed = await this.service.getMostUsed(TEST_ORG_ID, 5);

      if (mostUsed.length === 0) {
        throw new Error("Should have at least 1 artwork");
      }
      // First artwork should have highest usage count
      if (mostUsed[0].usageCount < 2) {
        throw new Error("First artwork should have usage count >= 2");
      }
    });
  }

  async testErrorHandling() {
    console.log("\n❌ Testing Error Handling...\n");

    // Test 1: Get non-existent artwork
    await this.test("Get non-existent artwork", async () => {
      const fakeId = new mongoose.Types.ObjectId();

      try {
        await this.service.getArtwork(TEST_ORG_ID, fakeId);
        throw new Error("Should have thrown NotFoundException");
      } catch (error) {
        if (!error.message.includes("not found")) {
          throw new Error("Wrong error message");
        }
      }
    });

    // Test 2: Access artwork from different organization
    await this.test("Access artwork from different organization", async () => {
      const artwork = await this.service.uploadArtwork(
        TEST_ORG_ID,
        TEST_USER_ID,
        createMockFileData({ fileName: "forbidden-test.png" })
      );

      const differentOrgId = new mongoose.Types.ObjectId();

      try {
        await this.service.getArtwork(differentOrgId, artwork._id);
        throw new Error("Should have thrown ForbiddenException");
      } catch (error) {
        if (!error.message.includes("không có quyền")) {
          throw new Error("Wrong error message");
        }
      }
    });

    // Test 3: Delete artwork in use
    await this.test("Delete artwork that is in use", async () => {
      const artwork = await this.service.uploadArtwork(
        TEST_ORG_ID,
        TEST_USER_ID,
        createMockFileData({ fileName: "delete-test.png" })
      );

      // Increment usage
      await this.service.incrementUsage(artwork._id);

      try {
        await this.service.deleteArtwork(
          TEST_ORG_ID,
          artwork._id,
          TEST_USER_ID
        );
        throw new Error("Should have thrown ValidationException");
      } catch (error) {
        if (!error.message.includes("đang được sử dụng")) {
          throw new Error("Wrong error message");
        }
      }
    });

    // Test 4: Delete artwork not in use (should succeed)
    await this.test("Delete artwork not in use", async () => {
      const artwork = await this.service.uploadArtwork(
        TEST_ORG_ID,
        TEST_USER_ID,
        createMockFileData({ fileName: "delete-success.png" })
      );

      await this.service.deleteArtwork(TEST_ORG_ID, artwork._id, TEST_USER_ID);

      // Verify soft delete
      const deleted = await Artwork.findById(artwork._id);
      if (!deleted.isDeleted) throw new Error("Should be soft deleted");
      if (!deleted.deletedAt) throw new Error("deletedAt should be set");
    });
  }

  // === TEST HELPERS ===

  async test(name, testFn) {
    try {
      await testFn();
      this.testResults.passed++;
      console.log(`✅ ${name}`);
    } catch (error) {
      this.testResults.failed++;
      this.testResults.errors.push({ name, error: error.message });
      console.log(`❌ ${name}`);
      console.log(`   Error: ${error.message}`);
    }
  }

  printResults() {
    console.log("\n" + "=".repeat(60));
    console.log("📊 TEST RESULTS");
    console.log("=".repeat(60));
    console.log(`✅ Passed: ${this.testResults.passed}`);
    console.log(`❌ Failed: ${this.testResults.failed}`);
    console.log(
      `📈 Success Rate: ${(
        (this.testResults.passed /
          (this.testResults.passed + this.testResults.failed)) *
        100
      ).toFixed(2)}%`
    );

    if (this.testResults.failed > 0) {
      console.log("\n❌ Failed Tests:");
      this.testResults.errors.forEach((err, index) => {
        console.log(`\n${index + 1}. ${err.name}`);
        console.log(`   ${err.error}`);
      });
    }

    console.log("\n" + "=".repeat(60));
  }
}

// Run tests
const testSuite = new ArtworkTestSuite();
testSuite.runAllTests().catch(console.error);
