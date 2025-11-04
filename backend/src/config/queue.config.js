import Queue from "bull";
import { pdfRenderer } from "../infrastructure/workers/pdf-renderer.worker.js";

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
