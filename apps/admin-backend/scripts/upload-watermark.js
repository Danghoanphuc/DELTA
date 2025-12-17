// apps/admin-backend/scripts/upload-watermark.js
// Script để upload watermark lên Cloudinary (chạy 1 lần)
//
// Usage: node scripts/upload-watermark.js
//
// Yêu cầu:
// - File watermark: src/assets/logo-watermark.png
// - File phải là PNG với transparent background
// - Resolution cao (ít nhất 1000px width) để không bị vỡ khi overlay

import fs from "fs";
import path from "path";
import { fileURLToPath } from "url";
import dotenv from "dotenv";
import { v2 as cloudinary } from "cloudinary";

// Load env
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const WATERMARK_PATH = path.join(__dirname, "../src/assets/logo-watermark.png");
const WATERMARK_PUBLIC_ID = "watermarks/printz-logo";

async function uploadWatermark() {
  console.log("=== Upload Watermark to Cloudinary ===\n");

  // Check file exists
  if (!fs.existsSync(WATERMARK_PATH)) {
    console.error(`❌ Watermark file not found: ${WATERMARK_PATH}`);
    console.log("\nPlease create a watermark file at:");
    console.log("  apps/admin-backend/src/assets/logo-watermark.png");
    console.log("\nRequirements:");
    console.log("  - PNG format with transparent background");
    console.log("  - High resolution (at least 1000px width)");
    console.log("  - Clean edges, no artifacts");
    process.exit(1);
  }

  // Check env
  if (
    !process.env.CLOUDINARY_CLOUD_NAME ||
    !process.env.CLOUDINARY_API_KEY ||
    !process.env.CLOUDINARY_API_SECRET
  ) {
    console.error("❌ Missing Cloudinary credentials in .env");
    console.log("\nRequired env variables:");
    console.log("  CLOUDINARY_CLOUD_NAME");
    console.log("  CLOUDINARY_API_KEY");
    console.log("  CLOUDINARY_API_SECRET");
    process.exit(1);
  }

  // Configure Cloudinary directly
  cloudinary.config({
    cloud_name: process.env.CLOUDINARY_CLOUD_NAME,
    api_key: process.env.CLOUDINARY_API_KEY,
    api_secret: process.env.CLOUDINARY_API_SECRET,
  });

  // Read watermark file
  const buffer = fs.readFileSync(WATERMARK_PATH);
  console.log(`📁 Watermark file: ${WATERMARK_PATH}`);
  console.log(`📦 File size: ${(buffer.length / 1024).toFixed(2)} KB`);

  try {
    // Upload to Cloudinary
    console.log("\n⏳ Uploading to Cloudinary...");

    const result = await new Promise((resolve, reject) => {
      const uploadStream = cloudinary.uploader.upload_stream(
        {
          public_id: WATERMARK_PUBLIC_ID,
          resource_type: "image",
          overwrite: true,
          format: "png", // Giữ nguyên PNG để có transparency
        },
        (error, result) => {
          if (error) reject(error);
          else resolve(result);
        }
      );
      uploadStream.end(buffer);
    });

    console.log("\n✅ Watermark uploaded successfully!");
    console.log(`   Public ID: ${result.public_id}`);
    console.log(`   URL: ${result.secure_url}`);
    console.log(`   Size: ${result.width}x${result.height}`);
    console.log(`   Format: ${result.format}`);

    console.log("\n📝 Next steps:");
    console.log("   1. Verify watermark at the URL above");
    console.log("   2. Restart backend server");
    console.log(
      "   3. Test upload an image - watermark will be added automatically"
    );
  } catch (error) {
    console.error("\n❌ Upload failed:", error.message);
    process.exit(1);
  }
}

uploadWatermark();
