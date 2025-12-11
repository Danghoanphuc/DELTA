// src/modules/artworks/artwork.api-test.js
// ✅ API Endpoint Test Script (HTTP Request Testing)

import axios from "axios";
import FormData from "form-data";
import fs from "fs";
import path from "path";

// Configuration
const API_BASE_URL = process.env.API_URL || "http://localhost:5000/api";
const TEST_TOKEN = process.env.TEST_TOKEN || ""; // Set your test JWT token

// Test user context
let testContext = {
  token: TEST_TOKEN,
  organizationId: null,
  artworkIds: [],
};

// Axios instance with auth
const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    Authorization: `Bearer ${testContext.token}`,
  },
});

// Colors for console output
const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  red: "\x1b[31m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

class ArtworkAPITest {
  constructor() {
    this.results = {
      passed: 0,
      failed: 0,
      errors: [],
    };
  }

  async runAllTests() {
    console.log(
      `\n${colors.cyan}🧪 ===== ARTWORK API ENDPOINT TESTS =====${colors.reset}\n`
    );

    if (!testContext.token) {
      console.log(`${colors.red}❌ ERROR: TEST_TOKEN not set${colors.reset}`);
      console.log(
        `${colors.yellow}Please set TEST_TOKEN environment variable with a valid JWT token${colors.reset}`
      );
      console.log(
        `${colors.yellow}Example: TEST_TOKEN="your-jwt-token" node artwork.api-test.js${colors.reset}\n`
      );
      return;
    }

    try {
      // Test groups
      await this.testUploadEndpoint();
      await this.testGetLibraryEndpoint();
      await this.testGetDetailEndpoint();
      await this.testValidationEndpoint();
      await this.testApprovalEndpoints();
      await this.testVersionControlEndpoints();
      await this.testMetadataEndpoints();
      await this.testSearchEndpoints();
      await this.testStatsEndpoints();
      await this.testDeleteEndpoint();

      // Print results
      this.printResults();
    } catch (error) {
      console.error(
        `${colors.red}❌ Test suite failed:${colors.reset}`,
        error.message
      );
    }
  }

  // === TEST GROUPS ===

  async testUploadEndpoint() {
    console.log(`\n${colors.blue}📤 Testing Upload Endpoint${colors.reset}\n`);

    // Test 1: Upload artwork (simulated - in real scenario you'd upload actual file)
    await this.test("POST /artworks - Upload artwork", async () => {
      const mockFileData = {
        fileName: `test-artwork-${Date.now()}.png`,
        originalFileName: "company-logo.png",
        fileUrl: `https://s3.amazonaws.com/test-bucket/test-${Date.now()}.png`,
        thumbnailUrl: `https://s3.amazonaws.com/test-bucket/test-${Date.now()}-thumb.png`,
        fileSize: 2 * 1024 * 1024, // 2MB
        fileFormat: "PNG",
        dimensions: {
          width: 200,
          height: 200,
          unit: "mm",
        },
        resolution: 300,
        colorMode: "CMYK",
        colorCount: 4,
        hasTransparency: false,
        tags: ["logo", "brand", "test"],
        description: "Test artwork for API testing",
      };

      const response = await api.post("/artworks", mockFileData);

      if (response.status !== 201) {
        throw new Error(`Expected status 201, got ${response.status}`);
      }

      if (!response.data.success) {
        throw new Error("Response should have success: true");
      }

      const artwork = response.data.data.artwork;
      if (!artwork._id) {
        throw new Error("Response should include artwork._id");
      }

      // Save for later tests
      testContext.artworkIds.push(artwork._id);
      testContext.organizationId = artwork.organization;

      console.log(`   Created artwork ID: ${artwork._id}`);
    });

    // Test 2: Upload with missing required fields
    await this.test("POST /artworks - Reject missing fileName", async () => {
      const invalidData = {
        fileUrl: "https://s3.amazonaws.com/test.png",
        fileSize: 1024,
        fileFormat: "PNG",
      };

      try {
        await api.post("/artworks", invalidData);
        throw new Error("Should have returned 400 error");
      } catch (error) {
        if (error.response?.status !== 400) {
          throw new Error(`Expected status 400, got ${error.response?.status}`);
        }
      }
    });

    // Test 3: Upload with invalid file format
    await this.test("POST /artworks - Reject invalid file format", async () => {
      const invalidData = {
        fileName: "test.txt",
        fileUrl: "https://s3.amazonaws.com/test.txt",
        fileSize: 1024,
        fileFormat: "TXT", // Invalid
      };

      try {
        await api.post("/artworks", invalidData);
        throw new Error("Should have returned 400 error");
      } catch (error) {
        if (error.response?.status !== 400) {
          throw new Error(`Expected status 400, got ${error.response?.status}`);
        }
      }
    });
  }

