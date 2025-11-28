// Script để kill process đang sử dụng port trên Windows/Linux
// Usage: node scripts/kill-port.js [port]
// Example: node scripts/kill-port.js 8000

import { execSync } from "child_process";
import { platform } from "os";

const port = process.argv[2] || "8000";
const isWindows = platform() === "win32";

console.log(`🔍 Đang tìm process sử dụng port ${port}...`);

try {
  if (isWindows) {
    // Windows: Tìm PID sử dụng port
    const result = execSync(`netstat -ano | findstr :${port}`, {
      encoding: "utf-8",
    });

    if (!result.trim()) {
      console.log(`✅ Không có process nào đang sử dụng port ${port}`);
      process.exit(0);
    }

    // Parse PID từ output
    const lines = result.trim().split("\n");
    const pids = new Set();

    for (const line of lines) {
      const parts = line.trim().split(/\s+/);
      const pid = parts[parts.length - 1];
      if (pid && /^\d+$/.test(pid)) {
        pids.add(pid);
      }
    }

    if (pids.size === 0) {
      console.log(`✅ Không tìm thấy PID nào sử dụng port ${port}`);
      process.exit(0);
    }

    console.log(`📋 Tìm thấy ${pids.size} process(es) sử dụng port ${port}:`);
    for (const pid of pids) {
      try {
        const taskInfo = execSync(`tasklist /FI "PID eq ${pid}" /FO CSV /NH`, {
          encoding: "utf-8",
        });
        const taskName = taskInfo.split(",")[0]?.replace(/"/g, "") || "Unknown";
        console.log(`   - PID ${pid}: ${taskName}`);
      } catch {
        console.log(`   - PID ${pid}: (Không thể lấy thông tin)`);
      }
    }

    // Kill các process
    console.log(`\n🔪 Đang kill process(es)...`);
    for (const pid of pids) {
      try {
        execSync(`taskkill /PID ${pid} /F`, { stdio: "ignore" });
        console.log(`   ✅ Đã kill PID ${pid}`);
      } catch (error) {
        console.log(`   ⚠️ Không thể kill PID ${pid} (có thể đã bị kill hoặc không có quyền)`);
      }
    }

    console.log(`\n✅ Hoàn thành! Port ${port} đã được giải phóng.`);
  } else {
    // Linux/Mac: Sử dụng lsof hoặc fuser
    try {
      const result = execSync(`lsof -ti :${port}`, { encoding: "utf-8" });
      const pids = result.trim().split("\n").filter(Boolean);

      if (pids.length === 0) {
        console.log(`✅ Không có process nào đang sử dụng port ${port}`);
        process.exit(0);
      }

      console.log(`📋 Tìm thấy ${pids.length} process(es) sử dụng port ${port}:`);
      for (const pid of pids) {
        try {
          const psInfo = execSync(`ps -p ${pid} -o comm=`, { encoding: "utf-8" });
          console.log(`   - PID ${pid}: ${psInfo.trim() || "Unknown"}`);
        } catch {
          console.log(`   - PID ${pid}: (Không thể lấy thông tin)`);
        }
      }

      console.log(`\n🔪 Đang kill process(es)...`);
      for (const pid of pids) {
        try {
          execSync(`kill -9 ${pid}`, { stdio: "ignore" });
          console.log(`   ✅ Đã kill PID ${pid}`);
        } catch (error) {
          console.log(`   ⚠️ Không thể kill PID ${pid} (có thể đã bị kill hoặc không có quyền)`);
        }
      }

      console.log(`\n✅ Hoàn thành! Port ${port} đã được giải phóng.`);
    } catch (error) {
      // Fallback: thử dùng fuser
      try {
        execSync(`fuser -k ${port}/tcp`, { stdio: "ignore" });
        console.log(`✅ Đã kill process sử dụng port ${port}`);
      } catch {
        console.log(`❌ Không thể kill process. Vui lòng kill thủ công.`);
        process.exit(1);
      }
    }
  }
} catch (error) {
  console.error(`❌ Lỗi:`, error.message);
  process.exit(1);
}

