// @ts-nocheck
// src/config/queue.config.js
// ✅ BÀN GIAO: Tích hợp Bull-Board UI với chuẩn BullMQ + Upstash

import { Queue, Worker } from "bullmq"; // ✅ Dùng BullMQ chuẩn
import { createBullBoard } from "@bull-board/api";
import { BullMQAdapter } from "@bull-board/api/bullMQAdapter"; // ✅ Dùng Adapter cho BullMQ
import { ExpressAdapter } from "@bull-board/express";

import { pdfRenderer } from "../infrastructure/workers/pdf-renderer.worker.js";
import { Logger } from "../shared/utils/index.js";
import { getRedisConnectionConfig } from "../infrastructure/cache/redis-connection.helper.js";

// ✅ LAZY INITIALIZATION: Singleton variables
let _pdfQueue = null;
let _pdfWorker = null; // Giữ reference để worker không bị garbage collected
let _bullBoardInitialized = false;
let _bullBoardWarnedOnce = false;

// Config Concurrency
const PDF_QUEUE_CONCURRENCY = Math.max(
  1,
  Number(process.env.PDF_QUEUE_CONCURRENCY || 1)
);

/**
 * ✅ Lazy getter cho pdfQueue
 * Đồng thời khởi chạy Worker xử lý PDF nếu chưa chạy
 */
export async function getPdfQueue() {
  if (!_pdfQueue) {
    try {
      // 1. Lấy Connection cho Queue (Producer)
      const queueConnection = getRedisConnectionConfig();
      
      _pdfQueue = new Queue("pdf-rendering", {
        connection: queueConnection,
        defaultJobOptions: {
            removeOnComplete: true, // Xóa job xong cho nhẹ Redis
            removeOnFail: { count: 20, age: 24 * 3600 },
            attempts: 1 // Render PDF nặng, lỗi thì thôi, ko retry tự động tránh tốn tiền server
        }
      });

      // 2. Khởi chạy Worker (Consumer) ngay tại đây
      // (Vì kiến trúc cũ của bạn để worker chung config, ta giữ nguyên behavior này)
      if (!_pdfWorker) {
          const workerConnection = getRedisConnectionConfig(); // Connection riêng cho Worker
          
          _pdfWorker = new Worker("pdf-rendering", async (job) => {
             Logger.info(`[PDF Worker] 🎨 Processing job ${job.id}...`);
             const { baseProductId, editorData, dielineSvgUrl, specifications } = job.data;
             
             // Gọi Logic Render
             return await pdfRenderer.renderPDF({
                baseProductId,
                editorData,
                dielineSvgUrl,
                specifications,
             });
          }, {
              connection: workerConnection,
              concurrency: PDF_QUEUE_CONCURRENCY,
              lockDuration: 60000, // 60s
          });

          // Lắng nghe sự kiện Worker
          _pdfWorker.on("completed", (job) => {
              Logger.info(`✅ [PDF Worker] Job ${job.id} completed`);
          });
          
          _pdfWorker.on("failed", (job, err) => {
              Logger.error(`❌ [PDF Worker] Job ${job.id} failed: ${err.message}`);
          });

          _pdfWorker.on("error", (err) => {
              if (err.code === 'ECONNREFUSED') return;
              Logger.error(`[PDF Worker] Error: ${err.message}`);
          });
          
          Logger.info(`✅ [PDF Worker] Started with concurrency: ${PDF_QUEUE_CONCURRENCY}`);
      }

    } catch (error) {
      Logger.warn(`⚠️ [PDF Queue] Failed to create queue/worker: ${error.message}`);
      return null;
    }
  }
  return _pdfQueue;
}

// ==========================================================
// ✅ BƯỚC 2: CẤU HÌNH BULL-BOARD UI
// ==========================================================

const serverAdapter = new ExpressAdapter();
serverAdapter.setBasePath("/admin/queues");

async function initializeBullBoard() {
  if (!_bullBoardInitialized) {
    try {
      const pdfQueue = await getPdfQueue();

      // Chúng ta cũng cần lấy URL Preview Queue để hiển thị lên Board cho đủ bộ
      // (Dynamic import để tránh circular dependency)
      const { getUrlPreviewQueue } = await import(
        "../infrastructure/queue/url-preview.queue.js"
      );
      const urlQueue = await getUrlPreviewQueue();

      const queues = [];

      if (pdfQueue) queues.push(new BullMQAdapter(pdfQueue));
      if (urlQueue) queues.push(new BullMQAdapter(urlQueue));

      // Nếu không có queue nào (Redis down / config lỗi) -> không init BullBoard, log 1 lần
      if (queues.length === 0) {
        if (!_bullBoardWarnedOnce) {
          Logger.warn(
            "⚠️ [Bull Board] No queues available (Redis may be offline). Skipping Bull Board initialization."
          );
          _bullBoardWarnedOnce = true;
        }
        return;
      }

      createBullBoard({
        queues: queues,
        serverAdapter: serverAdapter,
      });
      _bullBoardInitialized = true;
      Logger.info("✅ [Bull Board] UI initialized at /admin/queues");
    } catch (error) {
      if (!_bullBoardWarnedOnce) {
        Logger.warn(`⚠️ [Bull Board] Init failed: ${error.message}`);
        _bullBoardWarnedOnce = true;
      }
    }
  }
}

// ✅ BƯỚC 3: EXPORT ROUTER
export async function getBullBoardRouter() {
  await initializeBullBoard();
  return serverAdapter.getRouter();
}