  async testGetLibraryEndpoint() {
    console.log(
      `\n${colors.blue}📚 Testing Get Library Endpoint${colors.reset}\n`
    );

    // Test 1: Get all artworks
    await this.test("GET /artworks - Get artwork library", async () => {
      const response = await api.get("/artworks");

      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }

      if (!response.data.success) {
        throw new Error("Response should have success: true");
      }

      const artworks = response.data.data.artworks;
      if (!Array.isArray(artworks)) {
        throw new Error("Response should include artworks array");
      }

      console.log(`   Found ${artworks.length} artworks`);
    });

    // Test 2: Filter by status
    await this.test(
      "GET /artworks?status=pending - Filter by status",
      async () => {
        const response = await api.get("/artworks", {
          params: { status: "pending" },
        });

        if (response.status !== 200) {
          throw new Error(`Expected status 200, got ${response.status}`);
        }

        const artworks = response.data.data.artworks;
        const allPending = artworks.every(
          (a) => a.validationStatus === "pending"
        );

        if (!allPending) {
          throw new Error("All artworks should have status 'pending'");
        }

        console.log(`   Found ${artworks.length} pending artworks`);
      }
    );

    // Test 3: Filter by tags
    await this.test("GET /artworks?tags=logo - Filter by tags", async () => {
      const response = await api.get("/artworks", {
        params: { tags: "logo" },
      });

      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }

      const artworks = response.data.data.artworks;
      console.log(`   Found ${artworks.length} artworks with 'logo' tag`);
    });
  }

  async testGetDetailEndpoint() {
    console.log(
      `\n${colors.blue}🔍 Testing Get Detail Endpoint${colors.reset}\n`
    );

    if (testContext.artworkIds.length === 0) {
      console.log(
        `${colors.yellow}⚠️  Skipping - no artwork IDs available${colors.reset}`
      );
      return;
    }

    const artworkId = testContext.artworkIds[0];

    // Test 1: Get artwork detail
    await this.test(
      `GET /artworks/${artworkId} - Get artwork detail`,
      async () => {
        const response = await api.get(`/artworks/${artworkId}`);

        if (response.status !== 200) {
          throw new Error(`Expected status 200, got ${response.status}`);
        }

        const artwork = response.data.data.artwork;
        if (artwork._id !== artworkId) {
          throw new Error("Artwork ID mismatch");
        }

        console.log(`   Artwork: ${artwork.fileName}`);
        console.log(`   Status: ${artwork.validationStatus}`);
        console.log(`   Size: ${artwork.fileSizeMB}MB`);
      }
    );

    // Test 2: Get non-existent artwork
    await this.test(
      "GET /artworks/invalid-id - Get non-existent artwork",
      async () => {
        const fakeId = "507f1f77bcf86cd799439011"; // Valid ObjectId format

        try {
          await api.get(`/artworks/${fakeId}`);
          throw new Error("Should have returned 404 error");
        } catch (error) {
          if (error.response?.status !== 404) {
            throw new Error(
              `Expected status 404, got ${error.response?.status}`
            );
          }
        }
      }
    );
  }

  async testValidationEndpoint() {
    console.log(
      `\n${colors.blue}✅ Testing Validation Endpoint${colors.reset}\n`
    );

    if (testContext.artworkIds.length === 0) {
      console.log(
        `${colors.yellow}⚠️  Skipping - no artwork IDs available${colors.reset}`
      );
      return;
    }

    const artworkId = testContext.artworkIds[0];

    // Test 1: Validate with passing requirements
    await this.test(
      "POST /artworks/:id/validate - Validate artwork (pass)",
      async () => {
        const requirements = {
          minResolution: 300,
          acceptedFormats: ["PNG", "PDF", "AI"],
          colorMode: "CMYK",
          maxFileSize: 10,
        };

        const response = await api.post(`/artworks/${artworkId}/validate`, {
          requirements,
        });

        if (response.status !== 200) {
          throw new Error(`Expected status 200, got ${response.status}`);
        }

        const result = response.data.data;
        console.log(`   Valid: ${result.isValid}`);
        console.log(`   Errors: ${result.errors.length}`);
      }
    );

    // Test 2: Validate with failing requirements
    await this.test(
      "POST /artworks/:id/validate - Validate artwork (fail)",
      async () => {
        const requirements = {
          minResolution: 600, // Higher than artwork's resolution
          acceptedFormats: ["AI", "EPS"], // Different formats
        };

        const response = await api.post(`/artworks/${artworkId}/validate`, {
          requirements,
        });

        if (response.status !== 200) {
          throw new Error(`Expected status 200, got ${response.status}`);
        }

        const result = response.data.data;
        if (result.isValid) {
          throw new Error("Should be invalid with these requirements");
        }

        console.log(`   Valid: ${result.isValid}`);
        console.log(`   Errors: ${result.errors.join(", ")}`);
      }
    );
  }

  async testApprovalEndpoints() {
    console.log(
      `\n${colors.blue}👍 Testing Approval Endpoints${colors.reset}\n`
    );

    if (testContext.artworkIds.length === 0) {
      console.log(
        `${colors.yellow}⚠️  Skipping - no artwork IDs available${colors.reset}`
      );
      return;
    }

    // Create new artwork for approval test
    const mockFileData = {
      fileName: `approval-test-${Date.now()}.png`,
      originalFileName: "approval-test.png",
      fileUrl: `https://s3.amazonaws.com/test-bucket/approval-${Date.now()}.png`,
      fileSize: 1024 * 1024,
      fileFormat: "PNG",
      resolution: 300,
    };

    const createResponse = await api.post("/artworks", mockFileData);
    const artworkId = createResponse.data.data.artwork._id;

    // Test 1: Approve artwork
    await this.test(
      "POST /artworks/:id/approve - Approve artwork",
      async () => {
        const response = await api.post(`/artworks/${artworkId}/approve`);

        if (response.status !== 200) {
          throw new Error(`Expected status 200, got ${response.status}`);
        }

        const artwork = response.data.data.artwork;
        if (artwork.validationStatus !== "approved") {
          throw new Error("Status should be 'approved'");
        }

        console.log(`   Status: ${artwork.validationStatus}`);
        console.log(`   Validated at: ${artwork.validatedAt}`);
      }
    );

    // Create another artwork for rejection test
    const createResponse2 = await api.post("/artworks", {
      ...mockFileData,
      fileName: `reject-test-${Date.now()}.png`,
    });
    const artworkId2 = createResponse2.data.data.artwork._id;

    // Test 2: Reject artwork
    await this.test("POST /artworks/:id/reject - Reject artwork", async () => {
      const errors = ["Resolution too low", "Wrong color profile"];

      const response = await api.post(`/artworks/${artworkId2}/reject`, {
        errors,
      });

      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }

      const artwork = response.data.data.artwork;
      if (artwork.validationStatus !== "rejected") {
        throw new Error("Status should be 'rejected'");
      }

      if (artwork.validationErrors.length !== 2) {
        throw new Error("Should have 2 validation errors");
      }

      console.log(`   Status: ${artwork.validationStatus}`);
      console.log(`   Errors: ${artwork.validationErrors.join(", ")}`);
    });
  }

  async testVersionControlEndpoints() {
    console.log(
      `\n${colors.blue}🔄 Testing Version Control Endpoints${colors.reset}\n`
    );

    if (testContext.artworkIds.length === 0) {
      console.log(
        `${colors.yellow}⚠️  Skipping - no artwork IDs available${colors.reset}`
      );
      return;
    }

    const originalId = testContext.artworkIds[0];

    // Test 1: Create new version
    await this.test(
      "POST /artworks/:id/version - Create new version",
      async () => {
        const newFileData = {
          fileName: `version-2-${Date.now()}.png`,
          originalFileName: "version-2.png",
          fileUrl: `https://s3.amazonaws.com/test-bucket/v2-${Date.now()}.png`,
          fileSize: 3 * 1024 * 1024,
          fileFormat: "PNG",
          resolution: 600, // Higher resolution
        };

        const response = await api.post(
          `/artworks/${originalId}/version`,
          newFileData
        );

        if (response.status !== 201) {
          throw new Error(`Expected status 201, got ${response.status}`);
        }

        const newVersion = response.data.data.artwork;
        if (newVersion.version !== 2) {
          throw new Error("Version should be 2");
        }

        if (newVersion.previousVersionId !== originalId) {
          throw new Error("previousVersionId mismatch");
        }

        console.log(`   New version ID: ${newVersion._id}`);
        console.log(`   Version: ${newVersion.version}`);
        console.log(`   Resolution: ${newVersion.resolution}dpi`);
      }
    );

    // Test 2: Get version history
    await this.test(
      "GET /artworks/:id/versions - Get version history",
      async () => {
        const response = await api.get(`/artworks/${originalId}/versions`);

        if (response.status !== 200) {
          throw new Error(`Expected status 200, got ${response.status}`);
        }

        const versions = response.data.data.versions;
        if (!Array.isArray(versions)) {
          throw new Error("Response should include versions array");
        }

        if (versions.length < 2) {
          throw new Error("Should have at least 2 versions");
        }

        console.log(`   Found ${versions.length} versions`);
        versions.forEach((v) => {
          console.log(`   - v${v.version}: ${v.fileName}`);
        });
      }
    );
  }

  async testMetadataEndpoints() {
    console.log(
      `\n${colors.blue}📝 Testing Metadata Endpoints${colors.reset}\n`
    );

    if (testContext.artworkIds.length === 0) {
      console.log(
        `${colors.yellow}⚠️  Skipping - no artwork IDs available${colors.reset}`
      );
      return;
    }

    const artworkId = testContext.artworkIds[0];

    // Test 1: Update metadata
    await this.test("PATCH /artworks/:id - Update metadata", async () => {
      const updates = {
        tags: ["logo", "brand", "corporate", "updated"],
        description: "Updated description via API test",
        notes: "Internal notes for testing",
      };

      const response = await api.patch(`/artworks/${artworkId}`, updates);

      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }

      const artwork = response.data.data.artwork;
      if (artwork.tags.length !== 4) {
        throw new Error("Should have 4 tags");
      }

      if (artwork.description !== updates.description) {
        throw new Error("Description not updated");
      }

      console.log(`   Tags: ${artwork.tags.join(", ")}`);
      console.log(`   Description: ${artwork.description}`);
    });
  }

  async testSearchEndpoints() {
    console.log(`\n${colors.blue}🔍 Testing Search Endpoints${colors.reset}\n`);

    // Test 1: Get all tags
    await this.test("GET /artworks/tags - Get all tags", async () => {
      const response = await api.get("/artworks/tags");

      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }

      const tags = response.data.data.tags;
      if (!Array.isArray(tags)) {
        throw new Error("Response should include tags array");
      }

      console.log(`   Found ${tags.length} unique tags`);
      console.log(
        `   Tags: ${tags.slice(0, 10).join(", ")}${
          tags.length > 10 ? "..." : ""
        }`
      );
    });
  }

  async testStatsEndpoints() {
    console.log(`\n${colors.blue}📊 Testing Stats Endpoints${colors.reset}\n`);

    // Test 1: Get stats
    await this.test(
      "GET /artworks/stats - Get artwork statistics",
      async () => {
        const response = await api.get("/artworks/stats");

        if (response.status !== 200) {
          throw new Error(`Expected status 200, got ${response.status}`);
        }

        const stats = response.data.data.stats;
        if (!stats.total) {
          throw new Error("Stats should include total count");
        }

        if (!stats.byStatus) {
          throw new Error("Stats should include byStatus breakdown");
        }

        console.log(`   Total: ${stats.total}`);
        console.log(`   Pending: ${stats.byStatus.pending || 0}`);
        console.log(`   Approved: ${stats.byStatus.approved || 0}`);
        console.log(`   Rejected: ${stats.byStatus.rejected || 0}`);
      }
    );

    // Test 2: Get most used artworks
    await this.test(
      "GET /artworks/most-used - Get most used artworks",
      async () => {
        const response = await api.get("/artworks/most-used", {
          params: { limit: 5 },
        });

        if (response.status !== 200) {
          throw new Error(`Expected status 200, got ${response.status}`);
        }

        const artworks = response.data.data.artworks;
        if (!Array.isArray(artworks)) {
          throw new Error("Response should include artworks array");
        }

        console.log(`   Found ${artworks.length} most used artworks`);
        artworks.forEach((a, i) => {
          console.log(
            `   ${i + 1}. ${a.fileName} (used ${a.usageCount} times)`
          );
        });
      }
    );
  }

  async testDeleteEndpoint() {
    console.log(`\n${colors.blue}🗑️  Testing Delete Endpoint${colors.reset}\n`);

    // Create artwork for deletion test
    const mockFileData = {
      fileName: `delete-test-${Date.now()}.png`,
      originalFileName: "delete-test.png",
      fileUrl: `https://s3.amazonaws.com/test-bucket/delete-${Date.now()}.png`,
      fileSize: 1024 * 1024,
      fileFormat: "PNG",
    };

    const createResponse = await api.post("/artworks", mockFileData);
    const artworkId = createResponse.data.data.artwork._id;

    // Test 1: Delete artwork
    await this.test("DELETE /artworks/:id - Delete artwork", async () => {
      const response = await api.delete(`/artworks/${artworkId}`);

      if (response.status !== 200) {
        throw new Error(`Expected status 200, got ${response.status}`);
      }

      console.log(`   Deleted artwork: ${artworkId}`);
    });

    // Test 2: Try to get deleted artwork
    await this.test(
      "GET /artworks/:id - Get deleted artwork should fail",
      async () => {
        try {
          await api.get(`/artworks/${artworkId}`);
          throw new Error("Should have returned 404 error");
        } catch (error) {
          if (error.response?.status !== 404) {
            throw new Error(
              `Expected status 404, got ${error.response?.status}`
            );
          }
        }
      }
    );
  }

  // === TEST HELPERS ===

  async test(name, testFn) {
    try {
      await testFn();
      this.results.passed++;
      console.log(`${colors.green}✅ ${name}${colors.reset}`);
    } catch (error) {
      this.results.failed++;
      this.results.errors.push({ name, error: error.message });
      console.log(`${colors.red}❌ ${name}${colors.reset}`);
      console.log(`${colors.red}   Error: ${error.message}${colors.reset}`);
    }
  }

  printResults() {
    console.log(`\n${"=".repeat(60)}`);
    console.log(`${colors.cyan}📊 TEST RESULTS${colors.reset}`);
    console.log("=".repeat(60));
    console.log(
      `${colors.green}✅ Passed: ${this.results.passed}${colors.reset}`
    );
    console.log(
      `${colors.red}❌ Failed: ${this.results.failed}${colors.reset}`
    );

    const total = this.results.passed + this.results.failed;
    const successRate = ((this.results.passed / total) * 100).toFixed(2);
    console.log(
      `${colors.cyan}📈 Success Rate: ${successRate}%${colors.reset}`
    );

    if (this.results.failed > 0) {
      console.log(`\n${colors.red}❌ Failed Tests:${colors.reset}`);
      this.results.errors.forEach((err, index) => {
        console.log(`\n${index + 1}. ${err.name}`);
        console.log(`   ${err.error}`);
      });
    }

    console.log("\n" + "=".repeat(60));
  }
}

// Run tests
const apiTest = new ArtworkAPITest();
apiTest.runAllTests().catch(console.error);
