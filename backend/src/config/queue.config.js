// src/config/queue.config.js
// ✅ BÀN GIAO: Tích hợp Bull-Board UI

import Queue from "bull";
import { pdfRenderer } from "../infrastructure/workers/pdf-renderer.worker.js";

// ✅ BƯỚC 1: IMPORT CÁC THÀNH PHẦN CỦA BULL-BOARD
import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter";
import { ExpressAdapter } from "@bull-board/express";

// Khởi tạo queue (dùng Redis)
export const pdfQueue = new Queue("pdf-rendering", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
});

// Worker process
pdfQueue.process(async (job) => {
  const { baseProductId, editorData, dielineSvgUrl, specifications } = job.data;

  // (Chúng ta sẽ cần import pdfRenderer ở đây nếu nó chưa có)
  return await pdfRenderer.renderPDF({
    baseProductId,
    editorData,
    dielineSvgUrl,
    specifications,
  });
});

// Event listeners
pdfQueue.on("completed", (job, result) => {
  console.log(`✅ [PDF Queue] Job ${job.id} completed`);
});

pdfQueue.on("failed", (job, err) => {
  console.error(`❌ [PDF Queue] Job ${job.id} failed:`, err);
});

// ==========================================================
// ✅ BƯỚC 2: CẤU HÌNH BULL-BOARD UI
// ==========================================================

// Tạo một Express adapter cho bull-board
const serverAdapter = new ExpressAdapter();

// Đặt đường dẫn gốc cho UI (Phúc có thể đổi thành bất cứ gì)
// Người dùng sẽ truy cập: http://localhost:5001/admin/queues
serverAdapter.setBasePath("/admin/queues");

// Tạo UI board
createBullBoard({
  // Danh sách các queues muốn theo dõi
  queues: [new BullAdapter(pdfQueue)],
  // Gắn adapter của Express vào
  serverAdapter: serverAdapter,
});

// ✅ BƯỚC 3: EXPORT ROUTER CỦA ADAPTER
// Chúng ta sẽ import router này vào server.js
export const bullBoardRouter = serverAdapter.getRouter();
