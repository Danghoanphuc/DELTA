/**
 * Unit Tests for PhotoUploadService
 *
 * Tests basic functionality of photo upload, compression, and thumbnail generation
 */

import { PhotoUploadService } from "../photo-upload.service.js";
import sharp from "sharp";
import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

describe("PhotoUploadService - Unit Tests", () => {
  let service;

  beforeAll(() => {
    service = new PhotoUploadService();
  });

  describe("Image Compression", () => {
    it("should compress image to under 2MB", async () => {
      // Create a test image (1000x1000 white image)
      const testImage = await sharp({
        create: {
          width: 1000,
          height: 1000,
          channels: 3,
          background: { r: 255, g: 255, b: 255 },
        },
      })
        .jpeg()
        .toBuffer();

      // Compress the image
      const compressed = await service.compressImage(testImage);

      // Assert: Compressed size should be under 2MB
      expect(compressed.length).toBeLessThanOrEqual(2 * 1024 * 1024);
      expect(compressed).toBeInstanceOf(Buffer);
    });

    it("should maintain image quality during compression", async () => {
      // Create a test image
      const testImage = await sharp({
        create: {
          width: 500,
          height: 500,
          channels: 3,
          background: { r: 100, g: 150, b: 200 },
        },
      })
        .jpeg()
        .toBuffer();

      // Compress the image
      const compressed = await service.compressImage(testImage);

      // Verify it's still a valid image
      const metadata = await sharp(compressed).metadata();
      expect(metadata.format).toBe("jpeg");
      expect(metadata.width).toBeGreaterThan(0);
      expect(metadata.height).toBeGreaterThan(0);
    });

    it("should handle already small images", async () => {
      // Create a small test image (100x100)
      const testImage = await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 3,
          background: { r: 255, g: 255, b: 255 },
        },
      })
        .jpeg()
        .toBuffer();

      // Compress the image
      const compressed = await service.compressImage(testImage);

      // Assert: Should still be under 2MB
      expect(compressed.length).toBeLessThanOrEqual(2 * 1024 * 1024);
    });
  });

  describe("Thumbnail Generation", () => {
    it("should generate 300x300 thumbnail", async () => {
      // Create a test image (1000x1000)
      const testImage = await sharp({
        create: {
          width: 1000,
          height: 1000,
          channels: 3,
          background: { r: 255, g: 0, b: 0 },
        },
      })
        .jpeg()
        .toBuffer();

      // Generate thumbnail
      const thumbnail = await service.generateThumbnail(testImage);

      // Verify thumbnail dimensions
      const metadata = await sharp(thumbnail).metadata();
      expect(metadata.width).toBe(300);
      expect(metadata.height).toBe(300);
      expect(metadata.format).toBe("jpeg");
    });

    it("should crop non-square images to square thumbnail", async () => {
      // Create a rectangular test image (1000x500)
      const testImage = await sharp({
        create: {
          width: 1000,
          height: 500,
          channels: 3,
          background: { r: 0, g: 255, b: 0 },
        },
      })
        .jpeg()
        .toBuffer();

      // Generate thumbnail
      const thumbnail = await service.generateThumbnail(testImage);

      // Verify thumbnail is square
      const metadata = await sharp(thumbnail).metadata();
      expect(metadata.width).toBe(300);
      expect(metadata.height).toBe(300);
    });

    it("should generate thumbnail with custom size", async () => {
      // Create a test image
      const testImage = await sharp({
        create: {
          width: 800,
          height: 800,
          channels: 3,
          background: { r: 0, g: 0, b: 255 },
        },
      })
        .jpeg()
        .toBuffer();

      // Generate thumbnail with custom size
      const thumbnail = await service.generateThumbnail(testImage, 150);

      // Verify thumbnail dimensions
      const metadata = await sharp(thumbnail).metadata();
      expect(metadata.width).toBe(150);
      expect(metadata.height).toBe(150);
    });
  });

  describe("EXIF Data Extraction", () => {
    it("should extract EXIF data from image", async () => {
      // Create a test image
      const testImage = await sharp({
        create: {
          width: 500,
          height: 500,
          channels: 3,
          background: { r: 255, g: 255, b: 255 },
        },
      })
        .jpeg()
        .toBuffer();

      // Extract EXIF data
      const exifData = await service.extractEXIFData(testImage);

      // Should return an object (may be empty for generated images)
      expect(exifData).toBeDefined();
      expect(typeof exifData).toBe("object");
    });

    it("should handle images without EXIF data", async () => {
      // Create a simple test image without EXIF
      const testImage = await sharp({
        create: {
          width: 100,
          height: 100,
          channels: 3,
          background: { r: 128, g: 128, b: 128 },
        },
      })
        .jpeg()
        .toBuffer();

      // Extract EXIF data
      const exifData = await service.extractEXIFData(testImage);

      // Should return empty object or object without GPS data
      expect(exifData).toBeDefined();
      expect(typeof exifData).toBe("object");
    });
  });

  describe("Public ID Generation", () => {
    it("should generate unique public IDs", () => {
      const metadata1 = { userId: "user123", filename: "photo1.jpg" };
      const metadata2 = { userId: "user123", filename: "photo2.jpg" };

      const id1 = service.generatePublicId(metadata1, false);
      const id2 = service.generatePublicId(metadata2, false);

      // IDs should be different
      expect(id1).not.toBe(id2);
      expect(id1).toContain("user123");
      expect(id1).toContain("main");
    });

    it("should differentiate between main and thumbnail", () => {
      const metadata = { userId: "user456", filename: "photo.jpg" };

      const mainId = service.generatePublicId(metadata, false);
      const thumbId = service.generatePublicId(metadata, true);

      // Should have different suffixes
      expect(mainId).toContain("main");
      expect(thumbId).toContain("thumb");
    });

    it("should handle missing userId", () => {
      const metadata = { filename: "photo.jpg" };

      const id = service.generatePublicId(metadata, false);

      // Should use 'anonymous' as fallback
      expect(id).toContain("anonymous");
    });
  });

  describe("Service Configuration", () => {
    it("should have correct constants", () => {
      expect(service.MAX_FILE_SIZE).toBe(2 * 1024 * 1024);
      expect(service.THUMBNAIL_SIZE).toBe(300);
      expect(service.SIGNED_URL_EXPIRATION).toBe(365 * 24 * 60 * 60);
      expect(service.FOLDER_PATH).toBe("printz/delivery-checkins");
    });
  });
});
