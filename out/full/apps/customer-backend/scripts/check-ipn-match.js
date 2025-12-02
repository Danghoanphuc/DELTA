// scripts/check-ipn-match.js
// Script kiểm tra IPN URL trong .env có khớp với URL đã đăng ký trong VNPay không

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
  log("🔍 Kiểm tra IPN URL trong .env...\n", "blue");

  try {
    const envContent = readFileSync(ENV_FILE, "utf-8");
    const ipnUrlMatch = envContent.match(/^VNP_IPN_URL="?([^"]+)"?/m);
    
    if (!ipnUrlMatch) {
      log("❌ Không tìm thấy VNP_IPN_URL trong .env!", "red");
      process.exit(1);
    }

    const ipnUrl = ipnUrlMatch[1];
    log(`📋 IPN URL trong .env:`, "cyan");
    log(`   ${ipnUrl}\n`, "reset");

    // Extract domain
    const urlMatch = ipnUrl.match(/https?:\/\/([^\/]+)/);
    if (!urlMatch) {
      log("❌ IPN URL không hợp lệ!", "red");
      process.exit(1);
    }

    const domain = urlMatch[1];
    log(`🌐 Domain: ${domain}`, "cyan");

    log("\n✅ Checklist:", "blue");
    log("   1. ✅ IPN URL đã có trong .env", "green");
    log("   2. ⚠️  Đảm bảo IPN URL này ĐÃ ĐĂNG KÝ trong VNPay Merchant Portal", "yellow");
    log("   3. ⚠️  Đảm bảo Cloudflare Tunnel đang chạy với domain này", "yellow");
    log("   4. ⚠️  Restart server để load .env mới", "yellow");

    log("\n💡 Nếu IPN URL khác với URL đã đăng ký:", "yellow");
    log("   - Option 1: Update .env với URL đã đăng ký:", "yellow");
    log(`      node scripts/update-ipn-url.js <cloudflare-url>`, "yellow");
    log("   - Option 2: Update IPN URL trong VNPay Merchant Portal", "yellow");
    log("      https://sandbox.vnpayment.vn/vnpaygw-sit-testing/ipn", "yellow");

  } catch (error) {
    log(`❌ Lỗi: ${error.message}`, "red");
    process.exit(1);
  }
}

main();

