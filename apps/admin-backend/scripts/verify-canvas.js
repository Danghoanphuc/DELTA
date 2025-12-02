import { createCanvas, GlobalFonts } from "@napi-rs/canvas";

console.log("🎨 [Verify] Starting Printz Graphics Engine check...");

try {
  // 1. Kiểm tra khởi tạo
  console.log("   - Testing allocation...");
  const canvas = createCanvas(100, 100);
  const ctx = canvas.getContext("2d");

  // 2. Kiểm tra vẽ và Color blending
  console.log("   - Testing rendering & blending...");
  ctx.fillStyle = "rgba(255, 0, 0, 0.5)";
  ctx.fillRect(0, 0, 50, 50);
  ctx.fillStyle = "rgba(0, 0, 255, 0.5)";
  ctx.fillRect(25, 25, 50, 50);

  // 3. Kiểm tra Font System
  console.log("   - Testing font system...");
  const families = GlobalFonts.families;
  // Ít nhất phải có font mặc định (sans-serif)
  if (!families || families.length === 0) {
    console.warn(
      "   ⚠️ Warning: No system fonts found. Text rendering might fail."
    );
  }

  // 4. Kiểm tra Encoding
  console.log("   - Testing PNG encoding...");
  const buffer = canvas.toBuffer("image/png");

  if (buffer.length > 100) {
    console.log("✅ [Verify] GRAPHICS ENGINE IS READY FOR STAGING.");
    process.exit(0);
  } else {
    throw new Error("Generated image buffer is invalid");
  }
} catch (error) {
  console.error("❌ [Verify] GRAPHICS ENGINE FAILED!");
  console.error("   Reason:", error.message);
  console.error(
    "   Solution: Check 'libc6-compat' or glibc version in Dockerfile."
  );
  process.exit(1);
}
