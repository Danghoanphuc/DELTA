// scripts/start-cloudflare-with-target-url.js
// Script khởi động Cloudflare Tunnel và đợi đến khi có URL đúng

import { spawn, execSync } from "child_process";
import { readFileSync } from "fs";
import { fileURLToPath } from "url";
import { dirname, join } from "path";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const ROOT_DIR = join(__dirname, "..");
const ENV_FILE = join(ROOT_DIR, ".env");

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

// Đọc target URL từ .env
function getTargetUrl() {
  try {
    const envContent = readFileSync(ENV_FILE, "utf-8");
    const ipnUrlMatch = envContent.match(/^VNP_IPN_URL="?https?:\/\/([^\/]+)/m);
    if (ipnUrlMatch) {
      return ipnUrlMatch[1]; // Domain only
    }
  } catch (error) {
    // Ignore
  }
  return null;
}

// Determine command
let commandToRun = "";
let argsToRun = [];

try {
  execSync("cloudflared --version", { 
    stdio: "ignore",
    shell: isWindows 
  });
  commandToRun = isWindows ? "cloudflared.cmd" : "cloudflared";
  argsToRun = ["tunnel", "--url", "http://localhost:8000"];
} catch {
  if (isWindows) {
    commandToRun = "cmd.exe";
    argsToRun = ["/c", "npx", "cloudflared", "tunnel", "--url", "http://localhost:8000"];
  } else {
    commandToRun = "npx";
    argsToRun = ["cloudflared", "tunnel", "--url", "http://localhost:8000"];
  }
}

const targetDomain = getTargetUrl();

log("🚀 Đang khởi động Cloudflare Tunnel...\n", "blue");
log("💡 Cloudflare Tunnel KHÔNG CÓ warning page - VNPay có thể gọi được!\n", "yellow");

if (targetDomain) {
  log(`🎯 Target domain từ .env: ${targetDomain}`, "cyan");
  log(`   Script sẽ đợi đến khi có URL khớp với domain này\n`, "yellow");
} else {
  log("⚠️  Không tìm thấy target domain trong .env", "yellow");
  log("   Script sẽ hiển thị URL đầu tiên nhận được\n", "yellow");
}

let attempts = 0;
const maxAttempts = 10;

function startCloudflare() {
  attempts++;
  
  if (attempts > maxAttempts) {
    log(`\n❌ Đã thử ${maxAttempts} lần nhưng không có URL khớp!`, "red");
    log("💡 Hãy:", "yellow");
    log("   1. Kiểm tra lại IPN URL trong .env", "yellow");
    log("   2. Hoặc update IPN URL trong VNPay với URL mới", "yellow");
    process.exit(1);
  }

  if (attempts > 1) {
    log(`\n🔄 Lần thử ${attempts}/${maxAttempts}...\n`, "yellow");
  }

  const cloudflaredProcess = spawn(
    commandToRun,
    argsToRun,
    {
      detached: false,
      stdio: ["ignore", "pipe", "pipe"],
      shell: false,
    }
  );

  let tunnelUrl = null;
  let urlFound = false;
  let outputBuffer = "";

  const parseUrl = (text) => {
    const trycloudflarePattern = /https:\/\/[a-z0-9-]+\.trycloudflare\.com/g;
    const matches = text.match(trycloudflarePattern);
    if (matches && matches.length > 0) {
      const url = matches[0].trim();
      if (url && !url.includes('www.') && url.includes('.trycloudflare.com')) {
        return url;
      }
    }
    return null;
  };

  cloudflaredProcess.stdout.on("data", (data) => {
    const text = data.toString();
    outputBuffer += text;
    process.stdout.write(text);
    
    if (!urlFound) {
      const url = parseUrl(text);
      if (url) {
        tunnelUrl = url;
        const domain = url.replace('https://', '').split('/')[0];
        
        if (targetDomain && domain === targetDomain) {
          urlFound = true;
          log(`\n\n${"=".repeat(60)}`, "green");
          log(`✅ Cloudflare Tunnel đã sẵn sàng với URL ĐÚNG!`, "green");
          log(`${"=".repeat(60)}\n`, "green");
          log(`🌐 Public URL: ${tunnelUrl}`, "cyan");
          log(`📡 IPN URL: ${tunnelUrl}/api/webhooks/vnpay/ipn\n`, "cyan");
          log(`✅ Domain khớp với .env: ${domain}`, "green");
          log(`\n⚠️  Giữ terminal này MỞ để Cloudflare Tunnel tiếp tục chạy!`, "yellow");
          log(`   Nhấn Ctrl+C để dừng\n`, "yellow");
        } else if (!targetDomain) {
          urlFound = true;
          log(`\n\n${"=".repeat(60)}`, "green");
          log(`✅ Cloudflare Tunnel đã sẵn sàng!`, "green");
          log(`${"=".repeat(60)}\n`, "green");
          log(`🌐 Public URL: ${tunnelUrl}`, "cyan");
          log(`📡 IPN URL: ${tunnelUrl}/api/webhooks/vnpay/ipn\n`, "cyan");
          log(`💡 Bước tiếp theo:`, "yellow");
          log(`   1. Copy IPN URL ở trên`, "yellow");
          log(`   2. Cập nhật VNP_IPN_URL trong .env`, "yellow");
          log(`   3. Update IPN URL trong VNPay Merchant Portal`, "yellow");
          log(`   4. Restart server: npm run dev`, "yellow");
          log(`\n⚠️  Giữ terminal này MỞ để Cloudflare Tunnel tiếp tục chạy!`, "yellow");
          log(`   Nhấn Ctrl+C để dừng\n`, "yellow");
        } else {
          // URL không khớp, restart
          log(`\n⚠️  URL không khớp: ${domain} (cần: ${targetDomain})`, "yellow");
          log(`   Đang restart Cloudflare Tunnel...\n`, "yellow");
          cloudflaredProcess.kill();
          setTimeout(() => startCloudflare(), 2000);
        }
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
        const domain = url.replace('https://', '').split('/')[0];
        
        if (targetDomain && domain === targetDomain) {
          urlFound = true;
          log(`\n\n${"=".repeat(60)}`, "green");
          log(`✅ Cloudflare Tunnel đã sẵn sàng với URL ĐÚNG!`, "green");
          log(`${"=".repeat(60)}\n`, "green");
          log(`🌐 Public URL: ${tunnelUrl}`, "cyan");
          log(`📡 IPN URL: ${tunnelUrl}/api/webhooks/vnpay/ipn\n`, "cyan");
          log(`✅ Domain khớp với .env: ${domain}`, "green");
          log(`\n⚠️  Giữ terminal này MỞ để Cloudflare Tunnel tiếp tục chạy!`, "yellow");
          log(`   Nhấn Ctrl+C để dừng\n`, "yellow");
        } else if (!targetDomain) {
          urlFound = true;
          log(`\n\n${"=".repeat(60)}`, "green");
          log(`✅ Cloudflare Tunnel đã sẵn sàng!`, "green");
          log(`${"=".repeat(60)}\n`, "green");
          log(`🌐 Public URL: ${tunnelUrl}`, "cyan");
          log(`📡 IPN URL: ${tunnelUrl}/api/webhooks/vnpay/ipn\n`, "cyan");
        } else {
          cloudflaredProcess.kill();
          setTimeout(() => startCloudflare(), 2000);
        }
      }
    }
  });

  cloudflaredProcess.on("error", (error) => {
    log(`\n❌ Lỗi: ${error.message}`, "red");
    process.exit(1);
  });

  cloudflaredProcess.on("exit", (code) => {
    if (code !== 0 && code !== null && !urlFound) {
      // Process exited but URL not found yet, might be restarting
      if (targetDomain && attempts < maxAttempts) {
        // Will be restarted by timeout or error handler
      }
    }
  });

  // Handle Ctrl+C
  process.on("SIGINT", () => {
    log("\n\n⚠️  Đang dừng Cloudflare Tunnel...", "yellow");
    cloudflaredProcess.kill();
    process.exit(0);
  });
}

startCloudflare();

