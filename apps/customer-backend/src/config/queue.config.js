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

// ✅ LAZY INITIALIZATION: Queue chỉ được tạo khi gọi getPdfQueue()
// Tránh kết nối Redis ngay khi import module
let _pdfQueue = null;

const PDF_QUEUE_CONCURRENCY = Math.max(
  1,
  Number(process.env.PDF_QUEUE_CONCURRENCY || 1)
);

/**
 * ✅ Lazy getter cho pdfQueue - chỉ tạo khi cần dùng
 * Đảm bảo Redis đã kết nối trước khi tạo queue
 */
export function getPdfQueue() {
  if (!_pdfQueue) {
    _pdfQueue = new Queue("pdf-rendering", {
      redis: {
        host: process.env.REDIS_HOST || "localhost",
        port: process.env.REDIS_PORT || 6379,
      },
    });

    // Worker process
    _pdfQueue.process(PDF_QUEUE_CONCURRENCY, async (job) => {
      const { baseProductId, editorData, dielineSvgUrl, specifications } = job.data;

      return await pdfRenderer.renderPDF({
        baseProductId,
        editorData,
        dielineSvgUrl,
        specifications,
      });
    });

    // Event listeners
    _pdfQueue.on("completed", (job, result) => {
      console.log(`✅ [PDF Queue] Job ${job.id} completed`);
    });

    _pdfQueue.on("failed", (job, err) => {
      console.error(`❌ [PDF Queue] Job ${job.id} failed:`, err);
    });
  }
  return _pdfQueue;
}

// ✅ Export getter function (chỉ export một lần - đã export ở trên)
// Không cần export lại vì đã export function ở trên

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

// ✅ LAZY INIT: Bull Board sẽ được khởi tạo sau khi queue được tạo
// Không tạo board ngay khi import để tránh block
let _bullBoardInitialized = false;

function initializeBullBoard() {
  if (!_bullBoardInitialized) {
    const pdfQueue = getPdfQueue();
    createBullBoard({
      queues: [new BullAdapter(pdfQueue)],
      serverAdapter: serverAdapter,
    });
    _bullBoardInitialized = true;
  }
}

// ✅ BƯỚC 3: EXPORT ROUTER CỦA ADAPTER (LAZY)
// Router sẽ được khởi tạo sau khi queue được tạo
export function getBullBoardRouter() {
  initializeBullBoard();
  return serverAdapter.getRouter();
}
