// src/config/queue.config.js
// ✅ BÀN GIAO: Tích hợp Bull-Board UI

import Queue from "bull";
import { pdfRenderer } from "../infrastructure/workers/pdf-renderer.worker.js";
// ⚠️ KHÔNG import urlPreviewQueue ở top-level - sẽ được import dynamic trong server.ts
// để tránh kết nối Redis sớm

// ✅ BƯỚC 1: IMPORT CÁC THÀNH PHẦN CỦA BULL-BOARD
import { createBullBoard } from "@bull-board/api";
import { BullAdapter } from "@bull-board/api/bullAdapter";
import { ExpressAdapter } from "@bull-board/express";

// Khởi tạo queue (dùng Redis)
const PDF_QUEUE_CONCURRENCY = Math.max(
  1,
  Number(process.env.PDF_QUEUE_CONCURRENCY || 1)
);

export const pdfQueue = new Queue("pdf-rendering", {
  redis: {
    host: process.env.REDIS_HOST || "localhost",
    port: process.env.REDIS_PORT || 6379,
  },
});

// Worker process
pdfQueue.process(PDF_QUEUE_CONCURRENCY, async (job) => {
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
// ✅ URL PREVIEW QUEUE: Worker Process
// ==========================================================
// ⚠️ LƯU Ý: Worker được khởi chạy trực tiếp trong server.ts sau khi Redis kết nối
// Không khởi chạy ở đây để tránh duplicate processing
// Worker sẽ được khởi chạy với: urlPreviewQueue.process(1, async (job) => {...})

// ==========================================================
// ✅ BƯỚC 2: CẤU HÌNH BULL-BOARD UI
// ==========================================================

// Tạo một Express adapter cho bull-board
const serverAdapter = new ExpressAdapter();

// Đặt đường dẫn gốc cho UI (Phúc có thể đổi thành bất cứ gì)
// Người dùng sẽ truy cập: http://localhost:5001/admin/queues
serverAdapter.setBasePath("/admin/queues");

// ✅ Tạo UI board (chỉ với pdfQueue, urlPreviewQueue sẽ được thêm sau trong server.ts)
createBullBoard({
  queues: [new BullAdapter(pdfQueue)],
  serverAdapter: serverAdapter,
});

// ✅ BƯỚC 3: EXPORT ROUTER CỦA ADAPTER
// Chúng ta sẽ import router này vào server.js
export const bullBoardRouter = serverAdapter.getRouter();
