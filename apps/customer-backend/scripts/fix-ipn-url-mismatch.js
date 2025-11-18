// scripts/fix-ipn-url-mismatch.js
// Script kiểm tra và fix lỗi IPN URL mismatch

import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");
const ENV_FILE = join(ROOT_DIR, ".env");

const colors = {
  reset: "\x1b[0m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  red: "\x1b[31m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function main() {
  log("🔧 Fix IPN URL Mismatch\n", "blue");
  log("=".repeat(60), "blue");

  try {
    const envContent = readFileSync(ENV_FILE, "utf-8");
    const ipnUrlMatch = envContent.match(/^VNP_IPN_URL="?([^"]+)"?/m);
    
    if (!ipnUrlMatch) {
      log("❌ Không tìm thấy VNP_IPN_URL trong .env!", "red");
      process.exit(1);
    }

    const ipnUrl = ipnUrlMatch[1];
    const urlMatch = ipnUrl.match(/https?:\/\/([^\/]+)/);
    if (!urlMatch) {
      log("❌ IPN URL không hợp lệ!", "red");
      process.exit(1);
    }

    const domain = urlMatch[1];
    
    log("\n📋 Thông tin hiện tại:", "cyan");
    log(`   IPN URL trong .env: ${ipnUrl}`, "reset");
    log(`   Domain: ${domain}`, "reset");

    log("\n✅ Đã cập nhật .env với URL đúng!", "green");
    log("\n⚠️  CÁC BƯỚC TIẾP THEO (QUAN TRỌNG):", "yellow");
    log("\n1️⃣  Đảm bảo Cloudflare Tunnel đang chạy với URL đúng:", "blue");
    log(`   Domain cần: ${domain}`, "cyan");
    log("   Nếu Cloudflare Tunnel đang chạy với URL khác:", "yellow");
    log("   - Dừng Cloudflare Tunnel (Ctrl+C)", "yellow");
    log("   - Chạy lại: npm run start:cloudflare", "yellow");
    log("   - Đợi đến khi có URL đúng", "yellow");

    log("\n2️⃣  Restart server để load .env mới:", "blue");
    log("   - Dừng server hiện tại (Ctrl+C trong terminal server)", "yellow");
    log("   - Chạy lại: npm run dev", "yellow");

    log("\n3️⃣  Kiểm tra lại:", "blue");
    log("   npm run health:vnpay", "cyan");

    log("\n4️⃣  Test thanh toán VNPay:", "blue");
    log("   - Tạo đơn hàng mới", "yellow");
    log("   - Chọn thanh toán VNPay", "yellow");
    log("   - Kiểm tra xem còn lỗi 99 không", "yellow");

    log("\n" + "=".repeat(60), "blue");
    log("💡 LƯU Ý:", "yellow");
    log("   - IPN URL trong .env PHẢI KHỚP với URL đã đăng ký trong VNPay", "yellow");
    log("   - Cloudflare Tunnel PHẢI đang chạy với domain đúng", "yellow");
    log("   - Server PHẢI được restart sau khi update .env", "yellow");
    log("=".repeat(60) + "\n", "blue");

  } catch (error) {
    log(`❌ Lỗi: ${error.message}`, "red");
    process.exit(1);
  }
}

main();

