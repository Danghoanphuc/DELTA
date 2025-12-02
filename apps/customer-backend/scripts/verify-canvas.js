console.log("Ìæ® [Verify] Starting Printz Graphics Engine check...");
try {
  const { createCanvas, GlobalFonts } = require('@napi-rs/canvas');
  
  console.log("   - Testing allocation...");
  const canvas = createCanvas(100, 100);
  const ctx = canvas.getContext('2d');
  
  console.log("   - Testing rendering...");
  ctx.fillStyle = 'red';
  ctx.fillRect(0, 0, 50, 50);
  
  console.log("   - Testing font system...");
  const families = GlobalFonts.families;
  if (!families || families.length === 0) console.warn("   ‚ö†Ô∏è No system fonts found.");

  const buffer = canvas.toBuffer('image/png');
  if (buffer.length > 100) {
    console.log("‚úÖ [Verify] GRAPHICS ENGINE IS READY.");
    process.exit(0);
  } else {
    throw new Error("Invalid buffer");
  }
} catch (error) {
  console.error("‚ùå [Verify] FAILED:", error.message);
  process.exit(1);
}
