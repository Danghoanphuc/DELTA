// scripts/start-cloudflare.js
// Script đơn giản để khởi động Cloudflare Tunnel và hiển thị URL

import { spawn, execSync } from "child_process";
import { fileURLToPath } from "url";
import { dirname } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const colors = {
  reset: "\x1b[0m",
  red: "\x1b[31m",
  green: "\x1b[32m",
  yellow: "\x1b[33m",
  blue: "\x1b[34m",
  cyan: "\x1b[36m",
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

const isWindows = process.platform === "win32";

// Determine command
let cloudflaredCmd = "cloudflared";
let useNpx = false;
let commandToRun = "";
let argsToRun = [];

try {
  execSync("cloudflared --version", { 
    stdio: "ignore",
    shell: isWindows 
  });
  // cloudflared có sẵn
  commandToRun = isWindows ? "cloudflared.cmd" : "cloudflared";
  argsToRun = ["tunnel", "--url", "http://localhost:8000"];
} catch {
  // Dùng npx
  useNpx = true;
  if (isWindows) {
    // Trên Windows, dùng cmd.exe /c để chạy npx
    commandToRun = "cmd.exe";
    argsToRun = ["/c", "npx", "cloudflared", "tunnel", "--url", "http://localhost:8000"];
  } else {
    commandToRun = "npx";
    argsToRun = ["cloudflared", "tunnel", "--url", "http://localhost:8000"];
  }
}

log("🚀 Đang khởi động Cloudflare Tunnel...\n", "blue");
log("💡 Cloudflare Tunnel KHÔNG CÓ warning page - VNPay có thể gọi được!\n", "yellow");
log(`   Command: ${commandToRun} ${argsToRun.join(" ")}\n`, "yellow");

const cloudflaredProcess = spawn(
  commandToRun,
  argsToRun,
  {
    detached: false,
    stdio: ["ignore", "pipe", "pipe"],
    shell: false, // Không dùng shell, dùng cmd.exe /c trực tiếp
  }
);

let tunnelUrl = null;
let urlFound = false;

// Parse URL từ output
const parseUrl = (text) => {
  // Chỉ lấy URL từ trycloudflare.com (ưu tiên)
  const trycloudflarePattern = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/g;
  const matches = text.match(trycloudflarePattern);
  
  if (matches && matches.length > 0) {
    // Lấy match đầu tiên và đảm bảo không phải www
    const url = matches[0].trim();
    if (url && !url.includes('www.') && url.includes('.trycloudflare.com')) {
      return url;
    }
  }
  
  return null;
};

cloudflaredProcess.stdout.on("data", (data) => {
  const text = data.toString();
  process.stdout.write(text);
  
  if (!urlFound) {
    const url = parseUrl(text);
    if (url) {
      tunnelUrl = url;
      urlFound = true;
      log(`\n\n${"=".repeat(60)}`, "green");
      log(`✅ Cloudflare Tunnel đã sẵn sàng!`, "green");
      log(`${"=".repeat(60)}\n`, "green");
      log(`🌐 Public URL: ${tunnelUrl}`, "cyan");
      log(`📡 IPN URL: ${tunnelUrl}/api/webhooks/vnpay/ipn\n`, "cyan");
      log(`💡 Bước tiếp theo:`, "yellow");
      log(`   1. Copy IPN URL ở trên`, "yellow");
      log(`   2. Cập nhật VNP_IPN_URL trong .env hoặc VNPay Merchant Portal`, "yellow");
      log(`   3. Restart server: npm run dev`, "yellow");
      log(`\n⚠️  Giữ terminal này MỞ để Cloudflare Tunnel tiếp tục chạy!`, "yellow");
      log(`   Nhấn Ctrl+C để dừng\n`, "yellow");
    }
  }
});

cloudflaredProcess.stderr.on("data", (data) => {
  const text = data.toString();
  process.stderr.write(text);
  
  if (!urlFound) {
    const url = parseUrl(text);
    if (url) {
      tunnelUrl = url;
      urlFound = true;
      log(`\n\n${"=".repeat(60)}`, "green");
      log(`✅ Cloudflare Tunnel đã sẵn sàng!`, "green");
      log(`${"=".repeat(60)}\n`, "green");
      log(`🌐 Public URL: ${tunnelUrl}`, "cyan");
      log(`📡 IPN URL: ${tunnelUrl}/api/webhooks/vnpay/ipn\n`, "cyan");
      log(`💡 Bước tiếp theo:`, "yellow");
      log(`   1. Copy IPN URL ở trên`, "yellow");
      log(`   2. Cập nhật VNP_IPN_URL trong .env hoặc VNPay Merchant Portal`, "yellow");
      log(`   3. Restart server: npm run dev`, "yellow");
      log(`\n⚠️  Giữ terminal này MỞ để Cloudflare Tunnel tiếp tục chạy!`, "yellow");
      log(`   Nhấn Ctrl+C để dừng\n`, "yellow");
    }
  }
});

cloudflaredProcess.on("error", (error) => {
  log(`\n❌ Lỗi: ${error.message}`, "red");
  if (error.message.includes("ENOENT")) {
    log("\n💡 Hãy cài đặt cloudflared:", "yellow");
    log("   npm install -g cloudflared", "yellow");
  }
  process.exit(1);
});

cloudflaredProcess.on("exit", (code) => {
  if (code !== 0 && code !== null) {
    log(`\n❌ Cloudflare Tunnel đã dừng với code: ${code}`, "red");
  }
});

// Handle Ctrl+C
process.on("SIGINT", () => {
  log("\n\n⚠️  Đang dừng Cloudflare Tunnel...", "yellow");
  cloudflaredProcess.kill();
  process.exit(0);
});

