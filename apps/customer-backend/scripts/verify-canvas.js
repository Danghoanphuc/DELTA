import { createCanvas } from "@napi-rs/canvas";

console.log("🔍 [Verify] Checking Graphics Engine...");
try {
  const canvas = createCanvas(100, 100);
  const ctx = canvas.getContext("2d");
  ctx.fillStyle = "red";
  ctx.fillRect(0, 0, 50, 50);
  const buffer = canvas.toBuffer("image/png");
  if (buffer.length > 100) {
    console.log("✅ Engine Ready.");
    process.exit(0);
  } else {
    throw new Error("Invalid buffer");
  }
} catch (e) {
  console.error("❌ Engine Failed:", e.message);
  process.exit(1);
}
