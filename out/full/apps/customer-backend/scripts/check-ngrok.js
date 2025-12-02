// scripts/check-ngrok.js
// Script kiểm tra ngrok đang chạy và lấy URL

import https from "https";

const NGROK_API = "http://localhost:4040/api/tunnels";

console.log("🔍 Kiểm tra ngrok...\n");

try {
  const response = await fetch(NGROK_API);
  const data = await response.json();

  if (!data.tunnels || data.tunnels.length === 0) {
    console.log("❌ Không tìm thấy ngrok tunnel nào!");
    console.log("\n💡 Hãy chạy: ./scripts/setup-vnpay-dev.sh");
    process.exit(1);
  }

  const httpsTunnel = data.tunnels.find((t) => t.proto === "https");
  const httpTunnel = data.tunnels.find((t) => t.proto === "http");

  if (httpsTunnel) {
    console.log("✅ Ngrok đang chạy!");
    console.log(`\n📍 Public URL: ${httpsTunnel.public_url}`);
    console.log(`   Local URL: ${httpsTunnel.config.addr}`);
    console.log(`\n💡 IPN URL nên là: ${httpsTunnel.public_url}/api/webhooks/vnpay/ipn`);
  } else if (httpTunnel) {
    console.log("⚠️  Ngrok đang chạy nhưng chỉ có HTTP (không có HTTPS)");
    console.log(`\n📍 Public URL: ${httpTunnel.public_url}`);
    console.log(`   Local URL: ${httpTunnel.config.addr}`);
    console.log(`\n💡 IPN URL nên là: ${httpTunnel.public_url}/api/webhooks/vnpay/ipn`);
    console.log("\n⚠️  Lưu ý: VNPay khuyến nghị dùng HTTPS cho IPN URL");
  } else {
    console.log("❌ Không tìm thấy tunnel phù hợp!");
    process.exit(1);
  }
} catch (error) {
  if (error.code === "ECONNREFUSED") {
    console.log("❌ Ngrok không chạy hoặc không accessible!");
    console.log("\n💡 Hãy chạy: ./scripts/setup-vnpay-dev.sh");
  } else {
    console.error("❌ Lỗi:", error.message);
  }
  process.exit(1);
}

