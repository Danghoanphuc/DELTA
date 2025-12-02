console.log("Ìæ® [Verify] Checking Graphics Engine...");
try {
  const { createCanvas } = require('@napi-rs/canvas');
  const canvas = createCanvas(100, 100);
  const ctx = canvas.getContext('2d');
  ctx.fillStyle = 'red'; ctx.fillRect(0,0,50,50);
  if (canvas.toBuffer('image/png').length > 100) {
    console.log("‚úÖ Engine Ready."); process.exit(0);
  } else throw new Error("Invalid buffer");
} catch (e) {
  console.error("‚ùå Engine Failed:", e.message); process.exit(1);
}
