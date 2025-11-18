// scripts/setup-ngrok-only.js
// Script chỉ setup ngrok và update .env (không cần server chạy trước)

import { execSync, spawn } from "child_process";
import { readFileSync, writeFileSync, existsSync, copyFileSync } from "fs";
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
};

function log(message, color = "reset") {
  console.log(`${colors[color]}${message}${colors.reset}`);
}

function checkCommand(command) {
  try {
    execSync(`${command} --version`, { stdio: "ignore" });
    return true;
  } catch {
    try {
      execSync(`npx ${command} --version`, { stdio: "ignore" });
      return true;
    } catch {
      return false;
    }
  }
}

async function getNgrokUrl() {
  try {
    const response = await fetch("http://localhost:4040/api/tunnels");
    const data = await response.json();
    const httpsTunnel = data.tunnels?.find((t) => t.proto === "https");
    const httpTunnel = data.tunnels?.find((t) => t.proto === "http");
    return httpsTunnel?.public_url || httpTunnel?.public_url;
  } catch (error) {
    return null;
  }
}

function updateEnvFile(ipnUrl) {
  let envContent = readFileSync(ENV_FILE, "utf-8");
  
  // Backup
  const backupFile = `${ENV_FILE}.backup.${Date.now()}`;
  copyFileSync(ENV_FILE, backupFile);
  log(`✅ Đã backup .env`, "green");

  // Update or add VNP_IPN_URL
  if (envContent.includes("VNP_IPN_URL=")) {
    envContent = envContent.replace(
      /^VNP_IPN_URL=.*$/m,
      `VNP_IPN_URL="${ipnUrl}"`
    );
  } else {
    envContent += `\nVNP_IPN_URL="${ipnUrl}"\n`;
  }

  writeFileSync(ENV_FILE, envContent, "utf-8");
  log(`✅ Đã cập nhật VNP_IPN_URL`, "green");
}

async function waitForNgrok(maxAttempts = 15) {
  for (let i = 0; i < maxAttempts; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    const url = await getNgrokUrl();
    if (url) {
      return url;
    }
    if (i % 3 === 0) {
      process.stdout.write(".");
    }
  }
  return null;
}

async function main() {
  log("🚀 Setup Ngrok cho VNPay\n", "blue");

  // Check ngrok
  if (!checkCommand("ngrok")) {
    log("❌ ngrok chưa được cài đặt!", "red");
    log("\nĐang cài đặt ngrok...", "yellow");
    try {
      execSync("npm install -g ngrok", { stdio: "inherit" });
      log("✅ Đã cài đặt ngrok", "green");
    } catch (error) {
      log("❌ Không thể cài đặt ngrok tự động", "red");
      process.exit(1);
    }
  }
  log("✅ ngrok đã sẵn sàng", "green");

  // Check .env
  if (!existsSync(ENV_FILE)) {
    log("❌ Không tìm thấy file .env!", "red");
    process.exit(1);
  }
  log("✅ Tìm thấy file .env", "green");

  // Start ngrok
  log("\n🌐 Đang khởi động ngrok...", "blue");
  let ngrokCmd = "ngrok";
  let useNpx = false;
  
  try {
    execSync("ngrok --version", { stdio: "ignore" });
  } catch {
    useNpx = true;
    log("   Dùng npx ngrok...", "yellow");
  }
  
  const isWindows = process.platform === "win32";
  const ngrokArgs = useNpx 
    ? (isWindows ? ["ngrok", "http", "8000"] : ["ngrok", "http", "8000"])
    : ["http", "8000"];
  
  const command = useNpx ? (isWindows ? "npx.cmd" : "npx") : "ngrok";
  log(`   Command: ${command} ${ngrokArgs.join(" ")}`, "yellow");
  
  const ngrokProcess = spawn(command, ngrokArgs, {
    detached: true,
    stdio: "ignore",
    shell: isWindows, // Use shell on Windows
  });
  ngrokProcess.unref();

  // Wait for ngrok
  log("⏳ Đang chờ ngrok khởi động", "blue");
  const ngrokUrl = await waitForNgrok();

  if (!ngrokUrl) {
    log("\n❌ Không thể lấy ngrok URL!", "red");
    log("Kiểm tra xem ngrok đã start chưa", "yellow");
    log("Hoặc mở browser: http://localhost:4040", "yellow");
    process.exit(1);
  }

  log(`\n✅ Ngrok URL: ${ngrokUrl}`, "green");

  // Update .env
  const ipnUrl = `${ngrokUrl}/api/webhooks/vnpay/ipn`;
  log("\n📝 Đang cập nhật .env...", "blue");
  updateEnvFile(ipnUrl);

  // Summary
  log("\n" + "=".repeat(50), "green");
  log("✅ Setup hoàn tất!", "green");
  log("=".repeat(50) + "\n", "green");
  log("📋 Thông tin:", "blue");
  log(`  Ngrok URL: ${ngrokUrl}`);
  log(`  IPN URL: ${ipnUrl}`);
  log("\n⚠️  Lưu ý:", "yellow");
  log("  - Ngrok đang chạy ở background");
  log("  - Ngrok URL sẽ thay đổi mỗi lần restart (free plan)");
  log("  - Đảm bảo server đang chạy trên port 8000");
  log("\n💡 Bước tiếp theo:", "blue");
  log("  1. Start server: npm run dev");
  log("  2. Chạy health check: npm run health:vnpay");
  log("  3. Test thanh toán VNPay");
  log("\n🎉 Ngrok đã sẵn sàng!");
}

main().catch((error) => {
  log(`\n❌ Lỗi: ${error.message}`, "red");
  process.exit(1);
});

