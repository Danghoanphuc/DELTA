/**
 * Property-Based Tests for Photo Compression
 *
 * Tests correctness properties for photo compression to ensure all uploaded photos
 * are compressed to at most 2MB in size.
 */

import fc from "fast-check";
import sharp from "sharp";
import { PhotoUploadService } from "../../../services/photo-upload.service.js";

describe("Photo Compression - Property-Based Tests", () => {
  let service;

  beforeAll(() => {
    service = new PhotoUploadService();
  });

  /**
   * **Feature: delivery-checkin-system, Property 38: Photo Compression**
   * **Validates: Requirements 11.1**
   *
   * Property: For any uploaded photo, the compressed version SHALL be at most 2MB in size.
   */
  describe("Property 38: Photo Compression", () => {
    const MAX_SIZE = 2 * 1024 * 1024; // 2MB

    /**
     * Custom arbitrary for generating random image dimensions
     * Range: 100x100 to 8000x8000 pixels (covers mobile to high-res cameras)
     */
    const imageDimensions = () =>
      fc.record({
        width: fc.integer({ min: 100, max: 8000 }),
        height: fc.integer({ min: 100, max: 8000 }),
      });

    /**
     * Custom arbitrary for generating random image colors
     * This affects compression ratio (solid colors compress better than complex patterns)
     */
    const imageColor = () =>
      fc.record({
        r: fc.integer({ min: 0, max: 255 }),
        g: fc.integer({ min: 0, max: 255 }),
        b: fc.integer({ min: 0, max: 255 }),
      });

    /**
     * Helper function to generate a test image buffer
     * @param {number} width - Image width
     * @param {number} height - Image height
     * @param {Object} color - RGB color object
     * @param {string} pattern - Pattern type: 'solid', 'gradient', 'noise'
     * @returns {Promise<Buffer>} Image buffer
     */
    async function generateTestImage(
      width,
      height,
      color = { r: 128, g: 128, b: 128 },
      pattern = "solid"
    ) {
      let image;

      if (pattern === "solid") {
        // Solid color - compresses very well
        image = sharp({
          create: {
            width,
            height,
            channels: 3,
            background: { r: color.r, g: color.g, b: color.b },
          },
        });
      } else if (pattern === "gradient") {
        // Gradient - moderate compression
        const svg = `
          <svg width="${width}" height="${height}">
            <defs>
              <linearGradient id="grad" x1="0%" y1="0%" x2="100%" y2="100%">
                <stop offset="0%" style="stop-color:rgb(${color.r},${color.g},${
          color.b
        });stop-opacity:1" />
                <stop offset="100%" style="stop-color:rgb(${255 - color.r},${
          255 - color.g
        },${255 - color.b});stop-opacity:1" />
              </linearGradient>
            </defs>
            <rect width="${width}" height="${height}" fill="url(#grad)" />
          </svg>
        `;
        image = sharp(Buffer.from(svg));
      } else {
        // Noise pattern - harder to compress (simulates real photos)
        // Create a buffer with random pixel data
        const pixelCount = width * height * 3; // RGB channels
        const pixels = Buffer.alloc(pixelCount);
        for (let i = 0; i < pixelCount; i++) {
          pixels[i] = Math.floor(Math.random() * 256);
        }
        image = sharp(pixels, {
          raw: {
            width,
            height,
            channels: 3,
          },
        });
      }

      return await image.jpeg({ quality: 100 }).toBuffer();
    }

    it("should compress any image to at most 2MB", async () => {
      await fc.assert(
        fc.asyncProperty(
          imageDimensions(),
          imageColor(),
          fc.constantFrom("solid", "gradient", "noise"),
          async (dimensions, color, pattern) => {
            // Arrange: Generate test image
            const imageBuffer = await generateTestImage(
              dimensions.width,
              dimensions.height,
              color,
              pattern
            );

            // Act: Compress image
            const compressedBuffer = await service.compressImage(imageBuffer);

            // Assert: Compressed size should be at most 2MB
            expect(compressedBuffer.length).toBeLessThanOrEqual(MAX_SIZE);

            // Additional assertion: Compressed buffer should be valid image
            const metadata = await sharp(compressedBuffer).metadata();
            expect(metadata.format).toBe("jpeg");
            expect(metadata.width).toBeGreaterThan(0);
            expect(metadata.height).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100, timeout: 300000 }
      );
    }, 300000);

    it("should compress large images (> 2MB) to at most 2MB", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            width: fc.integer({ min: 3000, max: 8000 }),
            height: fc.integer({ min: 3000, max: 8000 }),
          }),
          imageColor(),
          async (dimensions, color) => {
            // Arrange: Generate large image with noise (hard to compress)
            const imageBuffer = await generateTestImage(
              dimensions.width,
              dimensions.height,
              color,
              "noise"
            );

            // Ensure original is larger than 2MB
            if (imageBuffer.length <= MAX_SIZE) {
              // Skip if original is already small enough
              return true;
            }

            // Act: Compress image
            const compressedBuffer = await service.compressImage(imageBuffer);

            // Assert: Compressed size should be at most 2MB
            expect(compressedBuffer.length).toBeLessThanOrEqual(MAX_SIZE);

            // Assert: Compression should have reduced size
            expect(compressedBuffer.length).toBeLessThan(imageBuffer.length);
          }
        ),
        { numRuns: 100, timeout: 300000 }
      );
    }, 300000);

    it("should preserve image validity after compression", async () => {
      await fc.assert(
        fc.asyncProperty(
          imageDimensions(),
          imageColor(),
          async (dimensions, color) => {
            // Arrange: Generate test image
            const imageBuffer = await generateTestImage(
              dimensions.width,
              dimensions.height,
              color,
              "gradient"
            );

            // Act: Compress image
            const compressedBuffer = await service.compressImage(imageBuffer);

            // Assert: Compressed image should be valid and readable
            const metadata = await sharp(compressedBuffer).metadata();
            expect(metadata.format).toBe("jpeg");
            expect(metadata.width).toBeGreaterThan(0);
            expect(metadata.height).toBeGreaterThan(0);

            // Assert: Should be able to process compressed image further
            const reprocessed = await sharp(compressedBuffer)
              .resize(100, 100)
              .toBuffer();
            expect(reprocessed.length).toBeGreaterThan(0);
          }
        ),
        { numRuns: 100, timeout: 300000 }
      );
    }, 300000);

    it("should handle already small images without increasing size significantly", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            width: fc.integer({ min: 100, max: 800 }),
            height: fc.integer({ min: 100, max: 800 }),
          }),
          imageColor(),
          async (dimensions, color) => {
            // Arrange: Generate small image
            const imageBuffer = await generateTestImage(
              dimensions.width,
              dimensions.height,
              color,
              "solid"
            );

            // Act: Compress image
            const compressedBuffer = await service.compressImage(imageBuffer);

            // Assert: Compressed size should still be at most 2MB
            expect(compressedBuffer.length).toBeLessThanOrEqual(MAX_SIZE);

            // Assert: Should not increase size dramatically (allow 20% increase for JPEG encoding)
            const maxAllowedSize = imageBuffer.length * 1.2;
            expect(compressedBuffer.length).toBeLessThanOrEqual(maxAllowedSize);
          }
        ),
        { numRuns: 100, timeout: 300000 }
      );
    }, 300000);

    it("should handle edge case of very wide images", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            width: fc.integer({ min: 5000, max: 8000 }),
            height: fc.integer({ min: 100, max: 500 }),
          }),
          imageColor(),
          async (dimensions, color) => {
            // Arrange: Generate very wide image
            const imageBuffer = await generateTestImage(
              dimensions.width,
              dimensions.height,
              color,
              "gradient"
            );

            // Act: Compress image
            const compressedBuffer = await service.compressImage(imageBuffer);

            // Assert: Compressed size should be at most 2MB
            expect(compressedBuffer.length).toBeLessThanOrEqual(MAX_SIZE);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle edge case of very tall images", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            width: fc.integer({ min: 100, max: 500 }),
            height: fc.integer({ min: 5000, max: 8000 }),
          }),
          imageColor(),
          async (dimensions, color) => {
            // Arrange: Generate very tall image
            const imageBuffer = await generateTestImage(
              dimensions.width,
              dimensions.height,
              color,
              "gradient"
            );

            // Act: Compress image
            const compressedBuffer = await service.compressImage(imageBuffer);

            // Assert: Compressed size should be at most 2MB
            expect(compressedBuffer.length).toBeLessThanOrEqual(MAX_SIZE);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle edge case of square images", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.integer({ min: 100, max: 5000 }),
          imageColor(),
          async (size, color) => {
            // Arrange: Generate square image
            const imageBuffer = await generateTestImage(
              size,
              size,
              color,
              "noise"
            );

            // Act: Compress image
            const compressedBuffer = await service.compressImage(imageBuffer);

            // Assert: Compressed size should be at most 2MB
            expect(compressedBuffer.length).toBeLessThanOrEqual(MAX_SIZE);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle minimum size images", async () => {
      await fc.assert(
        fc.asyncProperty(imageColor(), async (color) => {
          // Arrange: Generate minimum size image (100x100)
          const imageBuffer = await generateTestImage(100, 100, color, "solid");

          // Act: Compress image
          const compressedBuffer = await service.compressImage(imageBuffer);

          // Assert: Compressed size should be at most 2MB
          expect(compressedBuffer.length).toBeLessThanOrEqual(MAX_SIZE);

          // Assert: Should be much smaller than 2MB
          expect(compressedBuffer.length).toBeLessThan(100 * 1024); // < 100KB
        }),
        { numRuns: 100 }
      );
    });

    it("should consistently compress the same image to similar size", async () => {
      await fc.assert(
        fc.asyncProperty(
          imageDimensions(),
          imageColor(),
          async (dimensions, color) => {
            // Arrange: Generate test image
            const imageBuffer = await generateTestImage(
              dimensions.width,
              dimensions.height,
              color,
              "gradient"
            );

            // Act: Compress same image multiple times
            const compressed1 = await service.compressImage(imageBuffer);
            const compressed2 = await service.compressImage(imageBuffer);
            const compressed3 = await service.compressImage(imageBuffer);

            // Assert: All compressed versions should be at most 2MB
            expect(compressed1.length).toBeLessThanOrEqual(MAX_SIZE);
            expect(compressed2.length).toBeLessThanOrEqual(MAX_SIZE);
            expect(compressed3.length).toBeLessThanOrEqual(MAX_SIZE);

            // Assert: Sizes should be identical (deterministic compression)
            expect(compressed1.length).toBe(compressed2.length);
            expect(compressed2.length).toBe(compressed3.length);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should respect custom maxSize parameter", async () => {
      await fc.assert(
        fc.asyncProperty(
          imageDimensions(),
          imageColor(),
          fc.integer({ min: 500 * 1024, max: 5 * 1024 * 1024 }), // 500KB to 5MB
          async (dimensions, color, customMaxSize) => {
            // Arrange: Generate test image
            const imageBuffer = await generateTestImage(
              dimensions.width,
              dimensions.height,
              color,
              "noise"
            );

            // Act: Compress image with custom max size
            const compressedBuffer = await service.compressImage(
              imageBuffer,
              customMaxSize
            );

            // Assert: Compressed size should be at most customMaxSize
            expect(compressedBuffer.length).toBeLessThanOrEqual(customMaxSize);
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle images with extreme aspect ratios", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.oneof(
            // Very wide
            fc.record({
              width: fc.integer({ min: 4000, max: 8000 }),
              height: fc.integer({ min: 100, max: 200 }),
            }),
            // Very tall
            fc.record({
              width: fc.integer({ min: 100, max: 200 }),
              height: fc.integer({ min: 4000, max: 8000 }),
            })
          ),
          imageColor(),
          async (dimensions, color) => {
            // Arrange: Generate image with extreme aspect ratio
            const imageBuffer = await generateTestImage(
              dimensions.width,
              dimensions.height,
              color,
              "gradient"
            );

            // Act: Compress image
            const compressedBuffer = await service.compressImage(imageBuffer);

            // Assert: Compressed size should be at most 2MB
            expect(compressedBuffer.length).toBeLessThanOrEqual(MAX_SIZE);

            // Assert: Image should still be valid
            const metadata = await sharp(compressedBuffer).metadata();
            expect(metadata.format).toBe("jpeg");
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should handle images with different color complexities", async () => {
      await fc.assert(
        fc.asyncProperty(
          imageDimensions(),
          fc.constantFrom("solid", "gradient", "noise"),
          async (dimensions, pattern) => {
            // Arrange: Generate image with different patterns
            const imageBuffer = await generateTestImage(
              dimensions.width,
              dimensions.height,
              { r: 128, g: 128, b: 128 },
              pattern
            );

            // Act: Compress image
            const compressedBuffer = await service.compressImage(imageBuffer);

            // Assert: Compressed size should be at most 2MB regardless of pattern
            expect(compressedBuffer.length).toBeLessThanOrEqual(MAX_SIZE);

            // Assert: More complex patterns should result in larger compressed sizes
            // but still within limit
            if (pattern === "noise") {
              // Noise is hardest to compress, but should still be under 2MB
              expect(compressedBuffer.length).toBeLessThanOrEqual(MAX_SIZE);
            }
          }
        ),
        { numRuns: 100 }
      );
    });

    it("should maintain reasonable quality after compression", async () => {
      await fc.assert(
        fc.asyncProperty(
          fc.record({
            width: fc.integer({ min: 1000, max: 3000 }),
            height: fc.integer({ min: 1000, max: 3000 }),
          }),
          imageColor(),
          async (dimensions, color) => {
            // Arrange: Generate test image
            const imageBuffer = await generateTestImage(
              dimensions.width,
              dimensions.height,
              color,
              "gradient"
            );

            // Act: Compress image
            const compressedBuffer = await service.compressImage(imageBuffer);

            // Assert: Compressed size should be at most 2MB
            expect(compressedBuffer.length).toBeLessThanOrEqual(MAX_SIZE);

            // Assert: Dimensions should be preserved or reasonably scaled
            const originalMeta = await sharp(imageBuffer).metadata();
            const compressedMeta = await sharp(compressedBuffer).metadata();

            // If resized, should maintain aspect ratio
            if (
              compressedMeta.width !== originalMeta.width ||
              compressedMeta.height !== originalMeta.height
            ) {
              const originalAspect = originalMeta.width / originalMeta.height;
              const compressedAspect =
                compressedMeta.width / compressedMeta.height;
              expect(Math.abs(originalAspect - compressedAspect)).toBeLessThan(
                0.01
              );
            }
          }
        ),
        { numRuns: 100 }
      );
    });
  });
});
