// scripts/get-cloudflare-url.js
// Script lấy Cloudflare Tunnel URL từ process đang chạy

import { execSync } from "child_process";

console.log("🔍 Đang tìm Cloudflare Tunnel URL...\n");

try {
  // Cloudflared không có API như ngrok
  // URL được hiển thị trong output khi start
  // Hãy xem output từ terminal đang chạy cloudflared
  
  console.log("⚠️  Cloudflared không có API để lấy URL tự động");
  console.log("\n💡 Hãy xem terminal đang chạy cloudflared và tìm dòng:");
  console.log("   'https://abc123.trycloudflare.com'");
  console.log("\nSau đó chạy:");
  console.log("   node scripts/update-ipn-url.js https://abc123.trycloudflare.com");
  
  // Thử tìm trong process list
  try {
    const processes = execSync("ps aux | grep cloudflared | grep -v grep", { encoding: "utf-8" });
    if (processes) {
      console.log("\n✅ Cloudflared đang chạy!");
      console.log("   Xem output từ terminal cloudflared để lấy URL");
    }
  } catch {
    console.log("\n⚠️  Không tìm thấy cloudflared process");
  }
} catch (error) {
  console.error("❌ Lỗi:", error.message);
}

