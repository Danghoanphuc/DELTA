// scripts/setup-cloudflare-tunnel.js
// Script setup Cloudflare Tunnel thay ngrok (không có warning page)

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
  const isWindows = process.platform === "win32";
  
  try {
    execSync(`${command} --version`, { 
      stdio: "ignore",
      shell: isWindows 
    });
    return true;
  } catch {
    // Try with npx for npm packages
    try {
      execSync(`npx ${command} --version`, { 
        stdio: "ignore",
        shell: isWindows 
      });
      return true;
    } catch {
      return false;
    }
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
  log(`✅ Đã cập nhật VNP_IPN_URL="${ipnUrl}"`, "green");
}

async function main() {
  log("🚀 Setup Cloudflare Tunnel cho VNPay\n", "blue");
  log("💡 Cloudflare Tunnel KHÔNG CÓ warning page - VNPay có thể gọi được!\n", "yellow");

  // Check cloudflared
  if (!checkCommand("cloudflared")) {
    log("❌ cloudflared chưa được cài đặt!", "red");
    log("\nHãy cài đặt cloudflared:", "yellow");
    log("  Windows: choco install cloudflared", "yellow");
    log("  Mac: brew install cloudflared", "yellow");
    log("  Linux: https://developers.cloudflare.com/cloudflare-one/connections/connect-apps/install-and-setup/installation/", "yellow");
    log("\nHoặc download từ: https://github.com/cloudflare/cloudflared/releases", "yellow");
    process.exit(1);
  }
  log("✅ cloudflared đã sẵn sàng", "green");

  // Check .env
  if (!existsSync(ENV_FILE)) {
    log("❌ Không tìm thấy file .env!", "red");
    process.exit(1);
  }
  log("✅ Tìm thấy file .env", "green");

  // Start cloudflared
  log("\n🌐 Đang khởi động Cloudflare Tunnel...", "blue");
  
  // Determine command
  const isWindows = process.platform === "win32";
  let cloudflaredCmd = "cloudflared";
  let useNpx = false;
  
  try {
    execSync("cloudflared --version", { 
      stdio: "ignore",
      shell: isWindows 
    });
  } catch {
    useNpx = true;
    cloudflaredCmd = isWindows ? "npx.cmd" : "npx";
    log("   Dùng npx cloudflared...", "yellow");
  }
  
  const cloudflaredArgs = useNpx 
    ? ["cloudflared", "tunnel", "--url", "http://localhost:8000"]
    : ["tunnel", "--url", "http://localhost:8000"];
  
  log(`   Command: ${cloudflaredCmd} ${cloudflaredArgs.join(" ")}`, "yellow");
  
  const cloudflaredProcess = spawn(
    isWindows && !useNpx ? "cloudflared.cmd" : cloudflaredCmd,
    cloudflaredArgs,
    {
      detached: false,
      stdio: ["ignore", "pipe", "pipe"],
      shell: isWindows && useNpx, // Use shell on Windows with npx
    }
  );

  let tunnelUrl = null;
  let outputBuffer = "";
  let urlFound = false;

  cloudflaredProcess.stdout.on("data", (data) => {
    const text = data.toString();
    outputBuffer += text;
    process.stdout.write(text);

    // Parse URL from output - Cloudflare có nhiều format
    if (!tunnelUrl) {
      const urlPatterns = [
        /https:\/\/[a-z0-9-]+\.trycloudflare\.com/g,
        /https:\/\/[a-z0-9-]+\.cloudflare\.com/g,
        /Visit at:\s*(https:\/\/[^\s]+)/gi,
        /(https:\/\/[a-z0-9-]+\.trycloudflare\.com)/gi,
        /https:\/\/[a-z0-9-]+\.trycloudflare\.com[^\s]*/g,
      ];

      for (const pattern of urlPatterns) {
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
          // Lấy match đầu tiên và clean up
          let foundUrl = matches[0];
          // Remove "Visit at:" prefix nếu có
          foundUrl = foundUrl.replace(/Visit at:\s*/i, '').trim();
          // Remove trailing characters không phải URL
          foundUrl = foundUrl.split(/\s|$/)[0];
          
          if (foundUrl.startsWith('https://') && foundUrl.includes('.trycloudflare.com')) {
            tunnelUrl = foundUrl;
            urlFound = true;
            log(`\n✅ Tìm thấy URL: ${tunnelUrl}`, "green");
            break;
          }
        }
      }
    }
  });

  cloudflaredProcess.stderr.on("data", (data) => {
    const text = data.toString();
    outputBuffer += text;
    process.stderr.write(text);
    
    // Cũng tìm URL trong stderr
    if (!tunnelUrl) {
      const urlPatterns = [
        /https:\/\/[a-z0-9-]+\.trycloudflare\.com/g,
        /https:\/\/[a-z0-9-]+\.cloudflare\.com/g,
      ];
      
      for (const pattern of urlPatterns) {
        const matches = text.match(pattern);
        if (matches && matches.length > 0) {
          tunnelUrl = matches[0].trim();
          urlFound = true;
          log(`\n✅ Tìm thấy URL (từ stderr): ${tunnelUrl}`, "green");
          break;
        }
      }
    }
  });

  // Wait for tunnel URL (tối đa 20 giây)
  log("\n⏳ Đang chờ Cloudflare Tunnel khởi động...", "blue");
  for (let i = 0; i < 20; i++) {
    await new Promise((resolve) => setTimeout(resolve, 1000));
    if (urlFound && tunnelUrl) {
      break;
    }
    if (i % 3 === 0) {
      process.stdout.write(".");
    }
    
    // Check buffer periodically
    if (!tunnelUrl && i % 2 === 0 && outputBuffer.length > 0) {
      const urlPatterns = [
        /https:\/\/[a-z0-9-]+\.trycloudflare\.com/g,
        /https:\/\/[a-z0-9-]+\.cloudflare\.com/g,
      ];
      
      for (const pattern of urlPatterns) {
        const matches = outputBuffer.match(pattern);
        if (matches && matches.length > 0) {
          tunnelUrl = matches[0].trim();
          urlFound = true;
          log(`\n✅ Tìm thấy URL (từ buffer): ${tunnelUrl}`, "green");
          break;
        }
      }
    }
  }

  // Try to extract URL from buffer one more time
  if (!tunnelUrl && outputBuffer.length > 0) {
    const urlPatterns = [
      /https:\/\/[a-z0-9-]+\.trycloudflare\.com/g,
      /https:\/\/[a-z0-9-]+\.cloudflare\.com/g,
    ];
    
    for (const pattern of urlPatterns) {
      const matches = outputBuffer.match(pattern);
      if (matches && matches.length > 0) {
        tunnelUrl = matches[0].trim();
        urlFound = true;
        log(`\n✅ Tìm thấy URL (final check): ${tunnelUrl}`, "green");
        break;
      }
    }
  }

  if (!tunnelUrl) {
    log("\n\n⚠️  Không thể tự động lấy URL từ output", "yellow");
    log("\n📋 Output từ cloudflared:", "blue");
    log(outputBuffer.substring(Math.max(0, outputBuffer.length - 500)), "reset");
    log("\n💡 Hãy làm theo các bước sau:", "yellow");
    log("1. Xem output từ cloudflared ở trên", "yellow");
    log("2. Tìm dòng có URL dạng: https://abc123.trycloudflare.com", "yellow");
    log("3. Copy URL đó và chạy:", "yellow");
    log(`   node scripts/update-ipn-url.js <cloudflare-url>`, "yellow");
    log("\n⚠️  Giữ terminal cloudflared MỞ khi test!", "yellow");
    log("\n💡 Hoặc nhấn Ctrl+C và chạy lại script", "yellow");
    process.exit(0); // Exit 0 vì cloudflared vẫn đang chạy
  }

  log(`\n✅ Cloudflare Tunnel URL: ${tunnelUrl}`, "green");

  // Update .env
  const ipnUrl = `${tunnelUrl}/api/webhooks/vnpay/ipn`;
  log("\n📝 Đang cập nhật .env...", "blue");
  updateEnvFile(ipnUrl);

  // Summary
  log("\n" + "=".repeat(50), "green");
  log("✅ Setup hoàn tất!", "green");
  log("=".repeat(50) + "\n", "green");
  log("📋 Thông tin:", "blue");
  log(`  Cloudflare Tunnel URL: ${tunnelUrl}`);
  log(`  IPN URL: ${ipnUrl}`);
  log("\n⚠️  Lưu ý:", "yellow");
  log("  - Cloudflare Tunnel đang chạy (không có warning page!)");
  log("  - URL sẽ thay đổi mỗi lần restart");
  log("  - Hãy restart server để load .env mới: npm run dev");
  log("\n💡 Bước tiếp theo:", "blue");
  log("  1. Restart server: npm run dev");
  log("  2. Update IPN URL trong VNPay Merchant Portal với URL mới");
  log("  3. Chạy health check: npm run health:vnpay");
  log("  4. Test thanh toán VNPay");
  log("\n🎉 Cloudflare Tunnel đã sẵn sàng (KHÔNG CÓ WARNING PAGE)!");
  
  // Keep process running
  log("\n⚠️  Giữ terminal này mở để Cloudflare Tunnel tiếp tục chạy", "yellow");
  log("   Nhấn Ctrl+C để dừng", "yellow");
}

main().catch((error) => {
  log(`\n❌ Lỗi: ${error.message}`, "red");
  process.exit(1);
});

