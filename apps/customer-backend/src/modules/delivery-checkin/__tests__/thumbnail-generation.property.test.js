// apps/customer-backend/src/modules/delivery-checkin/__tests__/thumbnail-generation.property.test.js
/**
 * Property-Based Test: Thumbnail Generation
 *
 * **Feature: delivery-checkin-system, Property 39: Thumbnail Generation**
 * For any uploaded photo, the system SHALL generate a thumbnail with dimensions 300x300 pixels.
 *
 * **Validates: Requirements 11.2**
 */

import fc from "fast-check";
import sharp from "sharp";
import { PhotoUploadService } from "../../../services/photo-upload.service.js";

describe("Property 39: Thumbnail Generation", () => {
  let service;
  const EXPECTED_THUMBNAIL_SIZE = 300;

  beforeAll(() => {
    service = new PhotoUploadService();
  });

  /**
   * Generate a test image buffer with specified dimensions
   * @param {number} width - Image width
   * @param {number} height - Image height
   * @returns {Promise<Buffer>} Image buffer
   */
  async function generateTestImage(width, height) {
    return await sharp({
      create: {
        width,
        height,
        channels: 3,
        background: {
          r: Math.floor(Math.random() * 256),
          g: Math.floor(Math.random() * 256),
          b: Math.floor(Math.random() * 256),
        },
      },
    })
      .jpeg({ quality: 80 })
      .toBuffer();
  }

  /**
   * **Feature: delivery-checkin-system, Property 39: Thumbnail Generation**
   *
   * Test: For any image, generateThumbnail SHALL produce a 300x300 thumbnail
   *
   * **Validates: Requirements 11.2**
   */
  it("should generate 300x300 thumbnail for any valid image", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Generate random image dimensions
        fc.integer({ min: 100, max: 4000 }), // width
        fc.integer({ min: 100, max: 4000 }), // height
        async (width, height) => {
          // Arrange: Create test image
          const imageBuffer = await generateTestImage(width, height);

          // Act: Generate thumbnail
          const thumbnailBuffer = await service.generateThumbnail(imageBuffer);

          // Assert: Thumbnail was generated
          expect(thumbnailBuffer).toBeDefined();
          expect(Buffer.isBuffer(thumbnailBuffer)).toBe(true);

          // Assert: Verify thumbnail dimensions
          const thumbnailMetadata = await sharp(thumbnailBuffer).metadata();
          expect(thumbnailMetadata.width).toBe(EXPECTED_THUMBNAIL_SIZE);
          expect(thumbnailMetadata.height).toBe(EXPECTED_THUMBNAIL_SIZE);
        }
      ),
      { numRuns: 20 } // Reduced runs due to image generation overhead
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 39: Thumbnail Generation**
   *
   * Test: Thumbnail SHALL maintain square aspect ratio regardless of input dimensions
   *
   * **Validates: Requirements 11.2**
   */
  it("should maintain square aspect ratio for any input dimensions", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Test various aspect ratios
        fc.oneof(
          // Landscape images
          fc.record({
            width: fc.integer({ min: 500, max: 2000 }),
            height: fc.integer({ min: 100, max: 400 }),
          }),
          // Portrait images
          fc.record({
            width: fc.integer({ min: 100, max: 400 }),
            height: fc.integer({ min: 500, max: 2000 }),
          }),
          // Square images
          fc.integer({ min: 100, max: 2000 }).map((size) => ({
            width: size,
            height: size,
          }))
        ),
        async ({ width, height }) => {
          // Arrange: Create test image
          const imageBuffer = await generateTestImage(width, height);

          // Act: Generate thumbnail
          const thumbnailBuffer = await service.generateThumbnail(imageBuffer);

          // Assert: Thumbnail is square
          const thumbnailMetadata = await sharp(thumbnailBuffer).metadata();
          expect(thumbnailMetadata.width).toBe(thumbnailMetadata.height);
          expect(thumbnailMetadata.width).toBe(EXPECTED_THUMBNAIL_SIZE);
        }
      ),
      { numRuns: 15 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 39: Thumbnail Generation**
   *
   * Test: Thumbnail SHALL be a valid JPEG image
   *
   * **Validates: Requirements 11.2**
   */
  it("should generate valid JPEG thumbnail", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 200, max: 1500 }),
        fc.integer({ min: 200, max: 1500 }),
        async (width, height) => {
          // Arrange: Create test image
          const imageBuffer = await generateTestImage(width, height);

          // Act: Generate thumbnail
          const thumbnailBuffer = await service.generateThumbnail(imageBuffer);

          // Assert: Thumbnail is valid JPEG
          const thumbnailMetadata = await sharp(thumbnailBuffer).metadata();
          expect(thumbnailMetadata.format).toBe("jpeg");
        }
      ),
      { numRuns: 15 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 39: Thumbnail Generation**
   *
   * Test: Thumbnail size SHALL be smaller than original image
   *
   * **Validates: Requirements 11.2**
   */
  it("should generate thumbnail smaller than original for large images", async () => {
    await fc.assert(
      fc.asyncProperty(
        // Only test with images larger than thumbnail size
        fc.integer({ min: 500, max: 3000 }),
        fc.integer({ min: 500, max: 3000 }),
        async (width, height) => {
          // Arrange: Create test image
          const imageBuffer = await generateTestImage(width, height);

          // Act: Generate thumbnail
          const thumbnailBuffer = await service.generateThumbnail(imageBuffer);

          // Assert: Thumbnail is smaller in bytes (for large images)
          // Note: This may not always be true for very small images
          if (
            width > EXPECTED_THUMBNAIL_SIZE * 2 &&
            height > EXPECTED_THUMBNAIL_SIZE * 2
          ) {
            expect(thumbnailBuffer.length).toBeLessThan(imageBuffer.length);
          }
        }
      ),
      { numRuns: 10 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 39: Thumbnail Generation**
   *
   * Test: Custom thumbnail size SHALL be respected when provided
   *
   * **Validates: Requirements 11.2**
   */
  it("should respect custom thumbnail size when provided", async () => {
    await fc.assert(
      fc.asyncProperty(
        fc.integer({ min: 100, max: 500 }), // custom size
        fc.integer({ min: 200, max: 1000 }), // image width
        fc.integer({ min: 200, max: 1000 }), // image height
        async (customSize, width, height) => {
          // Arrange: Create test image
          const imageBuffer = await generateTestImage(width, height);

          // Act: Generate thumbnail with custom size
          const thumbnailBuffer = await service.generateThumbnail(
            imageBuffer,
            customSize
          );

          // Assert: Thumbnail has custom dimensions
          const thumbnailMetadata = await sharp(thumbnailBuffer).metadata();
          expect(thumbnailMetadata.width).toBe(customSize);
          expect(thumbnailMetadata.height).toBe(customSize);
        }
      ),
      { numRuns: 15 }
    );
  });

  /**
   * **Feature: delivery-checkin-system, Property 39: Thumbnail Generation**
   *
   * Test: Thumbnail generation SHALL handle edge case dimensions
   */
  it("should handle edge case dimensions", async () => {
    const edgeCases = [
      { width: 100, height: 100 }, // Small square
      { width: 300, height: 300 }, // Exact thumbnail size
      { width: 301, height: 301 }, // Just above thumbnail size
      { width: 4000, height: 100 }, // Very wide
      { width: 100, height: 4000 }, // Very tall
    ];

    for (const { width, height } of edgeCases) {
      // Arrange: Create test image
      const imageBuffer = await generateTestImage(width, height);

      // Act: Generate thumbnail
      const thumbnailBuffer = await service.generateThumbnail(imageBuffer);

      // Assert: Thumbnail is 300x300
      const thumbnailMetadata = await sharp(thumbnailBuffer).metadata();
      expect(thumbnailMetadata.width).toBe(EXPECTED_THUMBNAIL_SIZE);
      expect(thumbnailMetadata.height).toBe(EXPECTED_THUMBNAIL_SIZE);
    }
  });
});
